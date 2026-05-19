import apiClient from "./client";

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface SendMessageData {
  match_id: string;
  content: string;
}

export const messagesApi = {
  getByMatchId: async (matchId: string): Promise<Message[]> => {
    const response = await apiClient.get(`/matches/${matchId}/messages`);
    return response.data;
  },

  send: async (data: SendMessageData): Promise<Message> => {
    const response = await apiClient.post("/messages", data);
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<void> => {
    await apiClient.put(`/messages/${messageId}/read`);
  },
};

export default messagesApi;
