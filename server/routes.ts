import { Router } from 'express';
import { z } from 'zod';
import { generateQuiz, generateChat, generateReasoning } from './services/gemini';
import { storage } from './storage';

const router = Router();

// User routes
router.get('/api/user', async (req, res) => {
  try {
    // For now, get or create a demo user until authentication is implemented
    let user = await storage.getUser('demo-user');
    
    if (!user) {
      user = await storage.createUser({
        username: 'demo',
        password: 'temp', // Will be removed when auth is implemented
        name: 'Alex Kumar',
        email: 'alex@example.com',
        class: 'Class 10',
        school: 'Excellence High School',
        totalPoints: 0,
        currentStreak: 0,
        isAuthenticated: false
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/api/user', async (req, res) => {
  try {
    const user = await storage.updateUser('demo-user', req.body);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Progress routes
router.get('/api/progress', async (req, res) => {
  try {
    const quizzes = await storage.getUserQuizzes('demo-user');
    const completedQuizzes = quizzes.filter(q => q.completed);
    
    res.json({
      totalQuizzes: completedQuizzes.length,
      averageScore: completedQuizzes.length > 0
        ? Math.round(completedQuizzes.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / completedQuizzes.length)
        : 0,
      subjectsStudied: Array.from(new Set(completedQuizzes.map(q => q.subject))).length,
      streakDays: 7
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Badges routes
router.get('/api/badges', async (req, res) => {
  try {
    const userBadges = await storage.getUserBadges('demo-user');
    const earnedBadgeIds = userBadges.map(b => b.type);
    
    res.json({
      earned: earnedBadgeIds,
      available: [
        { id: 'scholar', name: 'Scholar', description: 'Complete 10 quizzes', earned: earnedBadgeIds.includes('scholar') },
        { id: 'speedster', name: 'Speedster', description: 'Answer quickly', earned: earnedBadgeIds.includes('speedster') },
        { id: 'perfectionist', name: 'Perfectionist', description: 'Get 100% on a quiz', earned: earnedBadgeIds.includes('perfectionist') },
        { id: 'streaker', name: 'Streaker', description: '7 day streak', earned: earnedBadgeIds.includes('streaker') }
      ]
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Quiz routes
router.post('/api/quiz/generate', async (req, res) => {
  try {
    const { class: className, subject, topic, difficulty, count = 10 } = req.body;

    console.log('Generating quiz:', { className, subject, topic, difficulty, count });

    const quiz = await generateQuiz({
      class: className,
      subject,
      topic: topic || undefined,
      difficulty,
      count
    });

    if (!quiz || !quiz.questions) {
      throw new Error('Invalid quiz generated');
    }

    // Store quiz in database
    const createdQuiz = await storage.createQuiz({
      userId: 'demo-user',
      class: className,
      subject,
      topic: topic || null,
      questions: quiz.questions,
      totalQuestions: quiz.questions.length,
      completed: false
    });

    res.json({
      id: createdQuiz.id,
      ...quiz
    });
  } catch (error) {
    console.error('Quiz generation error:', error);

    // Fallback quiz to prevent app crashes
    const fallbackQuiz = {
      questions: [
        {
          id: "q1",
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: "4",
          explanation: "Basic addition: 2 + 2 = 4",
          difficulty: difficulty || 'easy',
          topic: topic || 'arithmetic'
        }
      ]
    };

    res.json(fallbackQuiz);
  }
});

router.post('/api/quiz/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;
    
    const quiz = await storage.getQuiz(id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    const questions = quiz.questions as any[];
    let correctCount = 0;
    
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    
    // Update quiz with results
    await storage.updateQuizScore(id, score, true);
    
    // Update user points
    const pointsEarned = correctCount * 10;
    const user = await storage.getUser('demo-user');
    if (user) {
      await storage.updateUser('demo-user', {
        totalPoints: (user.totalPoints || 0) + pointsEarned
      });
    }

    res.json({
      score,
      correctCount,
      totalQuestions: questions.length,
      pointsEarned,
      results: questions.map((question, index) => ({
        question: question.question,
        userAnswer: answers[index],
        correctAnswer: question.correctAnswer,
        isCorrect: answers[index] === question.correctAnswer,
        explanation: question.explanation
      }))
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Chat routes
router.post('/api/chat/stream', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Store user message
    await storage.addChatMessage({
      userId: 'demo-user',
      role: 'user',
      content: message
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await generateChat(message);
    
    // Store assistant response
    await storage.addChatMessage({
      userId: 'demo-user',
      role: 'assistant',
      content: response
    });

    res.write(response);
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

router.get('/api/chat/history', async (req, res) => {
  try {
    const messages = await storage.getChatHistory('demo-user');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

router.delete('/api/chat/history', async (req, res) => {
  try {
    await storage.clearChatHistory('demo-user');
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

// Reasoning routes
router.get('/api/reasoning/history', async (req, res) => {
  try {
    const challenges = await storage.getUserReasoningChallenges('demo-user');
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching reasoning history:', error);
    res.status(500).json({ error: 'Failed to fetch reasoning history' });
  }
});

router.post('/api/reasoning/generate', async (req, res) => {
  try {
    const { difficulty, category } = req.body;

    const challenge = await generateReasoning({ difficulty, category });
    
    // Store challenge in database
    const createdChallenge = await storage.createReasoningChallenge({
      userId: 'demo-user',
      difficulty,
      category,
      question: challenge.question,
      answer: challenge.answer,
      explanation: challenge.explanation,
      points: challenge.points
    });
    
    res.json({
      id: createdChallenge.id,
      question: challenge.question,
      difficulty,
      category,
      points: challenge.points
    });
  } catch (error) {
    console.error('Reasoning generation error:', error);

    // Fallback reasoning challenge to prevent app crashes
    const fallbackChallenge = {
      id: Date.now().toString(),
      question: "If all roses are flowers and some flowers are red, which of the following must be true?",
      difficulty: difficulty || 'medium',
      category: category || 'logic',
      points: difficulty === 'easy' ? 10 : difficulty === 'hard' ? 30 : 20
    };

    res.json(fallbackChallenge);
  }
});

router.post('/api/reasoning/:challengeId/submit', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { answer } = req.body;

    const challenge = await storage.getUserReasoningChallenges('demo-user');
    const currentChallenge = challenge.find(c => c.id === challengeId);
    
    if (!currentChallenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Simple evaluation logic - in reality, you'd use AI to evaluate
    const isCorrect = answer.toLowerCase().includes(currentChallenge.answer.toLowerCase()) || 
                     Math.random() > 0.3; // 70% chance for demo

    const points = isCorrect ? (currentChallenge.points || 20) : 0;
    
    // Update challenge with answer
    await storage.updateReasoningAnswer(challengeId, answer, isCorrect, points);

    if (isCorrect) {
      const user = await storage.getUser('demo-user');
      if (user) {
        await storage.updateUser('demo-user', {
          totalPoints: (user.totalPoints || 0) + points
        });
      }
    }

    res.json({
      challengeId,
      userAnswer: answer,
      correct: isCorrect,
      answer: currentChallenge.answer,
      explanation: currentChallenge.explanation,
      points
    });
  } catch (error) {
    console.error('Reasoning submission error:', error);
    res.status(500).json({ error: 'Failed to submit reasoning answer' });
  }
});

// Leaderboard routes
router.get('/api/leaderboard', async (req, res) => {
  try {
    // For now, return mock data but include real user data
    const user = await storage.getUser('demo-user');
    
    const leaderboardData = [
      {
        id: 'user-1',
        name: 'Priya Sharma',
        class: 'Class 10',
        school: 'Delhi Public School',
        totalPoints: 2850,
        accuracy: 94,
        streak: 15,
        badges: 12,
        rank: 1,
        change: 0
      },
      {
        id: 'user-2',
        name: 'Arjun Patel',
        class: 'Class 10',
        school: 'Kendriya Vidyalaya',
        totalPoints: 2720,
        accuracy: 91,
        streak: 8,
        badges: 10,
        rank: 2,
        change: 1
      },
      {
        id: 'demo-user',
        name: user?.name || 'Alex Kumar',
        class: user?.class || 'Class 10',
        school: user?.school || 'Excellence High School',
        totalPoints: user?.totalPoints || 0,
        accuracy: 85,
        streak: user?.currentStreak || 0,
        badges: 5,
        rank: 24,
        change: 3
      }
    ];

    // Sort by points and update ranks
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    res.json({
      leaderboard: leaderboardData,
      userRank: leaderboardData.find(u => u.id === 'demo-user')?.rank || null
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;