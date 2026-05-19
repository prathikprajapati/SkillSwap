import request from "supertest";
import { PrismaClient } from "@prisma/client";

import app from "../../src/server";

const prisma = new PrismaClient();

describe("Ratings Endpoints", () => {
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
      email: "rateuser1@example.com",
      password: "password123",
      name: "Rate User One",
    });
    authToken1 = signupResponse1.body.token;
    userId1 = signupResponse1.body.user.id;

    const signupResponse2 = await request(app).post("/auth/signup").send({
      email: "rateuser2@example.com",
      password: "password123",
      name: "Rate User Two",
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

  describe("POST /ratings", () => {
    it("should create a rating for another user", async () => {
      const ratingData = {
        rated_user_id: userId2,
        match_id: matchId,
        rating: 5,
        comment: "Great teacher!",
      };

      const response = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${authToken1}`)
        .send(ratingData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.rating).toBe(5);
      expect(response.body.rated_user_id).toBe(userId2);
      expect(response.body.rater_user_id).toBe(userId1);
    });

    it("should prevent self-rating", async () => {
      const response = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({
          rated_user_id: userId1,
          match_id: matchId,
          rating: 5,
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should prevent rating deleted user", async () => {
      // Create and delete a user
      const deletedUser = await request(app).post("/auth/signup").send({
        email: "deletedrate@example.com",
        password: "password123",
        name: "Deleted User",
      });

      await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${deletedUser.body.token}`);

      const response = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({
          rated_user_id: deletedUser.body.user.id,
          rating: 5,
        })
        .expect(400);

      expect(response.body.error).toContain("deleted");
    });

    it("should prevent duplicate rating for same match", async () => {
      await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${authToken2}`)
        .send({
          rated_user_id: userId1,
          match_id: matchId,
          rating: 4,
        });

      const response = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${authToken2}`)
        .send({
          rated_user_id: userId1,
          match_id: matchId,
          rating: 5,
        })
        .expect(409);

      expect(response.body.error).toContain("already rated");
    });

    it("should validate rating range (1-5)", async () => {
      const response = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({
          rated_user_id: userId2,
          rating: 6,
        })
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should complete match when both users rate", async () => {
      // Both users have now rated, match should be completed
      const matchResponse = await request(app)
        .get("/matches")
        .set("Authorization", `Bearer ${authToken1}`);

      const match = matchResponse.body.data.find((m: any) => m.id === matchId);
      expect(match.status).toBe("completed");
    });
  });

  describe("GET /ratings", () => {
    it("should list ratings with pagination", async () => {
      const response = await request(app)
        .get("/ratings")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
    });

    it("should filter ratings by match_id", async () => {
      const response = await request(app)
        .get(`/ratings?match_id=${matchId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /ratings/user/:id", () => {
    it("should get user rating stats", async () => {
      const response = await request(app)
        .get(`/ratings/user/${userId1}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body).toHaveProperty("averageRating");
      expect(response.body).toHaveProperty("totalRatings");
      expect(response.body).toHaveProperty("recentRatings");
    });

    it("should return 404 for non-existent user", async () => {
      const fakeUserId = "00000000-0000-0000-0000-000000000000";
      await request(app)
        .get(`/ratings/user/${fakeUserId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(404);
    });
  });

  describe("DELETE /ratings/:id", () => {
    let ratingToDelete: string;

    beforeAll(async () => {
      // Create a new match for delete test
      const signup3 = await request(app).post("/auth/signup").send({
        email: "rateuser3@example.com",
        password: "password123",
        name: "Rate User Three",
      });
      const authToken3 = signup3.body.token;
      const userId3 = signup3.body.user.id;

      // Create match
      await request(app)
        .post("/requests")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ receiver_id: userId3 });

      const incoming = await request(app)
        .get("/requests/incoming")
        .set("Authorization", `Bearer ${authToken3}`);
      const reqId = incoming.body[0].id;

      await request(app)
        .put(`/requests/${reqId}/accept`)
        .set("Authorization", `Bearer ${authToken3}`);

      // Create rating
      const ratingRes = await request(app)
        .post("/ratings")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({
          rated_user_id: userId3,
          rating: 4,
        });
      ratingToDelete = ratingRes.body.id;
    });

    it("should delete own rating", async () => {
      await request(app)
        .delete(`/ratings/${ratingToDelete}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);
    });

    it("should not delete another user's rating", async () => {
      // Get existing rating
      const ratingsRes = await request(app)
        .get("/ratings")
        .set("Authorization", `Bearer ${authToken2}`);
      const ratingId = ratingsRes.body.data[0]?.id;

      if (ratingId) {
        const response = await request(app)
          .delete(`/ratings/${ratingId}`)
          .set("Authorization", `Bearer ${authToken1}`)
          .expect(403);

        expect(response.body.error).toContain("own");
      }
    });
  });
});
