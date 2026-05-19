import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Matching Algorithm", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.message.deleteMany();
    await prisma.match.deleteMany();
    await prisma.matchRequest.deleteMany();
    await prisma.userSkill.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.user.deleteMany();
  });

  it("should calculate mutual matches correctly", async () => {
    // Create two users
    const user1 = await prisma.user.create({
      data: {
        email: "user1@test.com",
        password_hash: "hash1",
        name: "User 1",
        profile_completion: 80,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: "user2@test.com",
        password_hash: "hash2",
        name: "User 2",
        profile_completion: 90,
      },
    });

    // Create skills
    const js = await prisma.skill.create({
      data: { name: "JavaScript", category: "Programming" },
    });
    const python = await prisma.skill.create({
      data: { name: "Python", category: "Programming" },
    });
    const react = await prisma.skill.create({
      data: { name: "React", category: "Frontend" },
    });

    // User 1: offers JS, wants Python and React
    await prisma.userSkill.create({
      data: { user_id: user1.id, skill_id: js.id, skill_type: "offer" },
    });
    await prisma.userSkill.create({
      data: { user_id: user1.id, skill_id: python.id, skill_type: "want" },
    });
    await prisma.userSkill.create({
      data: { user_id: user1.id, skill_id: react.id, skill_type: "want" },
    });

    // User 2: offers Python and React, wants JS
    await prisma.userSkill.create({
      data: { user_id: user2.id, skill_id: python.id, skill_type: "offer" },
    });
    await prisma.userSkill.create({
      data: { user_id: user2.id, skill_id: react.id, skill_type: "offer" },
    });
    await prisma.userSkill.create({
      data: { user_id: user2.id, skill_id: js.id, skill_type: "want" },
    });

    // Test the algorithm logic (extracted from matchesController)
    const userSkills = await prisma.userSkill.findMany({
      where: { user_id: user1.id },
      include: { skill: true },
    });

    const offeredSkillIds = userSkills
      .filter((us) => us.skill_type === "offer")
      .map((us) => us.skill_id);

    const wantedSkillIds = userSkills
      .filter((us) => us.skill_type === "want")
      .map((us) => us.skill_id);

    // Get potential matches
    const potentialMatches = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: user1.id } },
          {
            OR: [
              {
                user_skills: {
                  some: {
                    skill_id: { in: wantedSkillIds },
                    skill_type: "offer",
                  },
                },
              },
              {
                user_skills: {
                  some: {
                    skill_id: { in: offeredSkillIds },
                    skill_type: "want",
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        user_skills: {
          where: {
            OR: [{ skill_type: "offer" }, { skill_type: "want" }],
          },
          include: { skill: true },
        },
      },
    });

    expect(potentialMatches.length).toBe(1);
    expect(potentialMatches[0].id).toBe(user2.id);

    // Calculate match score
    const user = potentialMatches[0];
    const userOfferedSkills = user.user_skills.filter(
      (us) => us.skill_type === "offer",
    );
    const userWantedSkills = user.user_skills.filter(
      (us) => us.skill_type === "want",
    );
    const userOfferedSkillIds = userOfferedSkills.map((us) => us.skill_id);
    const userWantedSkillIds = userWantedSkills.map((us) => us.skill_id);

    // Get matched offers and wants (new format)
    const matchedOffers = userOfferedSkills
      .filter((us) => wantedSkillIds.includes(us.skill_id))
      .map((us) => us.skill.name);

    const matchedWants = userWantedSkills
      .filter((us) => offeredSkillIds.includes(us.skill_id))
      .map((us) => us.skill.name);

    // Mutual matches
    const mutualMatches = matchedOffers.length + matchedWants.length;

    // Skill overlap
    const allUserSkills = [...userOfferedSkillIds, ...userWantedSkillIds];
    const allCurrentSkills = [...offeredSkillIds, ...wantedSkillIds];
    const overlap = allUserSkills.filter((id) =>
      allCurrentSkills.includes(id),
    ).length;
    const maxSkills = Math.max(allUserSkills.length, allCurrentSkills.length);
    const skillOverlap = maxSkills > 0 ? overlap / maxSkills : 0;

    // Profile completion
    const profileCompletion = user.profile_completion / 100;

    // Calculate score (0-100 integer)
    const rawScore =
      mutualMatches * 0.5 + skillOverlap * 0.3 + profileCompletion * 0.2;
    const score = Math.round(rawScore * 100);

    expect(mutualMatches).toBe(3); // JS, Python, React all match
    expect(skillOverlap).toBe(1); // All skills overlap (3/3)
    expect(score).toBeGreaterThan(50); // Should be a high score (0-100 range)
    expect(matchedOffers).toContain("Python");
    expect(matchedOffers).toContain("React");
    expect(matchedWants).toContain("JavaScript");
  });

  it("should exclude already matched users", async () => {
    // Create users and a match
    const user1 = await prisma.user.create({
      data: {
        email: "user1@test.com",
        password_hash: "hash1",
        name: "User 1",
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: "user2@test.com",
        password_hash: "hash2",
        name: "User 2",
      },
    });

    // Create a match between user1 and user2
    await prisma.match.create({
      data: {
        user1_id: user1.id,
        user2_id: user2.id,
      },
    });

    // Create skills for matching
    const skill = await prisma.skill.create({
      data: { name: "JavaScript", category: "Programming" },
    });

    await prisma.userSkill.create({
      data: { user_id: user1.id, skill_id: skill.id, skill_type: "offer" },
    });
    await prisma.userSkill.create({
      data: { user_id: user2.id, skill_id: skill.id, skill_type: "want" },
    });

    // Check that user2 is not recommended to user1
    const userSkills = await prisma.userSkill.findMany({
      where: { user_id: user1.id },
      include: { skill: true },
    });

    const offeredSkillIds = userSkills
      .filter((us) => us.skill_type === "offer")
      .map((us) => us.skill_id);

    // Get existing matches to exclude (like the actual controller does)
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [{ user1_id: user1.id }, { user2_id: user1.id }],
      },
    });
    const matchedUserIds = existingMatches.map((m) =>
      m.user1_id === user1.id ? m.user2_id : m.user1_id,
    );

    const potentialMatches = await prisma.user.findMany({
      where: {
        AND: [
          { id: { notIn: [...matchedUserIds, user1.id] } },
          {
            OR: [
              {
                user_skills: {
                  some: {
                    skill_id: { in: [] }, // No wanted skills for user1
                    skill_type: "offer",
                  },
                },
              },
              {
                user_skills: {
                  some: {
                    skill_id: { in: offeredSkillIds },
                    skill_type: "want",
                  },
                },
              },
            ],
          },
        ],
      },
    });

    // User2 should not appear in potential matches because they're already matched
    const matchedUser = potentialMatches.find((u) => u.id === user2.id);
    expect(matchedUser).toBeUndefined();
  });
});
