
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

interface AchievementContextType {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  unlockAchievement: (achievementId: string) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  
  const achievements: Achievement[] = [
    {
      id: "first-chat",
      title: "First Chat",
      description: "Sent your first message",
      icon: "💬"
    },
    {
      id: "quiz-master",
      title: "Quiz Master", 
      description: "Completed your first quiz",
      icon: "🧠"
    }
  ];

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !unlockedAchievements.find(a => a.id === achievementId)) {
      setUnlockedAchievements(prev => [...prev, { ...achievement, unlockedAt: new Date() }]);
    }
  };

  return (
    <AchievementContext.Provider value={{
      achievements,
      unlockedAchievements,
      unlockAchievement
    }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error("useAchievements must be used within AchievementProvider");
  }
  return context;
}
