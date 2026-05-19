import apiClient from "./client";
import type { UserProfile } from "./users";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  message?: string;
  user: UserProfile;
}


export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Firebase Auth methods
  firebaseLogin: async (idToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/firebase-login", {}, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
    return response.data;
  },

  firebaseSignup: async (idToken: string, name?: string): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/firebase-signup", { name }, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });
    return response.data;
  },
};

export default authApi;
