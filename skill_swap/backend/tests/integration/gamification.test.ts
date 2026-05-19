import request from "supertest";
import { PrismaClient } from "@prisma/client";

import app from "../../src/server";

const prisma = new PrismaClient();

describe("Gamification Endpoints", () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean database
    await prisma.xPTransaction.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.streak.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.message.deleteMany();
    await prisma.match.deleteMany();
    await prisma.matchRequest.deleteMany();
    await prisma.userSkill.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const signupResponse = await request(app).post("/auth/signup").send({
      email: "gameuser@example.com",
      password: "password123",
      name: "Game User",
    });
    authToken = signupResponse.body.token;
    userId = signupResponse.body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /gamification/stats", () => {
    it("should get user gamification stats", async () => {
      const response = await request(app)
        .get("/gamification/stats")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("xp");
      expect(response.body).toHaveProperty("level");
      expect(response.body).toHaveProperty("stats");
      expect(response.body).toHaveProperty("achievements");
      expect(response.body).toHaveProperty("streak");
    });

    it("should return 401 without token", async () => {
      await request(app).get("/gamification/stats").expect(401);
    });
  });

  describe("POST /gamification/xp/award", () => {
    it("should award XP with valid action", async () => {
      const response = await request(app)
        .post("/gamification/xp/award")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ action: "ADD_SKILL" })
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("xp");
    });

    it("should reject invalid action", async () => {
      const response = await request(app)
        .post("/gamification/xp/award")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ action: "INVALID_ACTION" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should reject arbitrary XP amounts", async () => {
      const response = await request(app)
        .post("/gamification/xp/award")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ amount: 99999 })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /gamification/xp/history", () => {
    it("should get XP transaction history", async () => {
      const response = await request(app)
        .get("/gamification/xp/history")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/gamification/xp/history?page=1&limit=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe("GET /gamification/leaderboard", () => {
    it("should get leaderboard", async () => {
      const response = await request(app)
        .get("/gamification/leaderboard")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should support period filter", async () => {
      const response = await request(app)
        .get("/gamification/leaderboard?period=month")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should support limit parameter", async () => {
      const response = await request(app)
        .get("/gamification/leaderboard?limit=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBeLessThanOrEqual(5);
    });
  });

  describe("POST /gamification/streak", () => {
    it("should update streak", async () => {
      const response = await request(app)
        .post("/gamification/streak")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("current");
      expect(response.body).toHaveProperty("longest");
    });

    it("should return 401 without token", async () => {
      await request(app).post("/gamification/streak").expect(401);
    });
  });
});
