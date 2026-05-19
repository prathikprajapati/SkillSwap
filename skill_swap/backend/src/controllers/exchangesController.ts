import type { Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { AuthRequest } from "../types/auth";

const prisma = new PrismaClient();

// Get all exchanges for the current user (their personal ledger)
export const getUserExchanges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get exchanges where user is either teacher or learner
    const exchanges = await prisma.exchange.findMany({
      where: {
        OR: [
          { teacher_id: userId },
          { learner_id: userId },
        ],
      },
      include: {
        match: {
          include: {
            user1: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            user2: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Format exchanges for the response
    const formattedExchanges = exchanges.map((exchange) => {
      const isTeaching = exchange.teacher_id === userId;
      const otherUser = exchange.match.user1_id === userId 
        ? exchange.match.user2 
        : exchange.match.user1;

      return {
        id: exchange.id,
        skillName: exchange.skill_name,
        status: exchange.status,
        createdAt: exchange.created_at,
        completedAt: exchange.completed_at,
        role: isTeaching ? "teacher" : "learner",
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar,
        },
      };
    });

    res.json(formattedExchanges);
  } catch (error) {
    console.error("Get user exchanges error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get exchanges for a specific match
export const getMatchExchanges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const matchId = req.params.matchId;

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
      include: {
        exchanges: {
          orderBy: { created_at: "desc" },
        },
        user1: { select: { id: true, name: true, avatar: true } },
        user2: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json({
      match: {
        id: match.id,
        user1: match.user1,
        user2: match.user2,
        status: match.status,
        createdAt: match.created_at,
      },
      exchanges: match.exchanges,
    });
  } catch (error) {
    console.error("Get match exchanges error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Complete an exchange
export const completeExchange = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const exchangeId = req.params.id;

    // Verify user is part of this exchange
    const exchange = await prisma.exchange.findFirst({
      where: {
        id: exchangeId,
        OR: [{ teacher_id: userId }, { learner_id: userId }],
      },
    });

    if (!exchange) {
      return res.status(404).json({ error: "Exchange not found" });
    }

    if (exchange.status === "completed") {
      return res.status(400).json({ error: "Exchange already completed" });
    }

    const updatedExchange = await prisma.exchange.update({
      where: { id: exchangeId },
      data: {
        status: "completed",
        completed_at: new Date(),
      },
    });

    res.json({ message: "Exchange completed", exchange: updatedExchange });
  } catch (error) {
    console.error("Complete exchange error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cancel an exchange
export const cancelExchange = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const exchangeId = req.params.id;

    // Verify user is part of this exchange
    const exchange = await prisma.exchange.findFirst({
      where: {
        id: exchangeId,
        OR: [{ teacher_id: userId }, { learner_id: userId }],
      },
    });

    if (!exchange) {
      return res.status(404).json({ error: "Exchange not found" });
    }

    if (exchange.status === "completed") {
      return res.status(400).json({ error: "Cannot cancel a completed exchange" });
    }

    const updatedExchange = await prisma.exchange.update({
      where: { id: exchangeId },
      data: { status: "cancelled" },
    });

    res.json({ message: "Exchange cancelled", exchange: updatedExchange });
  } catch (error) {
    console.error("Cancel exchange error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
