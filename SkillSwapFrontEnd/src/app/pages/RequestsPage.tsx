import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  Inbox, 
  Check, 
  X, 
  Clock, 
  UserPlus,
  MessageCircle
} from "lucide-react";
import { requestsApi, type MatchRequest } from "../api/requests";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const transformRequest = (request: MatchRequest, type: "incoming" | "sent") => {
  const user = type === "incoming" ? request.sender : request.receiver;
  return {
    id: request.id,
    user: {
      name: user?.name || "Unknown",
      avatar: user?.avatar,
      bio: `Looking to learn ${(user?.wantedSkills || []).map(s => s.name).join(", ")}`,
    },
    skillOffered: (user?.offeredSkills || []).map(s => s.name).join(", "),
    skillWanted: (user?.wantedSkills || []).map(s => s.name).join(", "),
    message: "Hi! I'd like to exchange skills with you.",
    timestamp: formatTimestamp(request.created_at),
    status: request.status,
  };
};

/* ── Request Card Component ── */
const RequestCard = forwardRef<HTMLDivElement, { 
  request: any; 
  type: "incoming" | "sent";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}>(({ 
  request, 
  type,
  onAccept, 
  onReject 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="card-hover p-6"
    >
      <div className="flex gap-4">
        <Avatar
          src={request.user.avatar}
          alt={request.user.name}
          size="lg"
          initials={request.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
        />

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{request.user.name}</h3>
              <p className="text-sm text-muted-foreground">{request.user.bio}</p>
            </div>
            <span className="text-xs text-muted-foreground">{request.timestamp}</span>
          </div>

          {/* Skill Exchange */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 bg-surface rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">They offer</p>
              <p className="text-sm font-medium text-foreground">{request.skillOffered}</p>
            </div>
            <div className="text-muted-foreground">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="flex-1 bg-surface rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">You get</p>
              <p className="text-sm font-medium text-foreground">{request.skillWanted}</p>
            </div>
          </div>

          {/* Message */}
          {request.message && (
            <div className="mt-4 p-3 bg-surface rounded-xl">
              <p className="text-sm text-muted-foreground">"{request.message}"</p>
            </div>
          )}

          {/* Actions */}
          {type === "incoming" ? (
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={() => onAccept?.(request.id)}
                className="flex-1 btn-primary"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button 
                onClick={() => onReject?.(request.id)}
                variant="outline" 
                className="flex-1 btn-secondary"
              >
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              {request.status === "pending" ? (
                <div className="flex items-center gap-2 text-warning">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Pending response</span>
                </div>
              ) : request.status === "accepted" ? (
                <div className="flex items-center gap-2 text-success">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Accepted - Start chatting!</span>
                  <Button size="sm" className="ml-2 btn-primary">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-error">
                  <X className="w-4 h-4" />
                  <span className="text-sm">Declined</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

RequestCard.displayName = "RequestCard";

/* ── Main Requests Page ── */
export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<"incoming" | "sent">("incoming");
  const queryClient = useQueryClient();

  const { data: incomingRequests = [], isLoading: isLoadingIncoming } = useQuery({
    queryKey: ["requests/incoming"],
    queryFn: () => requestsApi.getIncoming(),
  });

  const { data: sentRequests = [], isLoading: isLoadingSent } = useQuery({
    queryKey: ["requests/sent"],
    queryFn: () => requestsApi.getSent(),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => requestsApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests/incoming"] });
      queryClient.invalidateQueries({ queryKey: ["requests/sent"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => requestsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests/incoming"] });
    },
  });

  const transformedIncoming = incomingRequests.map(r => transformRequest(r, "incoming"));
  const transformedSent = sentRequests.map(r => transformRequest(r, "sent"));

  const handleAccept = (id: string) => {
    acceptMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Requests</h1>
          <p className="text-neutral-400 mt-1">Manage your skill swap requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-neutral-800/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
              activeTab === "incoming"
                ? "bg-white text-neutral-900"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Inbox className="w-5 h-5" />
            <span className="font-medium">Incoming</span>
            {transformedIncoming.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {transformedIncoming.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
              activeTab === "sent"
                ? "bg-white text-neutral-900"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Send className="w-5 h-5" />
            <span className="font-medium">Sent</span>
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {isLoadingIncoming || isLoadingSent ? (
            <div className="text-center py-12">
              <p className="text-neutral-400">Loading requests...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {activeTab === "incoming" ? (
                transformedIncoming.length > 0 ? (
                  transformedIncoming.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      type="incoming"
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Inbox className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-neutral-400">No incoming requests</p>
                    <p className="text-sm text-neutral-500 mt-1">
                      Requests from other users will appear here
                    </p>
                  </motion.div>
                )
              ) : (
                transformedSent.length > 0 ? (
                  transformedSent.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      type="sent"
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Send className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-neutral-400">No sent requests</p>
                    <p className="text-sm text-neutral-500 mt-1">
                      Start exploring to send skill swap requests!
                    </p>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

