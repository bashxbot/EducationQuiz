import { eq, desc, and } from "drizzle-orm";
import { db } from "./db";
import { 
  users,
  chatMessages, 
  quizzes,
  reasoningChallenges,
  userProgress,
  badges,
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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getChatHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
    
    return messages.reverse();
  }

  async addChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async clearChatHistory(userId: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db
      .insert(quizzes)
      .values(insertQuiz)
      .returning();
    return quiz;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz || undefined;
  }

  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.createdAt));
  }

  async updateQuizScore(id: string, score: number, completed: boolean): Promise<Quiz | undefined> {
    const [quiz] = await db
      .update(quizzes)
      .set({ 
        score, 
        completed, 
        completedAt: completed ? new Date() : null 
      })
      .where(eq(quizzes.id, id))
      .returning();
    return quiz || undefined;
  }

  async createReasoningChallenge(insertChallenge: InsertReasoningChallenge): Promise<ReasoningChallenge> {
    const [challenge] = await db
      .insert(reasoningChallenges)
      .values(insertChallenge)
      .returning();
    return challenge;
  }

  async getUserReasoningChallenges(userId: string): Promise<ReasoningChallenge[]> {
    return await db
      .select()
      .from(reasoningChallenges)
      .where(eq(reasoningChallenges.userId, userId))
      .orderBy(desc(reasoningChallenges.createdAt));
  }

  async updateReasoningAnswer(id: string, answer: string, correct: boolean, points: number): Promise<ReasoningChallenge | undefined> {
    const [challenge] = await db
      .update(reasoningChallenges)
      .set({ 
        userAnswer: answer,
        correct,
        points,
        completedAt: new Date()
      })
      .where(eq(reasoningChallenges.id, id))
      .returning();
    return challenge || undefined;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values(insertProgress)
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.subject],
        set: insertProgress
      })
      .returning();
    return progress;
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    return await db
      .select()
      .from(badges)
      .where(eq(badges.userId, userId))
      .orderBy(desc(badges.earnedAt));
  }

  async awardBadge(insertBadge: InsertBadge): Promise<Badge> {
    const [badge] = await db
      .insert(badges)
      .values(insertBadge)
      .returning();
    return badge;
  }
}

export const storage = new DatabaseStorage();