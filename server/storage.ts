import { 
  type User, 
  type InsertUser, 
  type ChatMessage, 
  type InsertChatMessage,
  type Quiz,
  type InsertQuiz,
  type ReasoningChallenge,
  type InsertReasoningChallenge,
  type UserProgress,
  type InsertUserProgress,
  type Badge,
  type InsertBadge
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Chat operations
  getChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatHistory(userId: string): Promise<void>;

  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  getUserQuizzes(userId: string): Promise<Quiz[]>;
  updateQuizScore(id: string, score: number, completed: boolean): Promise<Quiz | undefined>;

  // Reasoning operations
  createReasoningChallenge(challenge: InsertReasoningChallenge): Promise<ReasoningChallenge>;
  getUserReasoningChallenges(userId: string): Promise<ReasoningChallenge[]>;
  updateReasoningAnswer(id: string, answer: string, correct: boolean, points: number): Promise<ReasoningChallenge | undefined>;

  // Progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;

  // Badge operations
  getUserBadges(userId: string): Promise<Badge[]>;
  awardBadge(badge: InsertBadge): Promise<Badge>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private quizzes: Map<string, Quiz> = new Map();
  private reasoningChallenges: Map<string, ReasoningChallenge> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private badges: Map<string, Badge> = new Map();

  constructor() {
    // Initialize with a demo user
    const demoUser: User = {
      id: "demo-user",
      username: "demo",
      password: "password",
      name: "Alex Kumar",
      class: "Class 10",
      totalPoints: 1240,
      currentStreak: 7,
      joinDate: new Date("2024-03-01"),
    };
    this.users.set(demoUser.id, demoUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      totalPoints: 0,
      currentStreak: 0,
      joinDate: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getChatHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0))
      .slice(-limit);
  }

  async addChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async clearChatHistory(userId: string): Promise<void> {
    for (const [id, message] of this.chatMessages.entries()) {
      if (message.userId === userId) {
        this.chatMessages.delete(id);
      }
    }
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = randomUUID();
    const quiz: Quiz = {
      ...insertQuiz,
      id,
      completed: false,
      createdAt: new Date(),
      completedAt: null,
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values())
      .filter(quiz => quiz.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateQuizScore(id: string, score: number, completed: boolean): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;

    const updatedQuiz = {
      ...quiz,
      score,
      completed,
      completedAt: completed ? new Date() : null,
    };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  async createReasoningChallenge(insertChallenge: InsertReasoningChallenge): Promise<ReasoningChallenge> {
    const id = randomUUID();
    const challenge: ReasoningChallenge = {
      ...insertChallenge,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.reasoningChallenges.set(id, challenge);
    return challenge;
  }

  async getUserReasoningChallenges(userId: string): Promise<ReasoningChallenge[]> {
    return Array.from(this.reasoningChallenges.values())
      .filter(challenge => challenge.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateReasoningAnswer(id: string, answer: string, correct: boolean, points: number): Promise<ReasoningChallenge | undefined> {
    const challenge = this.reasoningChallenges.get(id);
    if (!challenge) return undefined;

    const updatedChallenge = {
      ...challenge,
      userAnswer: answer,
      correct,
      points,
      completedAt: new Date(),
    };
    this.reasoningChallenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const existingProgress = Array.from(this.userProgress.values())
      .find(p => p.userId === insertProgress.userId && p.subject === insertProgress.subject);

    if (existingProgress) {
      const updatedProgress = {
        ...existingProgress,
        ...insertProgress,
        updatedAt: new Date(),
      };
      this.userProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      const id = randomUUID();
      const progress: UserProgress = {
        ...insertProgress,
        id,
        updatedAt: new Date(),
      };
      this.userProgress.set(id, progress);
      return progress;
    }
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    return Array.from(this.badges.values())
      .filter(badge => badge.userId === userId)
      .sort((a, b) => (b.earnedAt?.getTime() || 0) - (a.earnedAt?.getTime() || 0));
  }

  async awardBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = randomUUID();
    const badge: Badge = {
      ...insertBadge,
      id,
      earnedAt: new Date(),
    };
    this.badges.set(id, badge);
    return badge;
  }
}

export const storage = new MemStorage();
