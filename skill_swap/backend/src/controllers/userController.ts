import type { Response } from "express";
import { validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";

import type { AuthRequest } from "../types/auth";

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        profile_completion: true,
        created_at: true,
        user_skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name } = req.body;
    const avatar = req.file?.filename;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        profile_completion: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /users/me - Soft delete user account
 * Also cancels all active matches involving this user
 */
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Use transaction to ensure atomicity: soft delete + cancel matches
    await prisma.$transaction(async (tx) => {
      // 1. Cancel all active matches involving this user
      await tx.match.updateMany({
        where: {
          OR: [
            { user1_id: userId, status: "active" },
            { user2_id: userId, status: "active" },
          ],
        },
        data: { status: "cancelled" },
      });

      // 2. Soft delete the user account
      await tx.user.update({
        where: { id: userId },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          name: "Deleted User",
          avatar: null,
        },
      });
    });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
