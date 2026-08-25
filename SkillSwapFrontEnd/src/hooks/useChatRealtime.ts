import { useEffect, useRef } from 'react';
import { useChatStore, type Message } from '@/chat/chatStore';
import { pollForUpdates } from '@/chat/chatApi';

/**
 * Instagram-model realtime hook: HTTP long-polling instead of WebSockets.
 *
 * The client continuously re-issues `GET /realtime/poll?matchId=&after=`.
 * The server holds the request open until a match event occurs (or ~25s),
 * and the `after` cursor guarantees no event is ever missed between polls —
 * the DB is the source of truth and catch-up happens on every poll.
 */
export function useChatRealtime(
  matchId: string | null,
  myUserId: string | null,
  enabled = true,
) {
  const myUserIdRef = useRef(myUserId);
  myUserIdRef.current = myUserId;

  useEffect(() => {
    if (!matchId || !myUserId || !enabled) return;

    let cancelled = false;
    let controller: AbortController | null = null;
    let retryDelay = 500;

    const dispatch = (event: any) => {
      const store = useChatStore.getState();

      switch (event.type) {
        case 'message:new': {
          const message: Message = {
            id: event.id,
            matchId: event.match_id ?? event.matchId,
            senderId: event.sender_id,
            senderName: event.sender?.name || 'Unknown',
            senderAvatar: event.sender?.avatar,
            content: event.content,
            status: event.is_read ? 'read' : 'sent',
            createdAt: new Date(event.created_at),
            isMe: event.sender_id === myUserIdRef.current,
          };
          store.addMessage(message);
          break;
        }
        case 'message:read': {
          const readByMe = event.readBy === myUserIdRef.current;
          if (readByMe) {
            // I read the other person's messages (e.g. on another device)
            store.markMessagesAsRead(event.matchId, event.lastReadMessageId, event.readUpTo);
          } else {
            // The other person read MY messages -> blue double tick
            store.markMyMessagesAsRead(event.matchId, event.readUpTo);
          }
          break;
        }
        case 'message:delivered': {
          store.markMessageAsDelivered(event.messageId);
          break;
        }
        case 'typing': {
          store.setTyping(event.matchId, event.userId, event.userName, event.isTyping);
          break;
        }
        default:
          break;
      }
    };

    const getLatestCursor = (): string => {
      const store = useChatStore.getState();
      const messages = store.getMessagesForMatch(matchId);
      if (messages.length === 0) return '';
      const latest = messages.reduce((max, msg) =>
        msg.createdAt.getTime() > max.createdAt.getTime() ? msg : max,
      );
      return latest.createdAt.toISOString();
    };

    const loop = async () => {
      while (!cancelled) {
        try {
          controller = new AbortController();
          const after = getLatestCursor();
          const { events, online } = await pollForUpdates(matchId, after, controller.signal);

          // Presence: the `online` flag reflects the other party's active poll
          const store = useChatStore.getState();
          const conversation = store.conversations.find((c) => c.matchId === matchId);
          if (conversation) {
            store.setOnlineStatus(conversation.userId, online);
          }

          events.forEach(dispatch);
          retryDelay = 500; // reset backoff on success
        } catch (error: any) {
          if (cancelled) return;
          // Network blips are normal for long-polling; back off and retry.
          // The `after` cursor makes retries lossless.
          if (error?.code !== 'ERR_CANCELED') {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            retryDelay = Math.min(retryDelay * 2, 8000);
          }
        }
      }
    };

    loop();

    return () => {
      cancelled = true;
      controller?.abort();
    };
  }, [matchId, enabled]);
}