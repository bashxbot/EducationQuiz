
import { useState, useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";
import { z } from "zod";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  school: string;
  profilePicture?: string;
  totalPoints: number;
  currentStreak: number;
  joinDate: string;
  isAuthenticated: boolean;
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
  difficulty: string;
  timeSpent: number;
}

export interface ReasoningProgress {
  currentStreak: number;
  lastPracticeDate: string;
  totalSolved: number;
  accuracyRate: number;
}

export interface ReasoningQuizProgress {
  quizId: string;
  currentQuestionIndex: number;
  answers: string[];
  selectedDifficulty: string;
  selectedCategory: string;
  startedAt: string;
}

// Validation schemas
const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  class: z.string(),
  school: z.string(),
  profilePicture: z.string().optional(),
  totalPoints: z.number().min(0),
  currentStreak: z.number().min(0),
  joinDate: z.string(),
  isAuthenticated: z.boolean(),
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
  difficulty: z.string(),
  timeSpent: z.number(),
});

const ReasoningProgressSchema = z.object({
  currentStreak: z.number().min(0),
  lastPracticeDate: z.string(),
  totalSolved: z.number().min(0),
  accuracyRate: z.number().min(0).max(100),
});

// Utility functions with better error handling
function safeParseFromStorage<T>(key: string, schema: z.ZodSchema<T>, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;

    const parsed = JSON.parse(stored);
    const validated = schema.parse(parsed);
    return validated;
  } catch (error) {
    console.warn(`Invalid data in localStorage for key "${key}", using default:`, error);
    localStorage.removeItem(key); // Clean up invalid data
    return defaultValue;
  }
}

function safeSaveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage for key "${key}":`, error);
    // Try to free up space by removing old data
    try {
      localStorage.clear();
      localStorage.setItem(key, JSON.stringify(value));
    } catch (retryError) {
      console.error(`Failed to save even after clearing localStorage:`, retryError);
    }
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
  REASONING_QUIZ_PROGRESS: 'eduapp-reasoning-quiz-progress',
  EARNED_BADGES: 'eduapp-earned-badges',
  APP_STATE: 'eduapp-state',
} as const;

export function resetAppData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  // Dispatch reset event
  window.dispatchEvent(new CustomEvent('appDataReset'));
}

// Storage hooks with better persistence
export function useUserProfile() {
  const defaultProfile: UserProfile = {
    id: "",
    name: "",
    email: "",
    phone: "",
    class: "",
    school: "",
    profilePicture: "",
    totalPoints: 0,
    currentStreak: 0,
    joinDate: new Date().toISOString(),
    isAuthenticated: false,
  };

  const [profile, setProfile] = useState<UserProfile>(() => 
    safeParseFromStorage(STORAGE_KEYS.USER_PROFILE, UserProfileSchema, defaultProfile)
  );

  // Auto-save with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      safeSaveToStorage(STORAGE_KEYS.USER_PROFILE, profile);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile> | ((prev: UserProfile) => UserProfile)) => {
    setProfile(prev => {
      const newProfile = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: newProfile 
      }));
      
      return newProfile;
    });
  };

  const loginUser = (userDetails: Partial<UserProfile>) => {
    updateProfile({
      ...userDetails,
      isAuthenticated: true,
      joinDate: profile.joinDate || new Date().toISOString()
    });
  };

  return { profile, updateProfile, setProfile, loginUser };
}

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => 
    safeParseFromStorage(STORAGE_KEYS.CHAT_HISTORY, z.array(ChatMessageSchema), [])
  );

  useEffect(() => {
    const limitedMessages = messages.slice(-100); // Keep last 100 messages
    safeSaveToStorage(STORAGE_KEYS.CHAT_HISTORY, limitedMessages);
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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

export function useReasoningQuizProgress() {
  const [progress, setProgress] = useState<ReasoningQuizProgress | null>(() => 
    safeParseFromStorage(STORAGE_KEYS.REASONING_QUIZ_PROGRESS, z.nullable(z.object({
      quizId: z.string(),
      currentQuestionIndex: z.number(),
      answers: z.array(z.string()),
      selectedDifficulty: z.string(),
      selectedCategory: z.string(),
      startedAt: z.string(),
    })), null)
  );

  useEffect(() => {
    if (progress) {
      safeSaveToStorage(STORAGE_KEYS.REASONING_QUIZ_PROGRESS, progress);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REASONING_QUIZ_PROGRESS);
    }
  }, [progress]);

  const saveProgress = (progressData: ReasoningQuizProgress) => {
    setProgress(progressData);
  };

  const clearProgress = () => {
    setProgress(null);
  };

  return { progress, saveProgress, clearProgress };
}

export function useQuizHistory() {
  type QuizResult = z.infer<typeof QuizHistorySchema>;

  const defaultQuizHistory: QuizResult[] = [];

  const [history, setHistory] = useState<QuizResult[]>(() => 
    safeParseFromStorage(STORAGE_KEYS.QUIZ_HISTORY, z.array(QuizHistorySchema), defaultQuizHistory)
  );

  useEffect(() => {
    safeSaveToStorage(STORAGE_KEYS.QUIZ_HISTORY, history);
  }, [history]);

  const addQuizResult = (result: Omit<QuizHistory, "id" | "completedAt">) => {
    const newResult: QuizResult = {
      ...result,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      completedAt: new Date().toISOString(),
    };
    setHistory(prev => [newResult, ...prev].slice(0, 50)); // Keep only last 50 quizzes
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
        updateProgress({
          currentStreak: progress.currentStreak + 1,
          lastPracticeDate: today,
        });
      } else {
        updateProgress({
          currentStreak: 1,
          lastPracticeDate: today,
        });
      }
    }
  };

  return { progress, updateProgress, incrementStreak };
}

// Email validation utility
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation utility
export function isValidPhone(phone: string): boolean {
  // Remove all non-digits
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (10-15 digits is common for most countries)
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return false;
  }
  
  // Basic pattern matching for common formats
  const phonePattern = /^[\+]?[1-9][\d]{0,3}[\s\-]?[\(]?[\d]{3}[\)]?[\s\-]?\d{3}[\s\-]?\d{4}$/;
  return phonePattern.test(phone) || /^\d{10}$/.test(cleanPhone);
}

// Fake detection utilities
export function detectFakeEmail(email: string): boolean {
  const suspiciousPatterns = [
    /test@test\.com/i,
    /fake@fake\.com/i,
    /example@example\.com/i,
    /temp@temp\.com/i,
    /dummy@dummy\.com/i,
    /sample@sample\.com/i,
    /123@123\.com/i,
    /abc@abc\.com/i,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(email));
}

export function detectFakePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check for obvious fake patterns
  const fakePatterns = [
    /^1{10,}$/, // All 1s
    /^0{10,}$/, // All 0s
    /^123456789[0-9]?$/, // Sequential numbers
    /^987654321[0-9]?$/, // Reverse sequential
    /^(\d)\1{9,}$/, // Repeated digits
  ];
  
  return fakePatterns.some(pattern => pattern.test(cleanPhone));
}
