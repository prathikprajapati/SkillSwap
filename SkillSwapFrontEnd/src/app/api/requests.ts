import apiClient from "./client";

export interface MatchRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
    offeredSkills: Array<{ name: string }>;
    wantedSkills: Array<{ name: string }>;
  };
  receiver?: {
    id: string;
    name: string;
    avatar?: string;
    offeredSkills: Array<{ name: string }>;
    wantedSkills: Array<{ name: string }>;
  };
}

export interface CreateRequestData {
  receiver_id: string;
}

export const requestsApi = {
  getIncoming: async (): Promise<MatchRequest[]> => {
    const response = await apiClient.get("/requests/incoming");
    return response.data;
  },

  getSent: async (): Promise<MatchRequest[]> => {
    const response = await apiClient.get("/requests/sent");
    return response.data;
  },

  create: async (data: CreateRequestData): Promise<void> => {
    await apiClient.post("/requests", data);
  },

  accept: async (requestId: string): Promise<void> => {
    await apiClient.put(`/requests/${requestId}/accept`);
  },

  reject: async (requestId: string): Promise<void> => {
    await apiClient.put(`/requests/${requestId}/reject`);
  },
};

export default requestsApi;
