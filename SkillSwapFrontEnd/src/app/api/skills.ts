import apiClient from "./client";

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface AddSkillData {
  skill_id: string;
  skill_type: "offer" | "want";
  proficiency_level: "beginner" | "intermediate" | "expert";
}

export const skillsApi = {
  getAll: async (): Promise<Skill[]> => {
    try {
      const response = await apiClient.get("/skills");
      return response.data;
    } catch (error) {
      console.error('Error fetching skills:', error);
      // Return mock skills when backend is unavailable
      if ((error as any)?.isNetworkError || (error as any)?.code === 'ERR_NETWORK') {
        console.warn('Using mock skills data');
        return [
          { id: '1', name: 'Spanish Language', category: 'Languages' },
          { id: '2', name: 'Guitar Lessons', category: 'Music' },
          { id: '3', name: 'Web Development', category: 'Technology' },
          { id: '4', name: 'Photography', category: 'Arts' },
          { id: '5', name: 'Cooking', category: 'Cooking' },
          { id: '6', name: 'Yoga', category: 'Fitness' },
          { id: '7', name: 'French Language', category: 'Languages' },
          { id: '8', name: 'Piano Lessons', category: 'Music' },
          { id: '9', name: 'Digital Marketing', category: 'Business' },
          { id: '10', name: 'Creative Writing', category: 'Arts' }
        ];
      }
      throw error;
    }
  },

  addToProfile: async (data: AddSkillData): Promise<void> => {
    await apiClient.post("/users/me/skills", data);
  },

  removeFromProfile: async (skillId: string): Promise<void> => {
    await apiClient.delete(`/users/me/skills/${skillId}`);
  },
};

export default skillsApi;
