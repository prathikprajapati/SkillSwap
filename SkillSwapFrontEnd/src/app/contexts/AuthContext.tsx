import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { usersApi, type UserProfile } from "../api/users";
import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser
} from "firebase/auth";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const isLoggingIn = React.useRef(false);
  const lastSyncTime = React.useRef<number>(0);
  const isMounted = React.useRef(true);
  const syncTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lastAuthSync");
    if (stored) lastSyncTime.current = parseInt(stored, 10);
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!isMounted.current) return;
      setFirebaseUser(fbUser);

      if (fbUser) {
        if (isLoggingIn.current) return;

        if (syncTimeout.current) {
          clearTimeout(syncTimeout.current);
          syncTimeout.current = null;
        }

        const existingUserStr = localStorage.getItem("user");

        if (existingUserStr) {
          try {
            const existingUser = JSON.parse(existingUserStr);
            setUser(existingUser);
            setIsLoading(false);

            const now = Date.now();
            const timeSinceLastSync = now - lastSyncTime.current;
            if (timeSinceLastSync < 5 * 60 * 1000) {
              return;
            }

            syncTimeout.current = setTimeout(async () => {
              if (!isMounted.current || isLoggingIn.current) return;
              isLoggingIn.current = true;
              try {
                console.log(" AuthContext: Starting background sync...");
                const userData = await usersApi.getMe();
                console.log(" AuthContext: Backend sync successful", userData);
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
                lastSyncTime.current = Date.now();
                localStorage.setItem("lastAuthSync", lastSyncTime.current.toString());
                // Navigate to dashboard after successful sync
                if (window.location.pathname === '/auth') {
                  console.log(" AuthContext: Navigating to dashboard...");
                  window.location.href = '/dashboard';
                }
              } catch (error) {
                const errorDetails = (error as any)?.response?.data || (error as any)?.message;
                if ((error as any)?.isNetworkError || (error as any)?.code === 'ERR_NETWORK') {
                  console.warn(" AuthContext: Backend not available, using cached user data");
                  // Use cached user data if available
                  const cachedUser = localStorage.getItem("user");
                  if (cachedUser && !user) {
                    try {
                      const userData = JSON.parse(cachedUser);
                      setUser(userData);
                      console.log(" AuthContext: Using cached user data");
                    } catch (parseError) {
                      console.error(" AuthContext: Failed to parse cached user data");
                    }
                  }
                } else {
                  console.error(" AuthContext: Background sync failed:", error);
                  console.error(" Error details:", errorDetails);
                }
              } finally {
                isLoggingIn.current = false;
              }
            }, 1000);
            return;
          } catch {
            const now = Date.now();
            if (now - lastSyncTime.current < 2000) {
              console.log("Rate limiting auth sync, retrying in 2s...");
              syncTimeout.current = setTimeout(() => {
                if (isMounted.current) {
                  setFirebaseUser(fbUser);
                }
              }, 2000);
              return;
            }

            isLoggingIn.current = true;
            try {
              console.log("🔄 AuthContext: Starting sync (no cached user)...");
              const userData = await usersApi.getMe();
              console.log("✅ AuthContext: Backend sync successful", userData);
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
              lastSyncTime.current = Date.now();
              localStorage.setItem("lastAuthSync", lastSyncTime.current.toString());
              // Navigate to dashboard after successful sync
              if (window.location.pathname === '/auth') {
                console.log("🚀 AuthContext: Navigating to dashboard...");
                window.location.href = '/dashboard';
              }
            } catch (error) {
              console.error("❌ AuthContext: Failed to sync with backend:", error);
              console.error("❌ Error details:", (error as any)?.response?.data || (error as any)?.message);
              setUser(null);
              localStorage.removeItem("user");
              localStorage.removeItem("lastAuthSync");
            } finally {
              isLoggingIn.current = false;
            }
          }
        } else {
          const now = Date.now();
          if (now - lastSyncTime.current < 2000) {
            console.log("Rate limiting auth sync, retrying in 2s...");
            syncTimeout.current = setTimeout(() => {
              if (isMounted.current) {
                setFirebaseUser(fbUser);
              }
            }, 2000);
            return;
          }

          isLoggingIn.current = true;
          try {
            console.log("🔄 AuthContext: Starting sync (new user)...");
            const userData = await usersApi.getMe();
            console.log("✅ AuthContext: Backend sync successful", userData);
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            lastSyncTime.current = Date.now();
            localStorage.setItem("lastAuthSync", lastSyncTime.current.toString());
            // Navigate to dashboard after successful sync
            if (window.location.pathname === '/auth') {
              console.log("🚀 AuthContext: Navigating to dashboard...");
              window.location.href = '/dashboard';
            }
          } catch (error) {
            console.error("❌ AuthContext: Failed to sync with backend:", error);
            console.error("❌ Error details:", (error as any)?.response?.data || (error as any)?.message);
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("lastAuthSync");
          } finally {
            isLoggingIn.current = false;
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("lastAuthSync");
      }
      if (isMounted.current) setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Use Firebase auth directly
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the rest
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with name
      await updateProfile(userCredential.user, { displayName: name });
      // The onAuthStateChanged listener will handle the rest
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem("user");
  };

  const refreshUser = async () => {
    try {
      if (firebaseUser) {
        const userData = await usersApi.getMe();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      if ((error as any)?.response?.status === 401) {
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
