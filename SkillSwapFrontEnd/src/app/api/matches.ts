import apiClient from "./client";

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    offeredSkills: string[];
    wantedSkills: string[];
  };
  lastMessage?: {
    content: string;
    created_at: string;
    is_read: boolean;
  };
}

export interface RecommendedMatch {
  id: string;
  name: string;
  avatar?: string;
  matchScore: number;
  offeredSkills: string[];
  wantedSkills: string[];
  isOnline: boolean;
  profile_completion: number;
}

export const matchesApi = {
  getRecommended: async (): Promise<RecommendedMatch[]> => {
    const response = await apiClient.get("/matches/recommended");
    return response.data;
  },

  getMyMatches: async (): Promise<Match[]> => {
    const response = await apiClient.get("/matches");
    return response.data;
  },

  getMatchById: async (id: string): Promise<Match> => {
    const response = await apiClient.get(`/matches/${id}`);
    return response.data;
  },
};

export default matchesApi;
