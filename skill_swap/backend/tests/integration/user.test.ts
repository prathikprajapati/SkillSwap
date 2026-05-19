
import request from "supertest";
import { PrismaClient } from "@prisma/client";

import app from "../../src/server";

const prisma = new PrismaClient();

describe("User Profile Endpoints", () => {
  let authToken: string;
  let userId: string;

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
      email: "testuser@example.com",
      password: "password123",
      name: "Test User",
    });

    authToken = signupResponse.body.token;
    userId = signupResponse.body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /users/me", () => {
    it("should return current user profile", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", userId);
      expect(response.body).toHaveProperty("email", "testuser@example.com");
      expect(response.body).toHaveProperty("name", "Test User");
    });

    it("should return 401 without authentication", async () => {
      await request(app).get("/users/me").expect(401);
    });

    it("should return 403 with invalid token", async () => {
      await request(app)
        .get("/users/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(403);
    });

    it("should not expose password_hash", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).not.toHaveProperty("password_hash");
    });
  });

  describe("PUT /users/me", () => {
    it("should update user profile name", async () => {
      const updateData = {
        name: "Updated Name",
      };

      const response = await request(app)
        .put("/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user).toHaveProperty("name", "Updated Name");
    });

    it("should return 401 without authentication", async () => {
      await request(app)
        .put("/users/me")
        .send({ name: "New Name" })
        .expect(401);
    });

    it("should return 400 for invalid name (empty)", async () => {
      await request(app)
        .put("/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "" })
        .expect(400);
    });
  });

  describe("PATCH /users/me (Soft Delete)", () => {
    let deletedUserToken: string;
    let deletedUserEmail: string;

    beforeAll(async () => {
      // Create a user to delete
      deletedUserEmail = `delete_${Date.now()}@example.com`;
      const signupResponse = await request(app).post("/auth/signup").send({
        email: deletedUserEmail,
        password: "password123",
        name: "To Be Deleted",
      });
      deletedUserToken = signupResponse.body.token;
    });

    it("should soft delete user account", async () => {
      const response = await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${deletedUserToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Account deleted successfully");

      // Verify user is marked as deleted in DB
      const user = await prisma.user.findUnique({
        where: { email: deletedUserEmail },
      });
      expect(user).toHaveProperty("is_deleted", true);
      expect(user).toHaveProperty("deleted_at");
      expect(user?.name).toBe("Deleted User");
    });

    it("should not allow deleted user to login", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: deletedUserEmail,
          password: "password123",
        })
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("deleted");
    });

    it("should not allow deleted user to access protected routes", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${deletedUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
    });
  });
});

