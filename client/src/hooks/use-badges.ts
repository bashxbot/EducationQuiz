
import { useState, useEffect } from "react";
import { Target, Trophy, Flame } from "lucide-react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  requirement: string;
  earned: boolean;
  earnedAt?: string;
  color: string;
  type: string;
}

export interface BadgeData {
  totalQuizzes: number;
  history: any[];
  totalPoints: number;
  currentStreak: number;
  reasoningAccuracy: number;
}

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);

  const getAllBadgeDefinitions = (): Badge[] => [
    {
      id: "first-quiz",
      name: "First Steps",
      description: "Complete your first quiz",
      icon: Target,
      requirement: "Complete 1 quiz",
      earned: false,
      color: "bg-blue-500 text-white",
      type: "first-quiz"
    },
    {
      id: "quiz-master",
      name: "Quiz Master",
      description: "Complete 10 quizzes",
      icon: Trophy,
      requirement: "Complete 10 quizzes",
      earned: false,
      color: "bg-yellow-500 text-white",
      type: "quiz-master"
    },
    {
      id: "streak-keeper",
      name: "Streak Keeper",
      description: "Maintain a 7-day streak",
      icon: Flame,
      requirement: "7-day streak",
      earned: false,
      color: "bg-red-500 text-white",
      type: "streak-keeper"
    }
  ];

  const checkAndAwardBadges = (data: BadgeData): Badge[] => {
    const allBadges = getAllBadgeDefinitions();
    const newBadges: Badge[] = [];

    allBadges.forEach(badge => {
      let shouldEarn = false;

      switch (badge.id) {
        case "first-quiz":
          shouldEarn = data.totalQuizzes >= 1;
          break;
        case "quiz-master":
          shouldEarn = data.totalQuizzes >= 10;
          break;
        case "streak-keeper":
          shouldEarn = data.currentStreak >= 7;
          break;
      }

      if (shouldEarn && !badge.earned) {
        const earnedBadge = { ...badge, earned: true, earnedAt: new Date().toISOString() };
        newBadges.push(earnedBadge);
      }
    });

    if (newBadges.length > 0) {
      setBadges(prev => [...prev, ...newBadges]);
    }

    return newBadges;
  };

  return { getAllBadgeDefinitions, badges, checkAndAwardBadges };
}

export function useAutoAchievements(data: BadgeData) {
  const { checkAndAwardBadges } = useBadges();

  useEffect(() => {
    const newBadges = checkAndAwardBadges(data);
    if (newBadges.length > 0) {
      console.log('New badges earned:', newBadges.map(b => b.name));
    }
  }, [
    data.totalQuizzes,
    data.totalPoints,
    data.currentStreak,
    data.reasoningAccuracy,
    JSON.stringify(data.history.map(h => h.score))
  ]);

  return { checkAndAwardBadges };
}
