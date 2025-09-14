import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, 
  insertQuizSchema, 
  insertReasoningChallengeSchema,
  quizQuestionSchema,
  type QuizQuestion 
} from "@shared/schema";
import { z } from "zod";
import { generateQuizQuestions, getChatResponse, generateReasoningChallenge } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Demo user endpoint
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser("demo-user");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Chat endpoints
  app.get("/api/chat/history", async (req, res) => {
    try {
      const messages = await storage.getChatHistory("demo-user");
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat history" });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const { content } = insertChatMessageSchema.parse({
        ...req.body,
        userId: "demo-user",
        role: "user"
      });

      // Save user message
      const userMessage = await storage.addChatMessage({
        userId: "demo-user",
        role: "user",
        content,
      });

      // Get AI response
      const aiResponse = await getChatResponse(content);
      
      // Save AI message
      const aiMessage = await storage.addChatMessage({
        userId: "demo-user",
        role: "assistant",
        content: aiResponse.response,
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.post("/api/chat/stream", async (req, res) => {
    try {
      const { content } = req.body;

      // Save user message
      await storage.addChatMessage({
        userId: "demo-user",
        role: "user",
        content,
      });

      // Set up SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      });

      // Get AI response with streaming simulation
      const aiResponse = await getChatResponse(content);
      const words = aiResponse.response.split(' ');
      let accumulatedContent = '';

      // Simulate streaming by sending words with delays
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');
        accumulatedContent += word;
        
        res.write(`data: ${JSON.stringify({ content: word })}\n\n`);
        
        // Add small delay between words for streaming effect
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Save complete AI message
      await storage.addChatMessage({
        userId: "demo-user",
        role: "assistant",
        content: aiResponse.response,
      });

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      console.error("Streaming chat error:", error);
      res.write(`data: ${JSON.stringify({ error: "Failed to process message" })}\n\n`);
      res.end();
    }
  });

  // Quiz endpoints
  app.post("/api/quiz/generate", async (req, res) => {
    try {
      const { class: className, subject, topic, difficulty = "medium", count = 10 } = req.body;
      
      if (!className || !subject) {
        return res.status(400).json({ message: "Class and subject are required" });
      }

      const questions = await generateQuizQuestions({
        class: className,
        subject,
        topic,
        difficulty,
        count,
      });

      const quiz = await storage.createQuiz({
        userId: "demo-user",
        class: className,
        subject,
        topic,
        questions: questions as any,
        totalQuestions: questions.length,
      });

      res.json(quiz);
    } catch (error) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  app.get("/api/quiz/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz" });
    }
  });

  app.post("/api/quiz/:id/submit", async (req, res) => {
    try {
      const { answers } = req.body;
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const questions = quiz.questions as QuizQuestion[];
      let correctCount = 0;
      
      questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const updatedQuiz = await storage.updateQuizScore(req.params.id, score, true);

      // Update user points
      const user = await storage.getUser("demo-user");
      if (user) {
        const pointsEarned = Math.max(score - 50, 0); // Points for scores above 50%
        await storage.updateUser("demo-user", {
          totalPoints: user.totalPoints + pointsEarned,
        });
      }

      res.json({ ...updatedQuiz, correctCount, totalQuestions: questions.length });
    } catch (error) {
      console.error("Quiz submission error:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  app.get("/api/quiz/history", async (req, res) => {
    try {
      const quizzes = await storage.getUserQuizzes("demo-user");
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz history" });
    }
  });

  // Reasoning endpoints
  app.post("/api/reasoning/generate", async (req, res) => {
    try {
      const { difficulty = "medium", category = "logic" } = req.body;
      
      const challenge = await generateReasoningChallenge(difficulty, category);
      
      const reasoningChallenge = await storage.createReasoningChallenge({
        userId: "demo-user",
        difficulty,
        category,
        question: challenge.question,
        answer: challenge.answer,
      });

      // Don't send the answer to the client
      const { answer, ...challengeWithoutAnswer } = reasoningChallenge;
      res.json(challengeWithoutAnswer);
    } catch (error) {
      console.error("Reasoning generation error:", error);
      res.status(500).json({ message: "Failed to generate reasoning challenge" });
    }
  });

  app.post("/api/reasoning/:id/submit", async (req, res) => {
    try {
      const { answer } = req.body;
      const challenge = await storage.getUserReasoningChallenges("demo-user")
        .then(challenges => challenges.find(c => c.id === req.params.id));
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      const isCorrect = answer.toLowerCase().trim() === challenge.answer?.toLowerCase().trim();
      const pointsMap = { easy: 10, medium: 20, hard: 30 };
      const points = isCorrect ? pointsMap[challenge.difficulty as keyof typeof pointsMap] || 10 : 0;

      const updatedChallenge = await storage.updateReasoningAnswer(
        req.params.id, 
        answer, 
        isCorrect, 
        points
      );

      // Update user points and streak
      const user = await storage.getUser("demo-user");
      if (user && isCorrect) {
        await storage.updateUser("demo-user", {
          totalPoints: user.totalPoints + points,
          currentStreak: user.currentStreak + 1,
        });
      }

      res.json(updatedChallenge);
    } catch (error) {
      console.error("Reasoning submission error:", error);
      res.status(500).json({ message: "Failed to submit reasoning answer" });
    }
  });

  app.get("/api/reasoning/history", async (req, res) => {
    try {
      const challenges = await storage.getUserReasoningChallenges("demo-user");
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reasoning history" });
    }
  });

  // Progress endpoints
  app.get("/api/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress("demo-user");
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get progress" });
    }
  });

  // Badge endpoints
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getUserBadges("demo-user");
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to get badges" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
