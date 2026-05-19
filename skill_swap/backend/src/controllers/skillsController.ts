import type { Response } from "express";
import { validationResult } from "express-validator";
import { PrismaClient, SkillType } from "@prisma/client";

import type { AuthRequest } from "../types/auth";
import {
  processAchievementTrigger,
  AchievementTriggers,
} from "../services/achievementService";

const prisma = new PrismaClient();

export const getSkills = async (req: AuthRequest, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: "asc" },
    });

    res.json(skills);
  } catch (error) {
    console.error("Get skills error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addUserSkill = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { skill_id, skill_type, proficiency_level } = req.body;

    // Check if skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skill_id },
    });

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    // Check if user already has this skill
    const existingSkill = await prisma.userSkill.findUnique({
      where: {
        user_id_skill_id_skill_type: {
          user_id: userId,
          skill_id,
          skill_type: skill_type as SkillType,
        },
      },
    });

    if (existingSkill) {
      return res.status(409).json({ error: "User already has this skill" });
    }

    const userSkill = await prisma.userSkill.create({
      data: {
        user_id: userId,
        skill_id,
        skill_type: skill_type as SkillType,
        proficiency_level: proficiency_level || "beginner",
      },
      include: {
        skill: true,
      },
    });

    // Trigger achievement check (fire-and-forget)
    processAchievementTrigger(AchievementTriggers.AFTER_SKILL_ADDED, userId);

    res.status(201).json(userSkill);
  } catch (error) {
    console.error("Add user skill error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeUserSkill = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const skillId = req.params.id as string;

    const userSkill = await prisma.userSkill.findFirst({
      where: {
        id: skillId,

        user_id: userId,
      },
    });

    if (!userSkill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    await prisma.userSkill.delete({
      where: { id: skillId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Remove user skill error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserSkills = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { user_id: userId },
      include: {
        skill: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json(userSkills);
  } catch (error) {
    console.error("Get user skills error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new skill
export const createSkill = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category } = req.body;

    // Check if skill already exists
    const existingSkill = await prisma.skill.findUnique({
      where: { name: name.trim() }
    });

    if (existingSkill) {
      return res.status(409).json({ 
        error: "Skill already exists",
        skill: existingSkill 
      });
    }

    // Create new skill
    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
        category: category || null
      }
    });

    res.status(201).json(skill);
  } catch (error) {
    console.error("Create skill error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper to clean up Firebase UID names
const cleanName = (name: string | null, email: string | null): string => {
  const extractFromEmail = (emailStr: string): string => {
    const localPart = emailStr.split('@')[0];
    if (!localPart) return 'User';
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  };

  if (!name || name === 'User') {
    if (email) return extractFromEmail(email);
    return 'User';
  }
  // Check if name looks like a Firebase UID (long alphanumeric string)
  if (name.length > 20 && /^[A-Za-z0-9_-]+$/.test(name)) {
    if (email) return extractFromEmail(email);
    return 'User';
  }
  return name;
};

// Get all user skill offerings with user info
export const getAllUserOfferedSkills = async (req: AuthRequest, res: Response) => {
  try {
    const userSkills = await prisma.userSkill.findMany({
      where: { skill_type: 'offer' },
      include: {
        skill: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Clean up Firebase UID names in response
    const cleanedUserSkills = userSkills.map((us: any) => ({
      ...us,
      user: {
        ...us.user,
        name: cleanName(us.user.name, us.user.email)
      }
    }));

    res.json(cleanedUserSkills);
  } catch (error) {
    console.error("Get all user offered skills error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
