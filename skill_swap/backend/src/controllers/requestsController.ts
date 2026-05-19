import type { Response } from "express";
import { validationResult } from "express-validator";
import { PrismaClient, RequestStatus } from "@prisma/client";

import type { AuthRequest } from "../types/auth";
import { getPagination, paginate, defaultOrderBy } from "../utils/pagination";
import {
  notifyMatchRequest,
  notifyMatchAccepted,
} from "../services/notificationService";

const prisma = new PrismaClient();

export const sendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const senderId = req.user?.id;
    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { receiver_id, skill_offered_id, skill_wanted_id } = req.body;

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiver_id },
    });

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if request already exists (same sender/receiver pair)
    const existingRequest = await prisma.matchRequest.findFirst({
      where: {
        sender_id: senderId,
        receiver_id,
        status: "pending",
      },
    });

    if (existingRequest) {
      return res.status(409).json({ error: "Request already exists" });
    }

    // Check if an exchange already exists for these skills
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { user1_id: senderId, user2_id: receiver_id },
          { user1_id: receiver_id, user2_id: senderId },
        ],
      },
      include: {
        exchanges: {
          where: {
            OR: [
              { teacher_id: senderId, learner_id: receiver_id, skill_id: skill_offered_id },
              { teacher_id: receiver_id, learner_id: senderId, skill_id: skill_wanted_id },
            ],
          },
        },
      },
    });

    if (existingMatch?.exchanges.length > 0) {
      return res.status(409).json({ error: "Exchange already exists for this skill" });
    }

    const matchRequest = await prisma.matchRequest.create({
      data: {
        sender_id: senderId,
        receiver_id,
        skill_offered_id,
        skill_wanted_id,
        status: "pending",
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Notify receiver about new match request (fire-and-forget)
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    if (sender) {
      notifyMatchRequest(receiver_id, sender.name, matchRequest.id);
    }

    res.status(201).json(matchRequest);
  } catch (error) {
    console.error("Send request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getIncomingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { page, limit, skip } = getPagination(req.query);
    const status = req.query.status as string | undefined;

    const where: any = {
      receiver_id: userId,
    };
    if (status) {
      where.status = status;
    } else {
      where.status = "pending";
    }

    const requests = await prisma.matchRequest.findMany({
      where,
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: defaultOrderBy,
      skip,
      take: limit,
    });

    // Return array directly for backward compatibility with tests
    res.json(requests);
  } catch (error) {
    console.error("Get incoming requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSentRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { page, limit, skip } = getPagination(req.query);
    const status = req.query.status as string | undefined;

    const where: any = {
      sender_id: userId,
    };
    if (status) {
      where.status = status;
    }

    const requests = await prisma.matchRequest.findMany({
      where,
      include: {
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: defaultOrderBy,
      skip,
      take: limit,
    });

    // Return array directly for backward compatibility with tests
    res.json(requests);
  } catch (error) {
    console.error("Get sent requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const acceptRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const requestId = req.params.id as string;

    const request = await prisma.matchRequest.findFirst({
      where: {
        id: requestId,
        receiver_id: userId,
        status: "pending",
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Get skill details for the exchange
    const skillOffered = request.skill_offered_id 
      ? await prisma.skill.findUnique({ where: { id: request.skill_offered_id } })
      : null;

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update request status
      await tx.matchRequest.update({
        where: { id: requestId },
        data: { status: "accepted" },
      });

      // Find or create match between users
      let match = await tx.match.findFirst({
        where: {
          OR: [
            { user1_id: request.sender_id, user2_id: request.receiver_id },
            { user1_id: request.receiver_id, user2_id: request.sender_id },
          ],
        },
      });

      if (!match) {
        match = await tx.match.create({
          data: {
            user1_id: request.sender_id,
            user2_id: request.receiver_id,
            status: "active",
          },
        });
      }

      // Create exchange record for the skill being taught
      const exchange = await tx.exchange.create({
        data: {
          match_id: match.id,
          teacher_id: request.sender_id, // Sender is offering a skill
          learner_id: request.receiver_id, // Receiver is learning
          skill_id: request.skill_offered_id || skillOffered?.id || '00000000-0000-0000-0000-000000000000',
          skill_name: skillOffered?.name || 'Unknown Skill',
          status: 'active',
        },
      });

      return { match, exchange };
    });

    // Notify sender that their request was accepted (fire-and-forget)
    const acceptor = await prisma.user.findUnique({ where: { id: userId } });
    if (acceptor) {
      notifyMatchAccepted(request.sender_id, acceptor.name, result.match.id);
    }

    res.json({ message: "Request accepted", match: result.match, exchange: result.exchange });
  } catch (error) {
    console.error("Accept request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const rejectRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const requestId = req.params.id as string;

    const request = await prisma.matchRequest.findFirst({
      where: {
        id: requestId,
        receiver_id: userId,
        status: "pending",
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    await prisma.matchRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });

    res.json({ message: "Request rejected" });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /requests/:id - Cancel a pending request (sender only)
 */
export const cancelRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const requestId = req.params.id as string;

    // Only the sender can cancel their own pending request
    const request = await prisma.matchRequest.findFirst({
      where: {
        id: requestId,
        sender_id: userId,
        status: "pending",
      },
    });

    if (!request) {
      return res
        .status(404)
        .json({ error: "Request not found or already processed" });
    }

    await prisma.matchRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });

    res.json({ message: "Request cancelled successfully" });
  } catch (error) {
    console.error("Cancel request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
