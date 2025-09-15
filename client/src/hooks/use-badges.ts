import { useState, useEffect } from 'react';
import { useQuizHistory, useReasoningProgress, useUserProfile } from './use-app-storage';

export interface Badge {
  id: string;
  name: string;
  description: string;
  points: number;
  condition: (stats: any) => boolean;
}

const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete your first quiz',
    points: 10,
    condition: (stats) => stats.totalQuizzes > 0
  },
  {
    id: 'speedster',
    name: 'Speedster',
    description: 'Complete a quiz in under 2 minutes',
    points: 25,
    condition: (stats) => stats.fastestTime < 120
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Score 100% on a quiz',
    points: 50,
    condition: (stats) => stats.perfectScores > 0
  },
  {
    id: 'streaker',
    name: 'Streaker',
    description: 'Maintain a 7-day streak',
    points: 30,
    condition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Complete 10 quizzes',
    points: 100,
    condition: (stats) => stats.totalQuizzes >= 10
  }
];

export function useBadges() {
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem('earned-badges');
    return saved ? JSON.parse(saved) : [];
  });

  const addBadge = (badgeId: string) => {
    if (!earnedBadges.includes(badgeId)) {
      const newBadges = [...earnedBadges, badgeId];
      setEarnedBadges(newBadges);
      localStorage.setItem('earned-badges', JSON.stringify(newBadges));
    }
  };

  return {
    badges: {
      available: AVAILABLE_BADGES,
      earned: earnedBadges
    },
    addBadge
  };
}

export function useAutoAchievements() {
  const { quizHistory } = useQuizHistory();
  const { reasoningProgress } = useReasoningProgress();
  const { profile } = useUserProfile();
  const { badges, addBadge } = useBadges();

  useEffect(() => {
    // Safely calculate stats with default values
    const stats = {
      totalQuizzes: quizHistory?.length || 0,
      perfectScores: quizHistory?.filter(q => q.score === 100).length || 0,
      fastestTime: quizHistory?.length > 0 ? Math.min(...quizHistory.map(q => q.timeSpent || 300)) : 300,
      currentStreak: profile?.currentStreak || 0,
      totalReasoningChallenges: reasoningProgress?.length || 0
    };

    // Check for new badges
    AVAILABLE_BADGES.forEach(badge => {
      if (!badges.earned.includes(badge.id) && badge.condition(stats)) {
        addBadge(badge.id);
      }
    });
  }, [quizHistory, reasoningProgress, profile, badges.earned, addBadge]);
}