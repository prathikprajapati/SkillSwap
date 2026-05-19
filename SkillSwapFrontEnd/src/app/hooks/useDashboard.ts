import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { matchesApi, type RecommendedMatch } from "../api/matches";
import { usersApi } from "../api/users";
import { useMemo } from "react";

export interface DashboardUser {
  id: string;
  name: string;
  bio: string;
  image: string;
  followers: number;
  posts: number;
  verified: boolean;
  teachSkill: string;
  learnSkill: string;
  offeredSkills: string[];
  wantedSkills: string[];
}

const transformRecommendedMatch = (match: RecommendedMatch): DashboardUser => ({
  id: match.id,
  name: match.name,
  bio: `Looking to learn ${match.wantedSkills.join(", ")}`,
  image: match.avatar || "https://via.placeholder.com/150",
  followers: Math.floor(Math.random() * 1000) + 100,
  posts: Math.floor(Math.random() * 50) + 5,
  verified: Math.random() > 0.5,
  teachSkill: match.offeredSkills[0] || "Unknown",
  learnSkill: match.wantedSkills[0] || "Unknown",
  offeredSkills: match.offeredSkills,
  wantedSkills: match.wantedSkills,
});

export function useDashboard() {
  const { user, refreshUser } = useAuth();

  const { data: recommendedMatches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ["matches/recommended"],
    queryFn: () => matchesApi.getRecommended(),
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["users/me"],
    queryFn: () => usersApi.getMe(),
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  const recommendedUsers = useMemo(() => {
    if (!recommendedMatches) return [];
    return recommendedMatches.map(transformRecommendedMatch);
  }, [recommendedMatches]);

  const stats = useMemo(
    () => ({
      level: currentUser?.level || user?.level || 1,
      streak: currentUser?.streak || user?.streak || 0,
      xpCurrent: currentUser?.xp || user?.xp || 1250,
      matches: recommendedMatches?.length || 0,
      rating: 4.8,
    }),
    [currentUser, user, recommendedMatches],
  );

  return {
    user: currentUser || user,
    recommendedUsers,
    stats,
    isLoading: isLoadingMatches || isLoadingUser,
    refetchUsers: refreshUser,
  };
}
