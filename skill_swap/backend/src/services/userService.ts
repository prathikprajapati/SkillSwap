/**
 * User Service - Centralized user operations with soft delete handling
 * All user queries should go through this service to ensure consistent soft delete behavior
 */

import { Prisma, PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";
import { activeUser, buildActiveUserFilter } from "../utils/filters";

const prisma = new PrismaClient();

/**
 * Find a user by ID, excluding deleted users
 */
export async function findActiveUserById(userId: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      id: userId,
      ...activeUser,
    },
  });
}

/**
 * Find a user by email, excluding deleted users
 */
export async function findActiveUserByEmail(
  email: string,
): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      email,
      ...activeUser,
    },
  });
}

/**
 * Get user profile with skills, excluding deleted users
 */
export async function getUserProfile(userId: string) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      ...activeUser,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      profile_completion: true,
      xp: true,
      is_verified: true,
      created_at: true,
      user_skills: {
        include: {
          skill: true,
        },
      },
    },
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Prisma.UserUpdateInput,
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

/**
 * Soft delete a user account
 */
export async function softDeleteUser(userId: string): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
    },
  });
}

/**
 * Restore a deleted user account (admin function)
 */
export async function restoreUser(userId: string): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      is_deleted: false,
      deleted_at: null,
    },
  });
}

/**
 * Find multiple users with filters and pagination
 */
export async function findUsers(
  where: Prisma.UserWhereInput = {},
  options: {
    page?: number;
    limit?: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  } = {},
) {
  const { page = 1, limit = 20, orderBy = { created_at: "desc" } } = options;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: buildActiveUserFilter(where),
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        profile_completion: true,
        xp: true,
        is_verified: true,
        created_at: true,
      },
    }),
    prisma.user.count({
      where: buildActiveUserFilter(where),
    }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

/**
 * Check if user is active (not deleted)
 */
export async function isUserActive(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { is_deleted: true },
  });
  return user ? !user.is_deleted : false;
}

/**
 * Get users for matching algorithm (excluding deleted users)
 */
export async function getUsersForMatching(excludeUserIds: string[] = []) {
  return prisma.user.findMany({
    where: {
      ...activeUser,
      id: {
        notIn: excludeUserIds,
      },
    },
    include: {
      user_skills: {
        include: {
          skill: true,
        },
      },
    },
  });
}

export default prisma;
