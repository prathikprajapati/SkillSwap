// Test utilities for database cleanup
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Complete database cleanup - call this in beforeAll of each test file
export async function cleanDatabase() {
  // Delete in correct order to respect foreign keys
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
}

export { prisma };
