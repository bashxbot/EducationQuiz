
import { useState, useEffect } from "react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earned: boolean;
  earnedAt?: string;
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
      icon: "🎯",
      requirement: "Complete 1 quiz",
      earned: false
    },
    {
      id: "quiz-master",
      name: "Quiz Master",
      description: "Complete 10 quizzes",
      icon: "🏆",
      requirement: "Complete 10 quizzes",
      earned: false
    },
    {
      id: "streak-keeper",
      name: "Streak Keeper",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      requirement: "7-day streak",
      earned: false
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
