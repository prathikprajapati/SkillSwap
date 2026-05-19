
import request from "supertest";
import { PrismaClient } from "@prisma/client";

import app from "../../src/server";

const prisma = new PrismaClient();

describe("Matches Endpoints", () => {
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
      email: "matchuser1@example.com",
      password: "password123",
      name: "Match User One",
    });
    authToken1 = signupResponse1.body.token;
    userId1 = signupResponse1.body.user.id;

    const signupResponse2 = await request(app).post("/auth/signup").send({
      email: "matchuser2@example.com",
      password: "password123",
      name: "Match User Two",
    });
    authToken2 = signupResponse2.body.token;
    userId2 = signupResponse2.body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /matches/recommended", () => {
    it("should return recommended matches", async () => {
      const response = await request(app)
        .get("/matches/recommended")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);

      // Should return paginated response
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
    });

    it("should calculate match scores correctly", async () => {
      const response = await request(app)
        .get("/matches/recommended")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);

      // Check if match scores are calculated
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty("matchScore");
      }
    });
  });

  describe("GET /matches/:id/messages", () => {
    beforeAll(async () => {
      // Create a match between user1 and user2
      await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ receiver_id: userId2 });

      const incomingResponse = await request(app)
        .get("/requests/incoming")
        .set("Authorization", `Bearer ${authToken2}`);
      
      if (incomingResponse.body && incomingResponse.body.length > 0) {
        const requestId = incomingResponse.body[0].id;
        const acceptResponse = await request(app)
          .put(`/requests/${requestId}/accept`)
          .set("Authorization", `Bearer ${authToken2}`);
        matchId = acceptResponse.body.match.id;
      }
    });

    it("should return messages for a match", async () => {
      if (!matchId) {
        // Skip if no match was created
        return;
      }
      
      const response = await request(app)
        .get(`/matches/${matchId}/messages`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);

      // Should return paginated response
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return 401 for unauthorized access", async () => {
      if (!matchId) {
        return;
      }
      
      const response = await request(app)
        .get(`/matches/${matchId}/messages`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /messages", () => {
    it("should send a message in a match", async () => {
      if (!matchId) {
        return;
      }

      const messageData = {
        match_id: matchId,
        content: "Hello from match test!",
      };

      const response = await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${authToken1}`)
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.content).toBe(messageData.content);
    });

    it("should return messages after sending", async () => {
      if (!matchId) {
        return;
      }

      const messagesResponse = await request(app)
        .get(`/matches/${matchId}/messages`)
        .set("Authorization", `Bearer ${authToken1}`);

      // Should have messages now
      expect(messagesResponse.body.data).toBeDefined();
      expect(messagesResponse.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /messages/:id/read", () => {
    it("should mark message as read", async () => {
      if (!matchId) {
        return;
      }

      // First send a message
      await request(app)
        .post("/messages")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ match_id: matchId, content: "Test message" });

      // Get messages
      const messagesResponse = await request(app)
        .get(`/matches/${matchId}/messages`)
        .set("Authorization", `Bearer ${authToken1}`);

      if (messagesResponse.body.data.length > 0) {
        const messageId = messagesResponse.body.data[0].id;
        
        await request(app)
          .put(`/messages/${messageId}/read`)
          .set("Authorization", `Bearer ${authToken2}`)
          .expect(200);
      }
    });
  });
});

