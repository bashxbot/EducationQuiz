import { createContext, useContext, useEffect } from "react";
import { useUserProfile, useQuizHistory, useReasoningProgress } from "@/hooks/use-app-storage";
import { useAutoAchievements } from "@/hooks/use-badges";

interface AchievementContextType {
  // Could add methods here for manual badge checking if needed
}

const AchievementContext = createContext<AchievementContextType>({});

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();
  const { history } = useQuizHistory();
  const { progress: reasoningProgress } = useReasoningProgress();

  // Automatically check achievements whenever relevant data changes
  useAutoAchievements({
    totalQuizzes: history.length,
    history,
    totalPoints: profile.totalPoints,
    currentStreak: reasoningProgress.currentStreak,
    reasoningAccuracy: reasoningProgress.accuracyRate,
  });

  return (
    <AchievementContext.Provider value={{}}>
      {children}
    </AchievementContext.Provider>
  );
}

export const useAchievements = () => useContext(AchievementContext);