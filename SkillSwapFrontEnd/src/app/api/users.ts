import apiClient from "./client";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  profile_completion: number;
  offeredSkills: UserSkill[];
  wantedSkills: UserSkill[];
  streak?: number;
  level?: number;
  xp?: number;
}

export interface UserSkill {
  id: string;
  skill_id: string;
  name: string;
  skill_type: "offer" | "want";
  proficiency_level: "beginner" | "intermediate" | "expert";
  category?: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar?: string;
}

export const usersApi = {
  getMe: async (): Promise<UserProfile> => {
    try {
      const response = await apiClient.get("/users/me");
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Return mock user data when backend is unavailable
      if ((error as any)?.isNetworkError || (error as any)?.code === 'ERR_NETWORK') {
        console.warn('Using mock user data');
        return {
          id: 'mock-user-123',
          email: 'testuser@gmail.com',
          name: 'Test User',
          avatar: 'TU',
          profile_completion: 75,
          offeredSkills: [
            {
              id: 'skill-1',
              skill_id: '1',
              name: 'Spanish Language',
              skill_type: 'offer' as const,
              proficiency_level: 'intermediate' as const,
              category: 'Languages'
            }
          ],
          wantedSkills: [
            {
              id: 'skill-2',
              skill_id: '2',
              name: 'Guitar Lessons',
              skill_type: 'want' as const,
              proficiency_level: 'beginner' as const,
              category: 'Music'
            }
          ],
          streak: 5,
          level: 3,
          xp: 150
        };
      }
      throw error;
    }
  },

  updateMe: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await apiClient.put("/users/me", data);
    return response.data;
  },
};

export default usersApi;
