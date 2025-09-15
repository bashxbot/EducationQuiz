
import { useState, useEffect } from "react";
import { Target, Trophy, Flame } from "lucide-react";

// Storage key for earned badges
const STORAGE_KEYS = {
  EARNED_BADGES: 'eduapp-earned-badges',
} as const;

// Utility functions for localStorage
function safeParseFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored);
  } catch (error) {
    console.warn(`Invalid data in localStorage for key "${key}", using default:`, error);
    return defaultValue;
  }
}

function safeSaveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage for key "${key}":`, error);
  }
}

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
  const [badges, setBadges] = useState<Badge[]>(() => 
    safeParseFromStorage(STORAGE_KEYS.EARNED_BADGES, [])
  );

  // Persist badges to localStorage whenever they change
  useEffect(() => {
    safeSaveToStorage(STORAGE_KEYS.EARNED_BADGES, badges);
  }, [badges]);

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
    const earnedIds = new Set(badges.map(b => b.id));
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

      // Only award if should earn and not already earned
      if (shouldEarn && !earnedIds.has(badge.id)) {
        const earnedBadge = { ...badge, earned: true, earnedAt: new Date().toISOString() };
        newBadges.push(earnedBadge);
      }
    });

    if (newBadges.length > 0) {
      setBadges(prev => {
        // Dedupe by id to prevent duplicates
        const existingIds = new Set(prev.map(b => b.id));
        const filteredNew = newBadges.filter(b => !existingIds.has(b.id));
        return [...prev, ...filteredNew];
      });
    }

    return newBadges;
  };

  return { getAllBadgeDefinitions, badges, checkAndAwardBadges };
}

export function useAutoAchievements(data?: BadgeData) {
  const { checkAndAwardBadges } = useBadges();

  useEffect(() => {
    if (!data) return;
    
    const newBadges = checkAndAwardBadges(data);
    if (newBadges.length > 0) {
      console.log('New badges earned:', newBadges.map(b => b.name));
    }
  }, [
    data?.totalQuizzes,
    data?.totalPoints,
    data?.currentStreak,
    data?.reasoningAccuracy,
    data ? JSON.stringify(data.history.map((h: any) => h.score)) : '[]'
  ]);

  return { checkAndAwardBadges };
}
