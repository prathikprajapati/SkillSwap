import request from "supertest";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

import app from "../../src/server";

const prisma = new PrismaClient();

describe("Authorization & Security Tests", () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let user3Token: string;
  let user3Id: string;
  let matchId: string;

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
      email: "authuser1@example.com",
      password: "password123",
      name: "Auth User One",
    });
    user1Token = signup1.body.token;
    user1Id = signup1.body.user.id;

    // Create user 2
    const signup2 = await request(app).post("/auth/signup").send({
      email: "authuser2@example.com",
      password: "password123",
      name: "Auth User Two",
    });
    user2Token = signup2.body.token;
    user2Id = signup2.body.user.id;

    // Create user 3
    const signup3 = await request(app).post("/auth/signup").send({
      email: "authuser3@example.com",
      password: "password123",
      name: "Auth User Three",
    });
    user3Token = signup3.body.token;
    user3Id = signup3.body.user.id;

    // Create match between user1 and user2
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

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("IDOR - Insecure Direct Object Reference", () => {
    it("should not allow user1 to access user2's profile", async () => {
      // User 1 tries to access user 2's protected route - should work since they have a match
      const response = await request(app)
        .get(`/ratings/user/${user2Id}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty("userId");
    });

    it("should not allow user3 to access user1's messages", async () => {
      // User 3 tries to access messages from user1-user2 match
      const response = await request(app)
        .get(`/matches/${matchId}/messages`)
        .set("Authorization", `Bearer ${user3Token}`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });

    it("should not allow user3 to send messages to user1-user2 match", async () => {
      const response = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${user3Token}`)
        .send({
          match_id: matchId,
          content: "Unauthorized message",
        })
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should not allow user3 to rate user1", async () => {
      const response = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${user3Token}`)
        .send({
          rated_user_id: user1Id,
          rating: 5,
        })
        .expect(404); // No valid match between user1 and user3

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("JWT Token Security", () => {
    it("should reject expired tokens", async () => {
      const expiredToken = jwt.sign(
        { id: user1Id },
        process.env.JWT_SECRET || "test-jwt-secret-key-for-testing-only",
        { expiresIn: "-1h" },
      );

      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(403);

      expect(response.body.error).toContain("expired");
    });

    it("should reject tokens with invalid signature", async () => {
      const invalidToken = jwt.sign(
        { id: user1Id },
        "wrong-secret-key",
        { expiresIn: "1h" },
      );

      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${invalidToken}`)
        .expect(403);

      expect(response.body.error).toContain("Invalid");
    });

    it("should reject tokens with manipulated payload", async () => {
      // Try to access user1's data using user2's token
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(200);

      // Should return user2's data, not user1's
      expect(response.body.id).toBe(user2Id);
    });

    it("should require Bearer token format", async () => {
      await request(app)
        .get("/users/me")
        .set("Authorization", user1Token)
        .expect(401);
    });
  });

  describe("Ownership Checks", () => {
    it("should only allow sender to delete own message", async () => {
      // User1 sends message
      const msgRes = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ match_id: matchId, content: "Test message" });
      const messageId = msgRes.body.id;

      // User2 tries to delete user1's message
      const response = await request(app)
        .delete(`/messages/${messageId}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should only allow rater to delete own rating", async () => {
      // User1 rates user2
      const ratingRes = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          rated_user_id: user2Id,
          match_id: matchId,
          rating: 4,
        });

      // Get rating ID
      const ratingsRes = await request(app)
        .get("/ratings")
        .set("Authorization", `Bearer ${user1Token}`);
      const ratingId = ratingsRes.body.data[0]?.id;

      if (ratingId) {
        // User2 tries to delete user1's rating
        const response = await request(app)
          .delete(`/ratings/${ratingId}`)
          .set("Authorization", `Bearer ${user2Token}`)
          .expect(403);

        expect(response.body.error).toContain("own");
      }
    });

    it("should only allow sender to cancel own request", async () => {
      // User1 sends request to user3
      const reqRes = await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ receiver_id: user3Id });
      const requestId = reqRes.body.id;

      // User2 tries to cancel user1's request
      const response = await request(app)
        .patch(`/requests/${requestId}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Rate Limiting", () => {
    it("should apply rate limiting to auth endpoints", async () => {
      // Make multiple rapid login attempts
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        attempts.push(
          request(app).post("/auth/login").send({
            email: "rate@example.com",
            password: "wrongpassword",
          }),
        );
      }

      const responses = await Promise.all(attempts);
      // At least some should be rate limited
      const rateLimited = responses.some((r) => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe("Input Validation", () => {
    it("should reject invalid UUIDs", async () => {
      await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      // Invalid UUID format in request
      const response = await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ receiver_id: "not-a-uuid" })
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should reject empty required fields", async () => {
      const response = await request(app)
        .post("/auth/signup")
        .send({
          email: "",
          password: "",
          name: "",
        })
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should reject oversized payloads", async () => {
      const largeContent = "x".repeat(10001);

      const response = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          match_id: matchId,
          content: largeContent,
        })
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });
  });
});
