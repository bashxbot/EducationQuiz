import { useState, useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";
import { z } from "zod";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  class: string;
  school: string;
  profilePicture?: string;
  totalPoints: number;
  currentStreak: number;
  joinDate: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface QuizProgress {
  quizId: string;
  currentQuestionIndex: number;
  answers: string[];
  selectedClass: string;
  selectedSubject: string;
  selectedTopic: string;
  startedAt: string;
}

export interface QuizHistory {
  id: string;
  subject: string;
  topic?: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  class: string;
}

export interface ReasoningProgress {
  currentStreak: number;
  lastPracticeDate: string;
  totalSolved: number;
  accuracyRate: number;
}

// Validation schemas
const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  class: z.string(),
  school: z.string(),
  profilePicture: z.string().optional(),
  totalPoints: z.number().min(0),
  currentStreak: z.number().min(0),
  joinDate: z.string(),
});

const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
});

const QuizHistorySchema = z.object({
  id: z.string(),
  subject: z.string(),
  topic: z.string().optional(),
  score: z.number().min(0).max(100),
  totalQuestions: z.number().min(1),
  completedAt: z.string(),
  class: z.string(),
});

const ReasoningProgressSchema = z.object({
  currentStreak: z.number().min(0),
  lastPracticeDate: z.string(),
  totalSolved: z.number().min(0),
  accuracyRate: z.number().min(0).max(100),
});

// Utility functions
function safeParseFromStorage<T>(key: string, schema: z.ZodSchema<T>, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;

    const parsed = JSON.parse(stored);
    const validated = schema.parse(parsed);
    return validated;
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

// App-specific storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'eduapp-user-profile',
  CHAT_HISTORY: 'eduapp-chat-history',
  QUIZ_HISTORY: 'eduapp-quiz-history',
  QUIZ_PROGRESS: 'eduapp-quiz-progress',
  REASONING_PROGRESS: 'eduapp-reasoning-progress',
  REASONING_HISTORY: 'eduapp-reasoning-history',
  EARNED_BADGES: 'eduapp-earned-badges',
} as const;

export function resetAppData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Storage hooks
export function useUserProfile() {
  const defaultProfile: UserProfile = {
    id: "demo-user",
    name: "Alex Kumar",
    email: "alex@school.edu",
    class: "Class 10",
    school: "Excellence High School",
    profilePicture: "",
    totalPoints: 1240,
    currentStreak: 7,
    joinDate: new Date("2024-03-01").toISOString(),
  };

  const [profile, setProfile] = useState<UserProfile>(() => 
    safeParseFromStorage(STORAGE_KEYS.USER_PROFILE, UserProfileSchema, defaultProfile)
  );

  useEffect(() => {
    safeSaveToStorage(STORAGE_KEYS.USER_PROFILE, profile);
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return { profile, updateProfile, setProfile };
}

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => 
    safeParseFromStorage(STORAGE_KEYS.CHAT_HISTORY, z.array(ChatMessageSchema), [])
  );

  useEffect(() => {
    // Limit chat history to prevent localStorage overflow
    const limitedMessages = messages.slice(-100); // Keep last 100 messages
    if (limitedMessages.length !== messages.length) {
      setMessages(limitedMessages);
    }
    safeSaveToStorage(STORAGE_KEYS.CHAT_HISTORY, limitedMessages);
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  };

  return { messages, addMessage, clearMessages };
}

export function useQuizProgress() {
  const [progress, setProgress] = useState<QuizProgress | null>(() => 
    safeParseFromStorage(STORAGE_KEYS.QUIZ_PROGRESS, z.nullable(z.object({
      quizId: z.string(),
      currentQuestionIndex: z.number(),
      answers: z.array(z.string()),
      selectedClass: z.string(),
      selectedSubject: z.string(),
      selectedTopic: z.string(),
      startedAt: z.string(),
    })), null)
  );

  useEffect(() => {
    if (progress) {
      safeSaveToStorage(STORAGE_KEYS.QUIZ_PROGRESS, progress);
    } else {
      localStorage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS);
    }
  }, [progress]);

  const saveProgress = (progressData: QuizProgress) => {
    setProgress(progressData);
  };

  const clearProgress = () => {
    setProgress(null);
  };

  return { progress, saveProgress, clearProgress };
}

export function useQuizHistory() {
  // Define the QuizResult type based on the schema for clarity
  type QuizResult = z.infer<typeof QuizHistorySchema>;

  const defaultQuizHistory: QuizResult[] = []; // Default to empty array

  const [history, setHistory] = useState<QuizResult[]>(() => 
    safeParseFromStorage(STORAGE_KEYS.QUIZ_HISTORY, z.array(QuizHistorySchema), defaultQuizHistory)
  );

  useEffect(() => {
    safeSaveToStorage(STORAGE_KEYS.QUIZ_HISTORY, history);
  }, [history]);

  const addQuizResult = (result: Omit<QuizHistory, "id" | "completedAt">) => {
    const newResult: QuizResult = { // Use QuizResult type here
      ...result,
      id: Date.now().toString(),
      completedAt: new Date().toISOString(),
    };
    setHistory([newResult, ...history].slice(0, 50)); // Keep only last 50 quizzes
    return newResult;
  };

  const getAverageScore = () => {
    if (history.length === 0) return 0;
    return Math.round(history.reduce((sum, quiz) => sum + quiz.score, 0) / history.length);
  };

  const getSubjectStats = () => {
    const subjects = history.reduce((acc, quiz) => {
      if (!acc[quiz.subject]) {
        acc[quiz.subject] = { count: 0, totalScore: 0 };
      }
      acc[quiz.subject].count++;
      acc[quiz.subject].totalScore += quiz.score;
      return acc;
    }, {} as Record<string, { count: number; totalScore: number }>);

    return Object.entries(subjects).map(([subject, stats]) => ({
      subject,
      count: stats.count,
      averageScore: Math.round(stats.totalScore / stats.count),
    }));
  };

  return { history, addQuizResult, getAverageScore, getSubjectStats };
}

export function useReasoningProgress() {
  const defaultProgress: ReasoningProgress = {
    currentStreak: 0,
    lastPracticeDate: "",
    totalSolved: 0,
    accuracyRate: 0,
  };

  const [progress, setProgress] = useState<ReasoningProgress>(() => 
    safeParseFromStorage(STORAGE_KEYS.REASONING_PROGRESS, ReasoningProgressSchema, defaultProgress)
  );

  useEffect(() => {
    safeSaveToStorage(STORAGE_KEYS.REASONING_PROGRESS, progress);
  }, [progress]);

  const updateProgress = (updates: Partial<ReasoningProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const incrementStreak = () => {
    const today = new Date().toDateString();
    const lastDate = progress.lastPracticeDate;

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate === yesterday.toDateString()) {
        // Consecutive day, increment streak
        updateProgress({
          currentStreak: progress.currentStreak + 1,
          lastPracticeDate: today,
        });
      } else {
        // Streak broken, reset to 1
        updateProgress({
          currentStreak: 1,
          lastPracticeDate: today,
        });
      }
    }
  };

  return { progress, updateProgress, incrementStreak };
}

// Badge functionality moved to use-badges.ts

// Auto-achievement functionality moved to use-badges.ts