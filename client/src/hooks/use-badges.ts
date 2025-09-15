
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
import { useState, useEffect } from 'react';
import { useQuizHistory, useReasoningProgress } from './use-app-storage';

export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export interface BadgeData {
  earned: string[];
  available: Badge[];
}

export function useBadges() {
  const [badges, setBadges] = useState<BadgeData>({
    earned: [],
    available: []
  });

  useEffect(() => {
    // Load badges from localStorage
    const savedBadges = localStorage.getItem('eduapp-earned-badges');
    const earnedBadges = savedBadges ? JSON.parse(savedBadges) : [];

    const availableBadges: Badge[] = [
      {
        id: 'scholar',
        name: 'Scholar',
        description: 'Complete 10 quizzes',
        earned: earnedBadges.includes('scholar')
      },
      {
        id: 'speedster',
        name: 'Speedster',
        description: 'Answer quickly',
        earned: earnedBadges.includes('speedster')
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Get 100% on a quiz',
        earned: earnedBadges.includes('perfectionist')
      },
      {
        id: 'streaker',
        name: 'Streaker',
        description: '7 day streak',
        earned: earnedBadges.includes('streaker')
      },
      {
        id: 'quiz-master',
        name: 'Quiz Master',
        description: 'Complete 25 quizzes',
        earned: earnedBadges.includes('quiz-master')
      }
    ];

    setBadges({
      earned: earnedBadges,
      available: availableBadges
    });
  }, []);

  const earnBadge = (badgeId: string) => {
    setBadges(prev => {
      if (prev.earned.includes(badgeId)) return prev;

      const newEarned = [...prev.earned, badgeId];
      localStorage.setItem('eduapp-earned-badges', JSON.stringify(newEarned));

      return {
        ...prev,
        earned: newEarned,
        available: prev.available.map(badge => 
          badge.id === badgeId ? { ...badge, earned: true } : badge
        )
      };
    });
  };

  return { badges, earnBadge };
}

export function useAutoAchievements() {
  const { quizHistory } = useQuizHistory();
  const { progress } = useReasoningProgress();
  const { earnBadge } = useBadges();

  useEffect(() => {
    // Check for achievements based on quiz history
    if (quizHistory.length >= 10) {
      earnBadge('scholar');
    }

    if (quizHistory.length >= 25) {
      earnBadge('quiz-master');
    }

    // Check for perfect score
    const hasPerfectScore = quizHistory.some(quiz => quiz.score === 100);
    if (hasPerfectScore) {
      earnBadge('perfectionist');
    }

    // Check for speed achievement (if quiz time is tracked)
    const hasSpeedRun = quizHistory.some(quiz => 
      quiz.timeSpent && quiz.timeSpent < 120 // Less than 2 minutes
    );
    if (hasSpeedRun) {
      earnBadge('speedster');
    }

    // Check for streak
    if (progress && progress.currentStreak >= 7) {
      earnBadge('streaker');
    }
  }, [quizHistory, progress, earnBadge]);
}
