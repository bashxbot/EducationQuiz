import { useEffect, useState } from "react";
import { z } from "zod";
import { Target, BookOpen, Star, Award, Flame, Trophy } from "lucide-react";

export interface Badge {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: any; // Lucide icon component
  earnedAt: string;
  color: string;
}

export interface BadgeDefinition {
  type: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  condition: (data: {
    totalQuizzes: number;
    history: any[];
    totalPoints: number;
    currentStreak: number;
    reasoningAccuracy: number;
  }) => boolean;
}

// Unified badge definitions - single source of truth
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: "first_quiz",
    name: "First Steps",
    description: "Complete your first quiz",
    icon: Target,
    color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    condition: (data) => data.totalQuizzes >= 1,
  },
  {
    type: "quiz_master",
    name: "Quiz Master",
    description: "Complete 20+ quizzes",
    icon: BookOpen,
    color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    condition: (data) => data.totalQuizzes >= 20,
  },
  {
    type: "perfectionist",
    name: "Perfectionist",
    description: "Achieve 100% score",
    icon: Star,
    color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
    condition: (data) => data.history.some((quiz) => quiz.score === 100),
  },
  {
    type: "scholar",
    name: "Scholar",
    description: "Earn 1000+ points",
    icon: Award,
    color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    condition: (data) => data.totalPoints >= 1000,
  },
  {
    type: "streak_master",
    name: "Streak Master",
    description: "7+ day reasoning streak",
    icon: Flame,
    color: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    condition: (data) => data.currentStreak >= 7,
  },
  {
    type: "challenger",
    name: "Challenger",
    description: "Score 90%+ average",
    icon: Trophy,
    color: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
    condition: (data) => {
      if (data.history.length === 0) return false;
      const avgScore = data.history.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / data.history.length;
      return avgScore >= 90;
    },
  },
];

// Storage keys and validation
const STORAGE_KEYS = {
  EARNED_BADGES: 'eduapp-earned-badges',
} as const;

const BadgeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.any(), // Lucide icon component (can't validate)
  color: z.string(),
  earnedAt: z.string(),
});

function safeParseFromStorage<T>(key: string, schema: z.ZodSchema<T>, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const parsed = JSON.parse(stored);
    // For badges, we need to restore the icon components
    if (Array.isArray(parsed)) {
      const restoredBadges = parsed.map(badge => {
        const definition = BADGE_DEFINITIONS.find(def => def.type === badge.type);
        return {
          id: badge.id || Date.now().toString(),
          type: badge.type,
          name: badge.name || definition?.name || "Unknown Badge",
          description: badge.description || definition?.description || "Badge description",
          icon: definition?.icon || Target, // fallback icon
          color: definition?.color || "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
          earnedAt: badge.earnedAt || new Date().toISOString(),
        };
      });
      return restoredBadges as T;
    }
    return parsed;
  } catch (error) {
    console.warn(`Invalid badge data in localStorage, using default:`, error);
    return defaultValue;
  }
}

function safeSaveToStorage<T>(key: string, value: T): void {
  try {
    // For badges, we need to serialize without the icon functions
    if (Array.isArray(value)) {
      const serializable = value.map(badge => ({
        id: badge.id,
        type: badge.type,
        name: badge.name,
        description: badge.description,
        earnedAt: badge.earnedAt,
        // Don't save icon/color as they're restored from definitions
      }));
      localStorage.setItem(key, JSON.stringify(serializable));
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Failed to save badges to localStorage:`, error);
  }
}

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>(() => {
    const stored = safeParseFromStorage(STORAGE_KEYS.EARNED_BADGES, z.array(BadgeSchema), []);
    return stored as Badge[];
  });

  useEffect(() => {
    safeSaveToStorage(STORAGE_KEYS.EARNED_BADGES, badges);
  }, [badges]);
  
  const awardBadge = (badgeType: string) => {
    const definition = BADGE_DEFINITIONS.find(b => b.type === badgeType);
    if (!definition) return null;

    // Check if badge already exists
    const exists = badges.some(b => b.type === badgeType);
    if (exists) return null;

    const newBadge: Badge = {
      id: Date.now().toString(),
      type: badgeType,
      name: definition.name,
      description: definition.description,
      icon: definition.icon,
      color: definition.color,
      earnedAt: new Date().toISOString(),
    };
    
    setBadges(prev => [...prev, newBadge]);
    return newBadge;
  };

  const hasBadge = (type: string) => {
    return badges.some(b => b.type === type);
  };

  const checkAndAwardBadges = (data: {
    totalQuizzes: number;
    history: any[];
    totalPoints: number;
    currentStreak: number;
    reasoningAccuracy: number;
  }) => {
    const newBadges: Badge[] = [];
    
    BADGE_DEFINITIONS.forEach(definition => {
      if (!hasBadge(definition.type) && definition.condition(data)) {
        const badge = awardBadge(definition.type);
        if (badge) newBadges.push(badge);
      }
    });

    return newBadges;
  };

  const getAllBadgeDefinitions = () => {
    return BADGE_DEFINITIONS.map(def => ({
      ...def,
      earned: hasBadge(def.type),
    }));
  };

  return { 
    badges, 
    awardBadge, 
    hasBadge, 
    checkAndAwardBadges,
    getAllBadgeDefinitions,
    BADGE_DEFINITIONS 
  };
}

// Hook to automatically check achievements when data changes
export function useAutoAchievements(data: {
  totalQuizzes: number;
  history: any[];
  totalPoints: number;
  currentStreak: number;
  reasoningAccuracy: number;
}) {
  const { checkAndAwardBadges } = useBadges();

  useEffect(() => {
    const newBadges = checkAndAwardBadges(data);
    if (newBadges.length > 0) {
      // Could show toast notifications here
      console.log('New badges earned:', newBadges.map(b => b.name));
    }
  }, [
    data.totalQuizzes,
    data.totalPoints,
    data.currentStreak,
    data.reasoningAccuracy,
    JSON.stringify(data.history.map(h => h.score)), // Only check scores for efficiency
  ]);

  return { checkAndAwardBadges };
}