import apiClient from "./client";

export interface Session {
  id: string;
  teacher_id: string;
  learner_id: string;
  skill_id?: string;
  status: "scheduled" | "in_progress" | "completed";
  scheduled_at?: string;
  completed_at?: string;
  created_at: string;
  teacher?: {
    id: string;
    name: string;
    avatar?: string;
  };
  learner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  skill?: {
    id: string;
    name: string;
    category?: string;
  };
}

export interface CreateSessionData {
  teacher_id: string;
  learner_id: string;
  skill_id?: string;
  scheduled_at?: string;
}

export interface UpdateSessionData {
  status?: "scheduled" | "in_progress" | "completed";
  scheduled_at?: string;
}

export const sessionsApi = {
  // Get all sessions for the current user (as teacher or learner)
  getMySessions: async (): Promise<Session[]> => {
    const response = await apiClient.get("/sessions");
    return response.data;
  },

  // Get a specific session by ID
  getSession: async (id: string): Promise<Session> => {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data;
  },

  // Create a new session
  createSession: async (data: CreateSessionData): Promise<Session> => {
    const response = await apiClient.post("/sessions", data);
    return response.data;
  },

  // Update a session
  updateSession: async (id: string, data: UpdateSessionData): Promise<Session> => {
    const response = await apiClient.put(`/sessions/${id}`, data);
    return response.data;
  },

  // Delete a session
  deleteSession: async (id: string): Promise<void> => {
    await apiClient.delete(`/sessions/${id}`);
  },
};

export default sessionsApi;
