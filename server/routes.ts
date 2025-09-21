
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
      try {
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
      } catch (createError: any) {
        // If user already exists due to constraint, try to fetch again
        if (createError.code === '23505') {
          user = await storage.getUser('demo-user');
          if (!user) {
            throw new Error('Failed to create or fetch demo user');
          }
        } else {
          throw createError;
        }
      }
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

router.put('/api/user/profile', async (req, res) => {
  try {
    // Global profile update endpoint
    const user = await storage.updateUser('demo-user', req.body);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Badges routes
router.get('/api/badges', async (req, res) => {
  try {
    // Return demo badges data
    const badges = [
      {
        id: 'first-quiz',
        name: 'First Quiz',
        description: 'Complete your first quiz',
        icon: 'Trophy',
        color: 'from-yellow-400 to-yellow-600',
        unlocked: true,
        unlockedAt: new Date().toISOString()
      },
      {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Maintain a 7-day streak',
        icon: 'Flame',
        color: 'from-orange-400 to-red-500',
        unlocked: true,
        unlockedAt: new Date().toISOString()
      },
      {
        id: 'scholar',
        name: 'Scholar',
        description: 'Complete 10 quizzes',
        icon: 'Star',
        color: 'from-blue-400 to-blue-600',
        unlocked: false
      }
    ];
    
    res.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
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

// Enhanced fallback quiz generation
const generateFallbackQuiz = (params: any) => {
  const questions = [
    {
      id: "fallback_1",
      question: "What is the basic unit of matter?",
      options: ["Atom", "Molecule", "Cell", "Proton"],
      correctAnswer: "Atom",
      explanation: "An atom is the smallest unit of ordinary matter that forms a chemical element.",
      difficulty: params.difficulty || 'medium',
      topic: params.topic || 'General Science'
    },
    {
      id: "fallback_2", 
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Mercury"],
      correctAnswer: "Mars",
      explanation: "Mars appears red due to iron oxide (rust) on its surface.",
      difficulty: params.difficulty || 'medium',
      topic: params.topic || 'Astronomy'
    },
    {
      id: "fallback_3",
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      explanation: "Paris is the capital and most populous city of France.",
      difficulty: params.difficulty || 'easy',
      topic: params.topic || 'Geography'
    },
    {
      id: "fallback_4",
      question: "What is 15 × 8?",
      options: ["120", "125", "115", "130"],
      correctAnswer: "120",
      explanation: "15 × 8 = 120",
      difficulty: params.difficulty || 'easy',
      topic: params.topic || 'Mathematics'
    },
    {
      id: "fallback_5",
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      correctAnswer: "William Shakespeare",
      explanation: "Romeo and Juliet is a tragedy written by William Shakespeare.",
      difficulty: params.difficulty || 'medium',
      topic: params.topic || 'Literature'
    }
  ];

  // Return random questions based on count
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return { questions: shuffled.slice(0, Math.min(params.count || 5, questions.length)) };
};

// Quiz routes
router.post('/api/quiz/generate', async (req, res) => {
  try {
    const { class: className, subject, topic, difficulty, count = 10 } = req.body;

    console.log('Generating quiz:', { className, subject, topic, difficulty, count });

    let quiz;
    try {
      quiz = await generateQuiz({
        class: className,
        subject,
        topic: topic || undefined,
        difficulty,
        count
      });

      if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        throw new Error('Empty quiz generated');
      }
    } catch (aiError) {
      console.error('AI quiz generation failed, using fallback:', aiError);
      quiz = generateFallbackQuiz({ class: className, subject, topic, difficulty, count });
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

    // Ultimate fallback
    const fallbackQuiz = generateFallbackQuiz(req.body);
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
    const { content, image, mimeType } = req.body;
    
    // Store user message
    await storage.addChatMessage({
      userId: 'demo-user',
      role: 'user',
      content: content
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let response;
    try {
      const imageData = image ? { base64: image, mimeType: mimeType || 'image/jpeg' } : undefined;
      response = await generateChat(content, imageData);
    } catch (aiError) {
      console.error('AI chat generation failed, using fallback:', aiError);
      if (image) {
        response = `I can see you've uploaded an image, but I'm having trouble analyzing it right now. Please try again or describe what you'd like to know about the image.`;
      } else {
        response = `I understand you're asking about "${content}". While I'm having some technical difficulties right now, I'd be happy to help you learn more about this topic. Could you provide more specific details about what you'd like to know?`;
      }
    }
    
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

// Enhanced fallback reasoning generation
const generateFallbackReasoning = (params: any) => {
  const challenges = [
    {
      question: "If all roses are flowers and some flowers are red, which statement must be true?",
      answer: "Some roses might be red",
      explanation: "This is a logical reasoning problem. While we know all roses are flowers, and some flowers are red, we cannot conclude that all roses are red or that no roses are red. The only logical conclusion is that some roses might be red.",
      difficulty: params.difficulty || 'medium',
      category: params.category || 'logic',
      points: params.difficulty === 'easy' ? 10 : params.difficulty === 'hard' ? 30 : 20
    },
    {
      question: "What comes next in this sequence: 2, 6, 12, 20, 30, ?",
      answer: "42",
      explanation: "This sequence follows the pattern n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.",
      difficulty: params.difficulty || 'medium',  
      category: 'number',
      points: params.difficulty === 'easy' ? 10 : params.difficulty === 'hard' ? 30 : 20
    },
    {
      question: "A man lives on the 20th floor. Every morning he takes the elevator down to the ground floor. When he comes home, he takes the elevator to the 10th floor and walks the rest, except when it's raining. Why?",
      answer: "He is too short to reach the button for the 20th floor, except when he has an umbrella",
      explanation: "This is a classic lateral thinking puzzle. The man is too short to reach the button for the 20th floor, but can reach the 10th floor button. When it's raining, he has an umbrella which he can use to press the higher button.",
      difficulty: 'hard',
      category: 'analytical',
      points: 30
    }
  ];

  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
  return {
    ...randomChallenge,
    id: `reasoning_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
};

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

    let challenge;
    try {
      challenge = await generateReasoning({ difficulty, category });
      
      if (!challenge || !challenge.question) {
        throw new Error('Invalid challenge generated');
      }
    } catch (aiError) {
      console.error('AI reasoning generation failed, using fallback:', aiError);
      challenge = generateFallbackReasoning({ difficulty, category });
    }
    
    // Store challenge in database
    const createdChallenge = await storage.createReasoningChallenge({
      userId: 'demo-user',
      difficulty: challenge.difficulty,
      category: challenge.category,
      question: challenge.question,
      answer: challenge.answer,
      explanation: challenge.explanation,
      points: challenge.points
    });
    
    res.json({
      id: createdChallenge.id,
      question: challenge.question,
      difficulty: challenge.difficulty,
      category: challenge.category,
      points: challenge.points
    });
  } catch (error) {
    console.error('Reasoning generation error:', error);

    // Ultimate fallback
    const fallbackChallenge = generateFallbackReasoning(req.body);
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
