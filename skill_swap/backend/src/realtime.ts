/**
 * HTTP Long-Polling Realtime Layer (Instagram-style transport).
 *
 * Replaces the WebSocket transport for chat updates with plain HTTP:
 *  - Clients issue `GET /realtime/poll?matchId=..&after=..` which the server
 *    holds open for up to POLL_TIMEOUT_MS. Any event published for that match
 *    (new message, read receipt, typing, presence) resolves the request
 *    immediately; otherwise it resolves with an empty (timeout) response.
 *  - The request is then re-issued by the client, so the server is always
 *    serving the latest "since" cursor — this is the Instagram direct-messaging
 *    model (fetch-based incremental sync).
 *
 * Benefits over WebSockets: works through any proxy/load-balancer, no sticky
 * sessions required, no persistent connection state, standard HTTP caching,
 * and automatic reconnection is just a retry of the same request.
 */
import { EventEmitter } from "events";
import type { Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { AuthRequest } from "./types/auth";

const prisma = new PrismaClient();

/** A realtime event published to a match room (mirrors Socket.IO payloads). */
export interface RealtimeEvent {
  type: string;
  matchId: string;
  [key: string]: unknown;
}

const bus = new EventEmitter();
bus.setMaxListeners(0); // Long-pollers churn listeners rapidly

/** userId -> { matchId, since } — clients currently waiting on a poll. */
const activePollers = new Map<string, { matchId: string; since: string }>();

export const POLL_TIMEOUT_MS = 25000;
export const POLL_CATCHUP_LIMIT = 50;
/** Wait this long after the first event of a burst before resolving the poll. */
const POLL_DRAIN_MS = 100;

/** Publish an event to every active poller of a match room. */
export function publishToMatch(matchId: string, event: RealtimeEvent): void {
  bus.emit(`match:${matchId}`, event);
}

/** Whether the user currently has an active long-poll for a match. */
export function hasActivePoller(userId: string, matchId?: string): boolean {
  const poller = activePollers.get(userId);
  if (!poller) return false;
  return matchId ? poller.matchId === matchId : true;
}

/** Track a poller when a long-poll request registers. */
export function registerPoller(userId: string, matchId: string, since: string): void {
  activePollers.set(userId, { matchId, since });
}

/** Forget a poller when its request resolves (events or timeout). */
export function unregisterPoller(userId: string): void {
  activePollers.delete(userId);
}

/**
 * GET /realtime/poll?matchId=&after=
 *
 * 1. Catches up on anything missed between polls (DB query by cursor).
 * 2. Otherwise waits on the in-memory bus for up to POLL_TIMEOUT_MS.
 * 3. Always responds with `{ events, online }` so the client can re-poll.
 */
export async function handleLongPoll(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const matchId = req.query.matchId as string;
  const after = (req.query.after as string) || "";

  if (!matchId) {
    res.status(400).json({ error: "matchId is required" });
    return;
  }

  try {
    // Verify the user belongs to this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
    });

    if (!match) {
      res.status(401).json({ error: "Not authorized to poll this match" });
      return;
    }

    const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;

    // Presence = "did the other party have a poll in flight when this poll
    // started?" — a snapshot per poll cycle (Instagram-style). Recomputing at
    // response time would flicker: when both parties' polls resolve from the
    // same event, the other party has already unregistered.
    const online = hasActivePoller(otherUserId, matchId);

    // Step 1: catch-up on anything missed between polls (DB is source of truth)
    const sinceDate = after ? new Date(after) : null;
    const missed = sinceDate
      ? await prisma.message.findMany({
          where: { match_id: matchId, created_at: { gt: sinceDate } },
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { created_at: "asc" },
          take: POLL_CATCHUP_LIMIT,
        })
      : [];

    if (missed.length > 0) {
      const events: RealtimeEvent[] = missed.map((msg) => ({
        type: "message:new",
        matchId,
        ...msg,
      }));
      res.json({ events, online });
      return;
    }

    // Step 2: wait on the in-memory bus for the next event (long poll)
    const eventKey = `match:${matchId}`;
    const since = sinceDate ? sinceDate.toISOString() : new Date(0).toISOString();

    registerPoller(userId, matchId, since);

    const collected: RealtimeEvent[] = [];
    let settled = false;
    let drainTimer: NodeJS.Timeout | null = null;

    // Publishing code often emits bursts (e.g. sendMessage publishes
    // message:new + message:delivered back-to-back). Instead of resolving on
    // the first event and dropping the rest, we wait a short drain window so
    // the whole burst lands in a single poll response.
    const finish = () => {
      if (settled) return;
      settled = true;
      unregisterPoller(userId);
      clearTimeout(timer);
      if (drainTimer) clearTimeout(drainTimer);
      bus.removeListener(eventKey, onEvent);
      if (!res.headersSent) {
        res.json({
          events: collected,
          online,
        });
      }
    };

    const onEvent = (event: RealtimeEvent) => {
      if (settled) return;
      collected.push(event);
      if (!drainTimer) {
        drainTimer = setTimeout(finish, POLL_DRAIN_MS);
      }
    };

    bus.on(eventKey, onEvent);
    const timer = setTimeout(finish, POLL_TIMEOUT_MS);

    // Abort the poll if the client disconnects early
    res.on("close", () => {
      if (!settled) finish();
    });
  } catch (error) {
    console.error("Long-poll error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

/**
 * POST /realtime/typing  { matchId, isTyping }
 * Typing indicators are ephemeral: they auto-expire after 3s server-side,
 * so a dropped request can never leave a stuck "typing..." state.
 */
const typingTimeouts = new Map<string, NodeJS.Timeout>();

export async function handleTyping(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) return;

  const { matchId, isTyping } = req.body as { matchId?: string; isTyping?: boolean };

  if (!matchId || typeof isTyping !== "boolean") {
    res.status(400).json({ error: "matchId and isTyping are required" });
    return;
  }

  try {
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
      select: { id: true, user1_id: true, user2_id: true },
    });

    if (!match) {
      res.status(401).json({ error: "Not authorized" });
      return;
    }

    const userName = await prisma.user
      .findUnique({ where: { id: userId }, select: { name: true } })
      .then((u) => u?.name || "Unknown");

    const expireKey = `${matchId}:${userId}`;
    const existing = typingTimeouts.get(expireKey);
    if (existing) clearTimeout(existing);

    publishToMatch(matchId, {
      type: "typing",
      matchId,
      userId,
      userName,
      isTyping,
    });

    if (isTyping) {
      // Auto-expire after 3 seconds so a stalled client never leaves a stuck state
      const timeout = setTimeout(() => {
        typingTimeouts.delete(expireKey);
        publishToMatch(matchId, {
          type: "typing",
          matchId,
          userId,
          userName,
          isTyping: false,
        });
      }, 3000);
      typingTimeouts.set(expireKey, timeout);
    } else {
      typingTimeouts.delete(expireKey);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Typing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
