import request from "supertest";
import { PrismaClient } from "@prisma/client";

import app from "../../src/server";

const prisma = new PrismaClient();

describe("Concurrency & Race Condition Tests", () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let user3Token: string;
  let user3Id: string;

  beforeAll(async () => {
    // Complete database cleanup FIRST to avoid pollution
    await prisma.message.deleteMany();
    await prisma.match.deleteMany();
    await prisma.matchRequest.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.xPTransaction.deleteMany();
    await prisma.userSkill.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.user.deleteMany();

    // Create user 1
    const signup1 = await request(app).post("/auth/signup").send({
      email: "concuser1@example.com",
      password: "password123",
      name: "Conc User One",
    });
    user1Token = signup1.body.token;
    user1Id = signup1.body.user.id;

    // Create user 2
    const signup2 = await request(app).post("/auth/signup").send({
      email: "concuser2@example.com",
      password: "password123",
      name: "Conc User Two",
    });
    user2Token = signup2.body.token;
    user2Id = signup2.body.user.id;

    // Create user 3
    const signup3 = await request(app).post("/auth/signup").send({
      email: "concuser3@example.com",
      password: "password123",
      name: "Conc User Three",
    });
    user3Token = signup3.body.token;
    user3Id = signup3.body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Double Request Submission", () => {
    it("should handle concurrent match requests to same user", async () => {
      // User 1 sends multiple concurrent requests to user 2
      const requests = [];
      for (let i = 0; i < 3; i++) {
        requests.push(
          request(app)
            .post("/requests")
            .set("Authorization", `Bearer ${user1Token}`)
            .send({ receiver_id: user2Id }),
        );
      }

      const responses = await Promise.all(requests);

      // Only one should succeed (201), others should fail (409)
      const successCount = responses.filter((r) => r.status === 201).length;
      const conflictCount = responses.filter((r) => r.status === 409).length;

      expect(successCount).toBe(1);
      expect(conflictCount).toBe(2);
    });

    it("should handle rapid request accept attempts", async () => {
      // First, cancel any existing request
      const existingRequests = await prisma.matchRequest.findMany({
        where: {
          sender_id: user3Id,
          receiver_id: user2Id,
        },
      });

      for (const req of existingRequests) {
        await prisma.matchRequest.delete({ where: { id: req.id } });
      }

      // Create a new request
      await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${user3Token}`)
        .send({ receiver_id: user2Id });

      // Get the request ID
      const incomingReqs = await request(app)
        .get("/requests/incoming")
        .set("Authorization", `Bearer ${user2Token}`);
      const requestId = incomingReqs.body.find(
        (r: any) => r.sender_id === user3Id,
      )?.id;

      if (requestId) {
        // Try to accept the same request multiple times concurrently
        const acceptAttempts = [];
        for (let i = 0; i < 3; i++) {
          acceptAttempts.push(
            request(app)
              .put(`/requests/${requestId}/accept`)
              .set("Authorization", `Bearer ${user2Token}`),
          );
        }

        const acceptResponses = await Promise.all(acceptAttempts);

        // Only one should succeed
        const successCount = acceptResponses.filter(
          (r) => r.status === 200,
        ).length;
        expect(successCount).toBe(1);

        // Verify only one match was created
        const matchCount = await prisma.match.count({
          where: {
            OR: [
              { user1_id: user3Id, user2_id: user2Id },
              { user1_id: user2Id, user2_id: user3Id },
            ],
          },
        });
        expect(matchCount).toBe(1);
      }
    });
  });

  describe("Double Rating Submission", () => {
    let matchId: string;

    beforeAll(async () => {
      // Create a new match between user1 and user3
      await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ receiver_id: user3Id });

      const incoming = await request(app)
        .get("/requests/incoming")
        .set("Authorization", `Bearer ${user3Token}`);
      const requestId = incoming.body[0].id;

      const acceptRes = await request(app)
        .put(`/requests/${requestId}/accept`)
        .set("Authorization", `Bearer ${user3Token}`);
      matchId = acceptRes.body.match.id;
    });

    it("should handle concurrent ratings from both users", async () => {
      // Both users try to rate each other at the same time
      const ratingAttempts = [
        request(app)
          .post("/ratings")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({
            rated_user_id: user3Id,
            match_id: matchId,
            rating: 5,
          }),
        request(app)
          .post("/ratings")
          .set("Authorization", `Bearer ${user3Token}`)
          .send({
            rated_user_id: user1Id,
            match_id: matchId,
            rating: 4,
          }),
      ];

      const responses = await Promise.all(ratingAttempts);

      // Both should succeed
      const successCount = responses.filter((r) => r.status === 201).length;
      expect(successCount).toBe(2);

      // Verify match status is now completed
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });
      expect(match?.status).toBe("completed");

      // Verify both ratings exist
      const ratingsCount = await prisma.rating.count({
        where: { match_id: matchId },
      });
      expect(ratingsCount).toBe(2);
    });

    it("should prevent duplicate rating submission", async () => {
      // Try to rate again after already rating
      const duplicateRatingResponse = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          rated_user_id: user3Id,
          match_id: matchId,
          rating: 4,
        });

      expect(duplicateRatingResponse.status).toBe(409);
    });
  });

  describe("Rapid Match Generation", () => {
    it("should handle rapid multiple request creations", async () => {
      // Clean up any existing requests
      await prisma.matchRequest.deleteMany({
        where: {
          OR: [
            { sender_id: user1Id, receiver_id: user2Id },
            { sender_id: user2Id, receiver_id: user1Id },
          ],
        },
      });
      await prisma.match.deleteMany({
        where: {
          OR: [
            { user1_id: user1Id, user2_id: user2Id },
            { user1_id: user2Id, user2_id: user1Id },
          ],
        },
      });

      // User 1 rapidly sends requests
      const rapidRequests = [];
      for (let i = 0; i < 5; i++) {
        rapidRequests.push(
          request(app)
            .post("/requests")
            .set("Authorization", `Bearer ${user1Token}`)
            .send({ receiver_id: user2Id }),
        );
      }

      const responses = await Promise.all(rapidRequests);

      // Only one should succeed
      const successCount = responses.filter((r) => r.status === 201).length;
      expect(successCount).toBe(1);

      // Verify only one request exists
      const requestCount = await prisma.matchRequest.count({
        where: {
          sender_id: user1Id,
          receiver_id: user2Id,
        },
      });
      expect(requestCount).toBe(1);
    });
  });

  describe("Message Flood Protection", () => {
    let matchId: string;

    beforeAll(async () => {
      // Create a new match
      await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ receiver_id: user2Id });

      const incoming = await request(app)
        .get("/requests/incoming")
        .set("Authorization", `Bearer ${user2Token}`);
      const requestId = incoming.body[0].id;

      const acceptRes = await request(app)
        .put(`/requests/${requestId}/accept`)
        .set("Authorization", `Bearer ${user2Token}`);
      matchId = acceptRes.body.match.id;
    });

    it("should handle rapid message sending", async () => {
      // Send 10 messages rapidly
      const messagePromises = [];
      for (let i = 0; i < 10; i++) {
        messagePromises.push(
          request(app)
            .post("/messages")
            .set("Authorization", `Bearer ${user1Token}`)
            .send({
              match_id: matchId,
              content: `Rapid message ${i}`,
            }),
        );
      }

      const responses = await Promise.all(messagePromises);

      // All should succeed
      const successCount = responses.filter((r) => r.status === 201).length;
      expect(successCount).toBe(10);

      // Verify all messages were created
      const messageCount = await prisma.message.count({
        where: { match_id: matchId },
      });
      expect(messageCount).toBeGreaterThanOrEqual(10);
    });
  });

  describe("Account Deletion While Active", () => {
    it("should handle deletion during message operations", async () => {
      // Create a temporary user
      const tempSignup = await request(app).post("/auth/signup").send({
        email: `temp_${Date.now()}@example.com`,
        password: "password123",
        name: "Temp User",
      });
      const tempToken = tempSignup.body.token;
      const tempId = tempSignup.body.user.id;

      // Create a match with user1
      await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ receiver_id: tempId });

      const incoming = await request(app)
        .get("/requests/incoming")
        .set("Authorization", `Bearer ${tempToken}`);
      const requestId = incoming.body[0].id;

      await request(app)
        .put(`/requests/${requestId}/accept`)
        .set("Authorization", `Bearer ${tempToken}`);

      // Get match ID
      const matches = await request(app)
        .get("/matches")
        .set("Authorization", `Bearer ${user1Token}`);
      const matchId = matches.body.data.find(
        (m: any) =>
          (m.user1_id === user1Id && m.user2_id === tempId) ||
          (m.user1_id === tempId && m.user2_id === user1Id),
      )?.id;

      // Try to send message and delete account concurrently
      const concurrentOps = [
        request(app)
          .post("/messages")
          .set("Authorization", `Bearer ${user1Token}`)
          .send({ match_id: matchId, content: "Message before deletion" }),
        request(app)
          .patch("/users/me")
          .set("Authorization", `Bearer ${tempToken}`),
      ];

      const responses = await Promise.all(concurrentOps);

      // Both operations should complete (no crash)
      expect(responses[0].status).toBe(201);
      expect(responses[1].status).toBe(200);

      // Verify the deleted user can no longer perform actions
      const deletedUserResponse = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${tempToken}`);

      expect(deletedUserResponse.status).toBe(403);
    });
  });
});
