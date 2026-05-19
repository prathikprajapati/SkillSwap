
import request from "supertest";
import { PrismaClient } from "@prisma/client";

import app from "../../src/server";

const prisma = new PrismaClient();

describe("Messages Endpoints", () => {
  let authToken1: string;
  let authToken2: string;
  let userId1: string;
  let userId2: string;
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

    // Create two test users
    const signupResponse1 = await request(app).post("/auth/signup").send({
      email: "msguser1@example.com",
      password: "password123",
      name: "Message User One",
    });
    authToken1 = signupResponse1.body.token;
    userId1 = signupResponse1.body.user.id;

    const signupResponse2 = await request(app).post("/auth/signup").send({
      email: "msguser2@example.com",
      password: "password123",
      name: "Message User Two",
    });
    authToken2 = signupResponse2.body.token;
    userId2 = signupResponse2.body.user.id;

    // Create a match
    await request(app)
      .post("/requests")
      .set("Authorization", `Bearer ${authToken1}`)
      .send({ receiver_id: userId2 });

    const incomingResponse = await request(app)
      .get("/requests/incoming")
      .set("Authorization", `Bearer ${authToken2}`);
    const requestId = incomingResponse.body[0].id;

    const acceptResponse = await request(app)
      .put(`/requests/${requestId}/accept`)
      .set("Authorization", `Bearer ${authToken2}`);
    matchId = acceptResponse.body.match.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /matches/:id/messages", () => {
    it("should return messages for a match", async () => {
      const response = await request(app)
        .get(`/matches/${matchId}/messages`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);

      // Should return paginated response with data and pagination
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return 401 for unauthorized user", async () => {
      const response = await request(app)
        .get(`/matches/${matchId}/messages`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 404 for non-existent match", async () => {
      const fakeMatchId = "00000000-0000-0000-0000-000000000000";
      const response = await request(app)
        .get(`/matches/${fakeMatchId}/messages`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /messages", () => {
    it("should send a message in a match", async () => {
      const messageData = {
        match_id: matchId,
        content: "Hello, this is a test message!",
      };

      const response = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${authToken1}`)
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.content).toBe(messageData.content);
      expect(response.body.sender_id).toBe(userId1);
    });

    it("should return 400 for empty message content", async () => {
      const response = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ match_id: matchId, content: "" })
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should return 404 for non-existent match", async () => {
      const fakeMatchId = "00000000-0000-0000-0000-000000000000";
      const response = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ match_id: fakeMatchId, content: "Test" })
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 401 for user not in match", async () => {
      // Create third user not in match
      const signupResponse3 = await request(app).post("/auth/signup").send({
        email: "msguser3@example.com",
        password: "password123",
        name: "Message User Three",
      });
      const authToken3 = signupResponse3.body.token;

      const response = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${authToken3}`)
        .send({ match_id: matchId, content: "Unauthorized message" })
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /messages/:id/read", () => {
    let messageId: string;

    beforeAll(async () => {
      // Create a message to mark as read
      const msgResponse = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ match_id: matchId, content: "Message to read" });
      messageId = msgResponse.body.id;
    });

    it("should mark message as read", async () => {
      await request(app)
        .put(`/messages/${messageId}/read`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(200);

      // Verify message is marked as read
      const messagesResponse = await request(app)
        .get(`/matches/${matchId}/messages`)
        .set("Authorization", `Bearer ${authToken2}`);

      const message = messagesResponse.body.data.find(
        (m: any) => m.id === messageId,
      );
      expect(message.is_read).toBe(true);
    });

    it("should return 403 when marking own message as read", async () => {
      const response = await request(app)
        .put(`/messages/${messageId}/read`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 404 for non-existent message", async () => {
      const fakeMessageId = "00000000-0000-0000-0000-000000000000";
      const response = await request(app)
        .put(`/messages/${fakeMessageId}/read`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /messages/:id", () => {
    let messageToDelete: string;

    beforeAll(async () => {
      // Create a message to delete
      const msgResponse = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ match_id: matchId, content: "Message to delete" });
      messageToDelete = msgResponse.body.id;
    });

    it("should delete own message", async () => {
      await request(app)
        .delete(`/messages/${messageToDelete}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);
    });

    it("should not allow deleting another user's message", async () => {
      // Create message by user1
      const msgResponse = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ match_id: matchId, content: "User1 message" });
      const messageId = msgResponse.body.id;

      // Try to delete with user2
      const response = await request(app)
        .delete(`/messages/${messageId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });
});

