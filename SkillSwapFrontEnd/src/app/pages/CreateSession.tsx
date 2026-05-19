import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { sessionsApi } from "../api/sessions";

export default function CreateSession() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateTestSession = async () => {
    if (!user) return;

    setIsCreating(true);
    setMessage("");

    try {
      // Create a test session with the current user as both teacher and learner for testing
      const session = await sessionsApi.createSession({
        teacher_id: user.id,
        learner_id: user.id, // In real app, this would be another user's ID
        skill_id: null, // Optional skill
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      });

      setMessage(`Test session created successfully! ID: ${session.id}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      setMessage("Failed to create session. Check console for details.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Test Session Creation</h1>
          <p className="text-muted-foreground mb-8">
            This page is for testing the session database integration.
          </p>

          {user && (
            <div className="bg-card p-6 rounded-lg border mb-6">
              <p className="text-sm text-muted-foreground mb-2">Logged in as:</p>
              <p className="font-medium">{user.name} ({user.email})</p>
            </div>
          )}

          <button
            onClick={handleCreateTestSession}
            disabled={isCreating || !user}
            className="btn-primary py-2 px-6"
          >
            {isCreating ? "Creating..." : "Create Test Session"}
          </button>

          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.includes("successfully") 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
