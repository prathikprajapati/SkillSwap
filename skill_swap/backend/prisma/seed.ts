import "dotenv/config";
import {
  PrismaClient,
  SkillType,
  ProficiencyLevel,
  RequestStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";

// Simple PrismaClient without adapter - using environment variable
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create initial skills
  const skills = [
    { name: "JavaScript", category: "Programming" },
    { name: "Python", category: "Programming" },
    { name: "React", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "TypeScript", category: "Programming" },
    { name: "HTML/CSS", category: "Frontend" },
    { name: "Git", category: "Tools" },
    { name: "SQL", category: "Database" },
    { name: "MongoDB", category: "Database" },
    { name: "Docker", category: "DevOps" },
    { name: "AWS", category: "Cloud" },
    { name: "Figma", category: "Design" },
    { name: "UI/UX Design", category: "Design" },
    { name: "Photography", category: "Creative" },
    { name: "Video Editing", category: "Creative" },
    { name: "Spanish", category: "Language" },
    { name: "French", category: "Language" },
    { name: "German", category: "Language" },
    { name: "Public Speaking", category: "Soft Skills" },
    { name: "Leadership", category: "Soft Skills" },
    { name: "Guitar", category: "Music" },
    { name: "Piano", category: "Music" },
    { name: "Cooking", category: "Lifestyle" },
    { name: "Fitness Training", category: "Health" },
    { name: "Yoga", category: "Health" },
  ];

  console.log("📚 Creating skills...");
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }

  // Create test users
  const hashedPassword = await bcrypt.hash("password123", 12);

  console.log("👥 Creating test users...");

  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      password_hash: hashedPassword,
      name: "Alice Johnson",
      profile_completion: 85,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      password_hash: hashedPassword,
      name: "Bob Smith",
      profile_completion: 70,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      email: "carol@example.com",
      password_hash: hashedPassword,
      name: "Carol Williams",
      profile_completion: 90,
    },
  });

  // Get all skills for reference
  const allSkills = await prisma.skill.findMany();

  const getSkillId = (name: string) =>
    allSkills.find((s) => s.name === name)?.id!;

  console.log("🎯 Creating user skills...");

  // Alice's skills
  await prisma.userSkill.createMany({
    data: [
      {
        user_id: user1.id,
        skill_id: getSkillId("JavaScript"),
        skill_type: SkillType.offer,
        proficiency_level: ProficiencyLevel.expert,
      },
      {
        user_id: user1.id,
        skill_id: getSkillId("React"),
        skill_type: SkillType.offer,
        proficiency_level: ProficiencyLevel.expert,
      },
      {
        user_id: user1.id,
        skill_id: getSkillId("Python"),
        skill_type: SkillType.want,
        proficiency_level: ProficiencyLevel.beginner,
      },
      {
        user_id: user1.id,
        skill_id: getSkillId("Guitar"),
        skill_type: SkillType.want,
        proficiency_level: ProficiencyLevel.beginner,
      },
    ],
    skipDuplicates: true,
  });

  // Bob's skills
  await prisma.userSkill.createMany({
    data: [
      {
        user_id: user2.id,
        skill_id: getSkillId("Python"),
        skill_type: SkillType.offer,
        proficiency_level: ProficiencyLevel.expert,
      },
      {
        user_id: user2.id,
        skill_id: getSkillId("Node.js"),
        skill_type: SkillType.offer,
        proficiency_level: ProficiencyLevel.intermediate,
      },
      {
        user_id: user2.id,
        skill_id: getSkillId("JavaScript"),
        skill_type: SkillType.want,
        proficiency_level: ProficiencyLevel.intermediate,
      },
      {
        user_id: user2.id,
        skill_id: getSkillId("Guitar"),
        skill_type: SkillType.offer,
        proficiency_level: ProficiencyLevel.expert,
      },
    ],
    skipDuplicates: true,
  });

  // Carol's skills
  await prisma.userSkill.createMany({
    data: [
      {
        user_id: user3.id,
        skill_id: getSkillId("UI/UX Design"),
        skill_type: SkillType.offer,
        proficiency_level: ProficiencyLevel.expert,
      },
      {
        user_id: user3.id,
        skill_id: getSkillId("Figma"),
        skill_type: SkillType.offer,
        proficiency_level: ProficiencyLevel.expert,
      },
      {
        user_id: user3.id,
        skill_id: getSkillId("React"),
        skill_type: SkillType.want,
        proficiency_level: ProficiencyLevel.intermediate,
      },
      {
        user_id: user3.id,
        skill_id: getSkillId("TypeScript"),
        skill_type: SkillType.want,
        proficiency_level: ProficiencyLevel.beginner,
      },
    ],
    skipDuplicates: true,
  });

  console.log("📨 Creating match requests...");

  // Create a pending request from Bob to Alice
  const existingRequest1 = await prisma.matchRequest.findFirst({
    where: { sender_id: user2.id, receiver_id: user1.id, status: RequestStatus.pending }
  });
  if (!existingRequest1) {
    await prisma.matchRequest.create({
      data: {
        sender_id: user2.id,
        receiver_id: user1.id,
        status: RequestStatus.pending,
      },
    });
  }

  // Create an accepted match between Alice and Carol
  let request = await prisma.matchRequest.findFirst({
    where: { sender_id: user1.id, receiver_id: user3.id }
  });
  if (request) {
    request = await prisma.matchRequest.update({
      where: { id: request.id },
      data: { status: RequestStatus.accepted }
    });
  } else {
    request = await prisma.matchRequest.create({
      data: {
        sender_id: user1.id,
        receiver_id: user3.id,
        status: RequestStatus.accepted,
      },
    });
  }

  // Create the match record
  let match = await prisma.match.findFirst({
    where: {
      OR: [
        { user1_id: user1.id, user2_id: user3.id },
        { user1_id: user3.id, user2_id: user1.id }
      ]
    }
  });
  if (!match) {
    match = await prisma.match.create({
      data: {
        user1_id: user1.id,
        user2_id: user3.id,
      },
    });
  }

  console.log("💬 Creating messages...");

  // Create some messages between Alice and Carol
  await prisma.message.createMany({
    data: [
      {
        match_id: match.id,
        sender_id: user1.id,
        content:
          "Hi Carol! I saw you want to learn React. I can help with that!",
        is_read: true,
      },
      {
        match_id: match.id,
        sender_id: user3.id,
        content:
          "Hey Alice! That would be amazing! I can teach you Figma in exchange.",
        is_read: true,
      },
      {
        match_id: match.id,
        sender_id: user1.id,
        content: "Perfect! When are you free for our first session?",
        is_read: false,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("📋 Test Accounts:");
  console.log("  Alice: alice@example.com / password123");
  console.log("  Bob: bob@example.com / password123");
  console.log("  Carol: carol@example.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
