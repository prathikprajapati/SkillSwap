import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Firebase Auth Endpoints
// POST /auth/firebase-login
export const firebaseLogin = async (req: Request, res: Response) => {
  try {
    const { user } = req as any;

    // Check if user account is deleted
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        user_skills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!dbUser || dbUser.is_deleted) {
      return res.status(403).json({
        error: "Account not found or has been deleted.",
      });
    }

    // No JWT token needed - Firebase tokens are used directly

    // Transform skills into the expected format
    const offeredSkills = dbUser.user_skills
      .filter((us: any) => us.skill_type === 'offer')
      .map((us: any) => ({
        id: us.id,
        skill_id: us.skill_id,
        name: us.skill.name,
        skill_type: us.skill_type,
        proficiency_level: us.proficiency_level,
        category: us.skill.category
      }));

    const wantedSkills = dbUser.user_skills
      .filter((us: any) => us.skill_type === 'want')
      .map((us: any) => ({
        id: us.id,
        skill_id: us.skill_id,
        name: us.skill.name,
        skill_type: us.skill_type,
        proficiency_level: us.proficiency_level,
        category: us.skill.category
      }));

    res.json({
      message: "Login successful",
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        profile_completion: dbUser.profile_completion,
        xp: dbUser.xp,
        is_verified: dbUser.is_verified,
        offeredSkills,
        wantedSkills,
      },
    });
  } catch (error) {
    console.error("Firebase login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /auth/firebase-signup
export const firebaseSignup = async (req: Request, res: Response) => {
  try {
    const { user } = req as any;
    const { name } = req.body;

    // Update user name if provided (Firebase user was already created in middleware)
    if (name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        user_skills: {
          include: {
            skill: true
          }
        }
      }
    });

    // No JWT token needed - Firebase tokens are used directly

    // Transform skills into the expected format
    const offeredSkills = updatedUser!.user_skills
      .filter((us: any) => us.skill_type === 'offer')
      .map((us: any) => ({
        id: us.id,
        skill_id: us.skill_id,
        name: us.skill.name,
        skill_type: us.skill_type,
        proficiency_level: us.proficiency_level,
        category: us.skill.category
      }));

    const wantedSkills = updatedUser!.user_skills
      .filter((us: any) => us.skill_type === 'want')
      .map((us: any) => ({
        id: us.id,
        skill_id: us.skill_id,
        name: us.skill.name,
        skill_type: us.skill_type,
        proficiency_level: us.proficiency_level,
        category: us.skill.category
      }));

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        name: updatedUser!.name,
        avatar: updatedUser!.avatar,
        profile_completion: updatedUser!.profile_completion,
        xp: updatedUser!.xp,
        is_verified: updatedUser!.is_verified,
        offeredSkills,
        wantedSkills,
      },
    });
  } catch (error) {
    console.error("Firebase signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
