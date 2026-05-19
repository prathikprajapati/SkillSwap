import { useState, useEffect } from "react";
import { Search, Send, MoreVertical, Check, CheckCheck, AlertCircle } from "lucide-react";
import { useChatStore, type Message } from "../../chat/chatStore";
import { joinMatch, leaveMatch, sendMessage, sendTyping, markAsRead as markAsReadSocket } from "../../chat/chatSocketHandler";
import { getConversations, getMessages, markAsRead as markAsReadApi } from "../../chat/chatApi";
import { useAuth } from "../contexts/AuthContext";
import { Avatar } from "@/components/base/avatar/avatar";
import MessageSkeleton from "@/app/components/ui/MessageSkeleton";
import MeetingModal from "@/app/components/ui/MeetingModal";

export default function Messages() {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  
  const {
    conversations,
    currentMatchId,
    getSortedMessages,
    setCurrentMatchId,
    setConversations,
    setMessages,
    addMessage,
    markMessageAsFailed,
    markMessagesAsRead,
    resetUnreadCount,
    typingUsers,
  } = useChatStore();

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      getConversations()
        .then((data) => setConversations(data))
        .catch((error) => console.error("Failed to load conversations:", error));
    }
  }, [user, setConversations]);

  // Show skeleton when no conversations or loading
  const showSkeleton = conversations.length === 0;

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId && user) {
      getMessages(selectedChatId)
        .then((messages) => {
          // Mark messages from current user as isMe
          const messagesWithIsMe = messages.map(msg => ({
            ...msg,
            isMe: msg.senderId === user.id
          }));
          setMessages(selectedChatId, messagesWithIsMe);
          setCurrentMatchId(selectedChatId);
          joinMatch(selectedChatId);
          
          // Mark messages as read and reset unread count
          const lastMessage = messagesWithIsMe[messagesWithIsMe.length - 1];
          if (lastMessage && !lastMessage.isMe) {
            markAsReadSocket(selectedChatId, lastMessage.id);
            markAsReadApi(selectedChatId, lastMessage.id);
          }
          // Always reset unread count when opening chat
          resetUnreadCount(selectedChatId);
        })
        .catch((error) => console.error("Failed to load messages:", error));
    }

    return () => {
      if (selectedChatId) {
        leaveMatch(selectedChatId);
      }
    };
  }, [selectedChatId, setMessages, setCurrentMatchId, markMessagesAsRead, resetUnreadCount, user]);

  // Handle typing indicator
  useEffect(() => {
    if (currentMatchId && messageText.trim()) {
      sendTyping(currentMatchId, true);
    } else if (currentMatchId) {
      sendTyping(currentMatchId, false);
    }
  }, [messageText, currentMatchId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !currentMatchId) {
      return;
    }

    // Check for /meet command
    if (messageText.trim() === '/meet') {
      setShowMeetingModal(true);
      setMessageText("");
      return;
    }

    const trimmedContent = messageText.trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistic UI: Add message immediately with "sending" status
    const optimisticMessage: Message = {
      tempId,
      matchId: currentMatchId,
      senderId: user?.id || "",
      senderName: user?.name || "Me",
      senderAvatar: user?.avatar,
      content: trimmedContent,
      status: "sending",
      createdAt: new Date(),
      isMe: true,
    };

    addMessage(optimisticMessage);
    setMessageText("");

    // Send via socket (non-blocking)
    try {
      sendMessage(currentMatchId, trimmedContent, tempId);
    } catch (error) {
      console.error("Failed to send message:", error);
      markMessageAsFailed(tempId);
    }
  };

  const selectedConversation = conversations.find(c => c.matchId === selectedChatId);
  const messages = currentMatchId ? getSortedMessages(currentMatchId) : [];
  
  // Get typing users for current match
  const currentTypingUsers = Array.from(typingUsers.values())
    .filter(t => t.isTyping)
    .map(t => t.userName);

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get message status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending":
        return <span className="h-3 w-3 rounded-full border border-muted-foreground/30 border-t-transparent animate-spin" />;
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "failed":
        return <AlertCircle className="h-3 w-3 text-error" />;
      default:
        return null;
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "U"; // Use "U" for Unknown instead of "?"
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Handle meeting submission
  const handleMeetingSubmit = (meetingData: any) => {
    // Here you would typically send the meeting data to your backend
    console.log('Meeting scheduled:', meetingData);
    
    // Create a mock session for immediate UI update
    const mockSession = {
      id: `session-${Date.now()}`,
      teacher_id: "current-user",
      learner_id: meetingData.participantEmail || "pending-user",
      skill_id: meetingData.skillCategory,
      status: "scheduled" as const,
      scheduled_at: `${meetingData.date}T${meetingData.time}:00Z`,
      created_at: new Date().toISOString(),
      title: meetingData.title,
      description: meetingData.description,
      teacher: {
        id: "current-user",
        name: "Current User",
        avatar: "CU"
      },
      learner: meetingData.participantEmail ? {
        id: "learner-user",
        name: meetingData.participantEmail,
        avatar: "LU"
      } : undefined,
      skill: {
        id: meetingData.skillCategory,
        name: meetingData.skillCategory,
        category: meetingData.skillCategory
      }
    };
    
    // Add a system message to the chat
    if (currentMatchId) {
      const systemMessage: Message = {
        tempId: `system-${Date.now()}`,
        matchId: currentMatchId,
        senderId: 'system',
        senderName: 'SkillSwap',
        content: `📅 Meeting scheduled: "${meetingData.title}" on ${meetingData.date} at ${meetingData.time}`,
        status: 'sent',
        createdAt: new Date(),
        isMe: false,
      };
      addMessage(systemMessage);
    }

    // Emit custom event to notify Schedule page
    console.log('Emitting session:created event:', mockSession);
    window.dispatchEvent(new CustomEvent('session:created', { detail: mockSession }));
  };

  // Show skeleton when no conversations
  if (showSkeleton) {
    return <MessageSkeleton />;
  }

  return (
    <>
      <div className="h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto px-4 h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 h-full py-4">
          {/* Conversations List */}
          <div className="hidden md:block md:col-span-1 border rounded-xl bg-card overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-8rem)]">
              {conversations.map((conversation) => (
                <button
                  key={conversation.matchId}
                  onClick={() => setSelectedChatId(conversation.matchId)}
                  className={`w-full p-4 border-b hover:bg-accent transition-colors text-left ${
                    selectedChatId === conversation.matchId ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={conversation.avatar}
                      alt={conversation.name}
                      size="md"
                      initials={getInitials(conversation.name)}
                      status={conversation.online ? "online" : undefined}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="truncate">{conversation.name}</h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ""}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 border rounded-xl bg-card flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedConversation?.avatar}
                  alt={selectedConversation?.name || "Unknown"}
                  size="sm"
                  initials={selectedConversation ? getInitials(selectedConversation.name) : "?"}
                  status={selectedConversation?.online ? "online" : undefined}
                />
                <div>
                  <h3>{selectedConversation?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation?.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <button className="p-2 rounded-md hover:bg-accent transition-colors">
                <MoreVertical className="h-5 w-5 flex-shrink-0" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentTypingUsers.length > 0 && (
                <div className="text-sm text-muted-foreground italic">
                  {currentTypingUsers.join(", ")} {currentTypingUsers.length === 1 ? "is" : "are"} typing...
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id || message.tempId}
                  className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${message.isMe ? "order-2" : "order-1"}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent"
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <p className="text-xs text-muted-foreground">
                        {formatTime(message.createdAt)}
                      </p>
                      {message.isMe && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Send className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
      
      {/* Meeting Modal */}
      <MeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        onSubmit={handleMeetingSubmit}
      />
    </>
  );
}
