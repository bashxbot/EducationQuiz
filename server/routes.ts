import { Router } from 'express';
import { z } from 'zod';
import { generateQuiz, generateChat, generateReasoning } from './services/gemini';

const router = Router();

// Mock data storage (in a real app, use a proper database)
let users: any[] = [{
  id: 'demo-user',
  name: 'Alex Kumar',
  email: 'alex@example.com',
  class: 'Class 10',
  school: 'Excellence High School',
  totalPoints: 1240,
  currentStreak: 7,
  joinDate: new Date().toISOString(),
  badges: ['scholar', 'speedster']
}];

let leaderboardData: any[] = [
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
    name: 'Alex Kumar',
    class: 'Class 10',
    school: 'Excellence High School',
    totalPoints: 1240,
    accuracy: 85,
    streak: 7,
    badges: 5,
    rank: 24,
    change: 3
  }
];

let quizHistory: any[] = [];
let reasoningHistory: any[] = [];

// User routes
router.get('/api/user', (req, res) => {
  const user = users.find(u => u.id === 'demo-user');
  res.json(user || users[0]);
});

router.put('/api/user', (req, res) => {
  const userIndex = users.findIndex(u => u.id === 'demo-user');
  if (userIndex >= 0) {
    users[userIndex] = { ...users[userIndex], ...req.body };
    res.json(users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Progress routes
router.get('/api/progress', (req, res) => {
  res.json({
    totalQuizzes: quizHistory.length,
    averageScore: quizHistory.length > 0
      ? Math.round(quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / quizHistory.length)
      : 0,
    subjectsStudied: Array.from(new Set(quizHistory.map(q => q.subject))).length,
    streakDays: 7
  });
});

// Badges routes
router.get('/api/badges', (req, res) => {
  const user = users.find(u => u.id === 'demo-user');
  res.json({
    earned: user?.badges || [],
    available: [
      { id: 'scholar', name: 'Scholar', description: 'Complete 10 quizzes', earned: true },
      { id: 'speedster', name: 'Speedster', description: 'Answer quickly', earned: true },
      { id: 'perfectionist', name: 'Perfectionist', description: 'Get 100% on a quiz', earned: false },
      { id: 'streaker', name: 'Streaker', description: '7 day streak', earned: false }
    ]
  });
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

    res.json(quiz);
  } catch (error) {
    console.error('Quiz generation error:', error);

    // Fallback quiz data to prevent app crashes
    const fallbackQuiz = {
      id: Date.now().toString(),
      questions: [
        {
          id: '1',
          question: 'What is the square root of 144?',
          options: ['10', '11', '12', '13'],
          correctAnswer: '12',
          explanation: 'The square root of 144 is 12 because 12 × 12 = 144.',
          difficulty: 'easy',
          topic: 'Algebra'
        },
        {
          id: '2',
          question: 'Which of the following is a prime number?',
          options: ['15', '17', '21', '25'],
          correctAnswer: '17',
          explanation: 'A prime number is a number greater than 1 that has no positive divisors other than 1 and itself. 17 is only divisible by 1 and 17.',
          difficulty: 'medium',
          topic: 'Number Theory'
        },
        {
          id: '3',
          question: 'What is the value of π (pi) rounded to two decimal places?',
          options: ['3.12', '3.14', '3.16', '3.18'],
          correctAnswer: '3.14',
          explanation: 'π (pi) is approximately 3.14159, which rounds to 3.14 when rounded to two decimal places.',
          difficulty: 'easy',
          topic: 'Geometry'
        }
      ]
    };

    res.json(fallbackQuiz);
  }
});

router.post('/api/quiz/submit', (req, res) => {
  const { quizId, answers, subject, topic, difficulty, timeSpent } = req.body;

  const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
  const result = {
    id: Date.now().toString(),
    quizId,
    score,
    answers,
    subject,
    topic: topic || 'Mixed Topics',
    difficulty,
    timeSpent: timeSpent || 120,
    completedAt: new Date().toISOString()
  };

  quizHistory.unshift(result);

  // Update user points
  const user = users.find(u => u.id === 'demo-user');
  if (user) {
    user.totalPoints += Math.max(score - 50, 0);
  }

  res.json(result);
});

// Chat routes
router.post('/api/chat/stream', async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const response = await generateChat(content);

    // Simulate streaming by sending the response word by word
    const words = response.split(' ');

    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);

      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat streaming error:', error);
    res.write(`data: ${JSON.stringify({
      content: "I'm having trouble connecting right now. Please try again later."
    })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

// Leaderboard routes
router.get('/api/leaderboard', (req, res) => {
  const { subject, timeframe, scope } = req.query;

  // Filter and sort leaderboard based on query parameters
  let filteredData = [...leaderboardData];

  if (subject && subject !== 'All Subjects') {
    // In a real app, filter by subject performance
  }

  if (scope === 'school') {
    filteredData = filteredData.filter(user =>
      user.school === 'Excellence High School' || user.id === 'demo-user'
    );
  } else if (scope === 'class') {
    filteredData = filteredData.filter(user =>
      user.class === 'Class 10' || user.id === 'demo-user'
    );
  }

  // Sort by points
  filteredData.sort((a, b) => b.totalPoints - a.totalPoints);

  // Update ranks
  filteredData.forEach((user, index) => {
    user.rank = index + 1;
  });

  res.json({
    leaderboard: filteredData,
    userRank: filteredData.find(u => u.id === 'demo-user')?.rank || null
  });
});

// Reasoning routes
router.get('/api/reasoning/history', (req, res) => {
  res.json(reasoningHistory);
});

router.post('/api/reasoning/generate', async (req, res) => {
  const { difficulty, category } = req.body;

  try {
    const challenge = await generateReasoning({ difficulty, category });
    res.json(challenge);
  } catch (error) {
    console.error('Reasoning generation error:', error);

    // Fallback reasoning challenge to prevent app crashes
    const fallbackChallenge = {
      id: Date.now().toString(),
      question: "If all roses are flowers and some flowers are red, which of the following must be true?",
      answer: "Some roses might be red",
      explanation: "This is a logical reasoning problem. While we know all roses are flowers, and some flowers are red, we cannot conclude that all roses are red or that no roses are red. The only logical conclusion is that some roses might be red.",
      difficulty: difficulty || 'medium',
      category: category || 'logic',
      points: difficulty === 'easy' ? 10 : difficulty === 'hard' ? 30 : 20,
      createdAt: new Date().toISOString()
    };

    res.json(fallbackChallenge);
  }
});

router.post('/api/reasoning/:challengeId/submit', (req, res) => {
  const { challengeId } = req.params;
  const { answer } = req.body;

  // Mock evaluation logic
  const isCorrect = Math.random() > 0.3; // 70% chance of being correct for demo

  const result = {
    challengeId,
    userAnswer: answer,
    correct: isCorrect,
    answer: "Some roses might be red", // Mock correct answer
    points: isCorrect ? 20 : 0
  };

  if (isCorrect) {
    const user = users.find(u => u.id === 'demo-user');
    if (user) {
      user.totalPoints += result.points;
    }
  }

  // Add to history
  reasoningHistory.unshift({
    id: Date.now().toString(),
    challengeId,
    answer,
    correct: isCorrect,
    completedAt: new Date().toISOString()
  });

  res.json(result);
});

export default router;