import request from "supertest";
import { PrismaClient } from "@prisma/client";

import app from "../../src/server";

const prisma = new PrismaClient();

describe("Match Requests Endpoints", () => {
  let authToken1: string;
  let authToken2: string;
  let userId1: string;
  let userId2: string;

  beforeAll(async () => {
    // Clean database
    await prisma.message.deleteMany();
    await prisma.match.deleteMany();
    await prisma.matchRequest.deleteMany();
    await prisma.userSkill.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.user.deleteMany();

    // Create two test users
    const signupResponse1 = await request(app).post("/auth/signup").send({
      email: "user1@example.com",
      password: "password123",
      name: "User One",
    });

    authToken1 = signupResponse1.body.token;
    userId1 = signupResponse1.body.user.id;

    const signupResponse2 = await request(app).post("/auth/signup").send({
      email: "user2@example.com",
      password: "password123",
      name: "User Two",
    });

    authToken2 = signupResponse2.body.token;
    userId2 = signupResponse2.body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /requests", () => {
    it("should send match request", async () => {
      const response = await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ receiver_id: userId2 })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("sender_id", userId1);
      expect(response.body).toHaveProperty("receiver_id", userId2);
      expect(response.body).toHaveProperty("status", "pending");
    });

    it("should return 409 for duplicate request", async () => {
      await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ receiver_id: userId2 })
        .expect(409);
    });
  });

  describe("GET /requests/incoming", () => {
    it("should return incoming requests", async () => {
      const response = await request(app)
        .get("/requests/incoming")
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("sender");
    });
  });

  describe("GET /requests/sent", () => {
    it("should return sent requests", async () => {
      const response = await request(app)
        .get("/requests/sent")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("receiver");
    });
  });

  describe("PUT /requests/:id/accept", () => {
    it("should accept match request and create match", async () => {
      // Get the request ID
      const incomingResponse = await request(app)
        .get("/requests/incoming")
        .set("Authorization", `Bearer ${authToken2}`);

      const requestId = incomingResponse.body[0].id;

      const response = await request(app)
        .put(`/requests/${requestId}/accept`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Request accepted");
      expect(response.body).toHaveProperty("match");
    });
  });

  describe("PUT /requests/:id/reject", () => {
    it("should reject match request", async () => {
      // Create another request first
      await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${authToken2}`)
        .send({ receiver_id: userId1 });

      // Get the new request ID
      const incomingResponse = await request(app)
        .get("/requests/incoming")
        .set("Authorization", `Bearer ${authToken1}`);

      const requestId = incomingResponse.body.find(
        (req: any) => req.status === "pending",
      )?.id;

      if (requestId) {
        const response = await request(app)
          .put(`/requests/${requestId}/reject`)
          .set("Authorization", `Bearer ${authToken1}`)
          .expect(200);

        expect(response.body).toHaveProperty("message", "Request rejected");
      }
    });
  });
});
