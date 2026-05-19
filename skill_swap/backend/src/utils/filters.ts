/**
 * Soft delete filters for consistent querying
 * These filters should be applied to all user-related queries
 */

import { Prisma } from "@prisma/client";

/**
 * Filter to exclude deleted users
 * Use this in where clauses for user queries
 */
export const activeUser = {
  is_deleted: false,
} as const;

/**
 * Filter to get only deleted users (for admin purposes)
 */
export const deletedUser = {
  is_deleted: true,
} as const;

/**
 * Extended user where clause type that includes soft delete
 */
export type UserWhereInput = Prisma.UserWhereInput & typeof activeUser;

/**
 * Helper to check if a user is active (not deleted)
 */
export function isUserActive(user: { is_deleted?: boolean | null }): boolean {
  return !user.is_deleted;
}

/**
 * Build user filter for queries that need to exclude deleted users
 * @param additionalFilter - Additional filters to combine with active user filter
 */
export function buildActiveUserFilter<T extends Prisma.UserWhereInput>(
  additionalFilter?: T,
): Prisma.UserWhereInput {
  if (additionalFilter) {
    return {
      ...activeUser,
      ...additionalFilter,
    };
  }
  return { ...activeUser };
}

/**
 * Middleware/helper to wrap user queries with soft delete filtering
 * Use this in controllers to ensure soft delete is always applied
 */
export function withSoftDelete<T extends Prisma.UserWhereInput>(
  where: T,
): Prisma.UserWhereInput {
  return {
    ...where,
    is_deleted: false,
  };
}
