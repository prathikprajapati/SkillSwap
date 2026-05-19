import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /sessions - Get all sessions for the current user (as teacher or learner)
export const getMySessions = async (req: Request, res: Response) => {
  try {
    const { user } = req as any;
    
    const sessions = await prisma.session.findMany({
      where: {
        OR: [
          { teacher_id: user.id },
          { learner_id: user.id }
        ]
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Manually fetch related data to avoid Prisma type issues
    const sessionsWithRelations = await Promise.all(
      sessions.map(async (session) => {
        const [teacher, learner, skill] = await Promise.all([
          prisma.user.findUnique({
            where: { id: session.teacher_id },
            select: { id: true, name: true, avatar: true }
          }),
          prisma.user.findUnique({
            where: { id: session.learner_id },
            select: { id: true, name: true, avatar: true }
          }),
          session.skill_id ? prisma.skill.findUnique({
            where: { id: session.skill_id },
            select: { id: true, name: true, category: true }
          }) : null
        ]);

        return {
          ...session,
          teacher,
          learner,
          skill
        };
      })
    );

    res.json(sessionsWithRelations);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /sessions/:id - Get a specific session
export const getSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { user } = req as any;

    const session = await prisma.session.findFirst({
      where: {
        id,
        OR: [
          { teacher_id: user.id },
          { learner_id: user.id }
        ]
      }
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Manually fetch related data
    const [teacher, learner, skill] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.teacher_id },
        select: { id: true, name: true, avatar: true }
      }),
      prisma.user.findUnique({
        where: { id: session.learner_id },
        select: { id: true, name: true, avatar: true }
      }),
      session.skill_id ? prisma.skill.findUnique({
        where: { id: session.skill_id },
        select: { id: true, name: true, category: true }
      }) : null
    ]);

    const sessionWithRelations = {
      ...session,
      teacher,
      learner,
      skill
    };

    res.json(sessionWithRelations);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /sessions - Create a new session
export const createSession = async (req: Request, res: Response) => {
  try {
    const { user } = req as any;
    const { teacher_id, learner_id, skill_id, scheduled_at } = req.body;

    // Validate that current user is either teacher or learner
    if (user.id !== teacher_id && user.id !== learner_id) {
      return res.status(403).json({ error: "You can only create sessions where you are the teacher or learner" });
    }

    // Validate teacher and learner exist
    const [teacher, learner] = await Promise.all([
      prisma.user.findUnique({ where: { id: teacher_id } }),
      prisma.user.findUnique({ where: { id: learner_id } })
    ]);

    if (!teacher || !learner) {
      return res.status(400).json({ error: "Teacher or learner not found" });
    }

    // Validate skill if provided
    if (skill_id) {
      const skill = await prisma.skill.findUnique({ where: { id: skill_id } });
      if (!skill) {
        return res.status(400).json({ error: "Skill not found" });
      }
    }

    const session = await prisma.session.create({
      data: {
        teacher_id,
        learner_id,
        skill_id,
        status: "scheduled",
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null
      }
    });

    // Manually fetch related data for response
    const [teacherData, learnerData, skillData] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.teacher_id },
        select: { id: true, name: true, avatar: true }
      }),
      prisma.user.findUnique({
        where: { id: session.learner_id },
        select: { id: true, name: true, avatar: true }
      }),
      session.skill_id ? prisma.skill.findUnique({
        where: { id: session.skill_id },
        select: { id: true, name: true, category: true }
      }) : null
    ]);

    const sessionWithRelations = {
      ...session,
      teacher: teacherData,
      learner: learnerData,
      skill: skillData
    };

    res.status(201).json(sessionWithRelations);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /sessions/:id - Update a session
export const updateSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { user } = req as any;
    const { status, scheduled_at } = req.body;

    // Check if session exists and user has permission
    const existingSession = await prisma.session.findFirst({
      where: {
        id,
        OR: [
          { teacher_id: user.id },
          { learner_id: user.id }
        ]
      }
    });

    if (!existingSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = await prisma.session.update({
      where: { id: id as string },
      data: {
        status,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : undefined,
        completed_at: status === "completed" ? new Date() : undefined
      }
    });

    // Manually fetch related data for response
    const [teacher, learner, skill] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.teacher_id },
        select: { id: true, name: true, avatar: true }
      }),
      prisma.user.findUnique({
        where: { id: session.learner_id },
        select: { id: true, name: true, avatar: true }
      }),
      session.skill_id ? prisma.skill.findUnique({
        where: { id: session.skill_id },
        select: { id: true, name: true, category: true }
      }) : null
    ]);

    const sessionWithRelations = {
      ...session,
      teacher,
      learner,
      skill
    };

    res.json(sessionWithRelations);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /sessions/:id - Delete a session
export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { user } = req as any;

    // Check if session exists and user has permission
    const existingSession = await prisma.session.findFirst({
      where: {
        id,
        OR: [
          { teacher_id: user.id },
          { learner_id: user.id }
        ]
      }
    });

    if (!existingSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    await prisma.session.delete({
      where: { id: id as string }
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
