import request from "supertest";
import { PrismaClient } from "@prisma/client";

import app from "../../src/server";

const prisma = new PrismaClient();

describe("Authentication Middleware", () => {
  let authToken: string;

  beforeAll(async () => {
    // Clean database
    await prisma.message.deleteMany();
    await prisma.match.deleteMany();
    await prisma.matchRequest.deleteMany();
    await prisma.userSkill.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const signupResponse = await request(app).post("/auth/signup").send({
      email: "middleware@example.com",
      password: "password123",
      name: "Middleware User",
    });

    authToken = signupResponse.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Protected Routes", () => {
    it("should allow access with valid JWT token", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email", "middleware@example.com");
    });

    it("should deny access without Authorization header", async () => {
      await request(app).get("/users/me").expect(401);
    });

    it("should deny access with invalid token", async () => {
      await request(app)
        .get("/users/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(403);
    });

    it("should deny access with malformed Authorization header", async () => {
      await request(app)
        .get("/users/me")
        .set("Authorization", "InvalidFormat")
        .expect(401);
    });

    it("should deny access with expired token", async () => {
      // Create a token that expires immediately for testing
      const jwt = require("jsonwebtoken");
      const expiredToken = jwt.sign(
        { id: "test-id" },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "-1h" }, // Already expired
      );

      await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(403);
    });
  });

  describe("Public Routes", () => {
    it("should allow access to public routes without authentication", async () => {
      await request(app).get("/health").expect(200);
    });

    it("should allow access to auth routes without authentication", async () => {
      await request(app)
        .post("/auth/signup")
        .send({
          email: "public@example.com",
          password: "password123",
          name: "Public User",
        })
        .expect(201);
    });
  });

  describe("CORS Headers", () => {
    it("should include CORS headers in responses", async () => {
      const response = await request(app).options("/users/me").expect(204);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });
});
