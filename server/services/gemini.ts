
// Fallback implementation for educational quiz generation
export async function generateQuiz(params: {
  class: string;
  subject: string;
  topic?: string;
  difficulty: string;
  count: number;
}) {
  // Return sample educational content for now
  const sampleQuestions = [
    {
      id: 'q1',
      question: 'What is the square root of 144?',
      options: ['10', '11', '12', '13'],
      correctAnswer: '12',
      explanation: 'The square root of 144 is 12 because 12 × 12 = 144.',
      difficulty: params.difficulty,
      topic: params.topic || 'Mathematics'
    },
    {
      id: 'q2',
      question: 'Which of the following is a prime number?',
      options: ['15', '17', '21', '25'],
      correctAnswer: '17',
      explanation: 'A prime number is a number greater than 1 that has no positive divisors other than 1 and itself. 17 is only divisible by 1 and 17.',
      difficulty: params.difficulty,
      topic: params.topic || 'Number Theory'
    },
    {
      id: 'q3',
      question: 'What is the value of π (pi) rounded to two decimal places?',
      options: ['3.12', '3.14', '3.16', '3.18'],
      correctAnswer: '3.14',
      explanation: 'π (pi) is approximately 3.14159, which rounds to 3.14 when rounded to two decimal places.',
      difficulty: params.difficulty,
      topic: params.topic || 'Geometry'
    }
  ];

  return {
    questions: sampleQuestions.slice(0, Math.min(params.count, sampleQuestions.length))
  };
}

export async function generateChat(message: string) {
  // Fallback educational responses
  const responses = [
    `That's a great question! Let me help you understand this concept better. The key thing to remember is that learning is a process, and every question brings you closer to mastery.`,
    `Excellent question! This is a fundamental concept that many students find challenging at first. Let's break it down step by step to make it clearer.`,
    `I'm happy to help you with that! This topic connects to many other areas of study, so understanding it well will benefit you in multiple subjects.`
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  return `${randomResponse}\n\nFor detailed help with "${message}", I recommend discussing this with your teacher or tutor for personalized guidance.`;
}

export async function generateReasoning(params: {
  difficulty: string;
  category: string;
}) {
  // Fallback reasoning challenges
  const challenges = [
    {
      id: `reasoning_${Date.now()}`,
      question: "If all roses are flowers and some flowers are red, which of the following must be true?",
      answer: "Some roses might be red",
      explanation: "This is a logical reasoning problem. While we know all roses are flowers, and some flowers are red, we cannot conclude that all roses are red or that no roses are red. The only logical conclusion is that some roses might be red.",
      difficulty: params.difficulty,
      category: params.category,
      points: params.difficulty === 'easy' ? 10 : params.difficulty === 'hard' ? 30 : 20,
      createdAt: new Date().toISOString()
    },
    {
      id: `reasoning_${Date.now() + 1}`,
      question: "What comes next in the sequence: 2, 6, 12, 20, 30, ?",
      answer: "42",
      explanation: "This sequence follows the pattern: n(n+1) where n starts at 2. So: 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42",
      difficulty: params.difficulty,
      category: params.category,
      points: params.difficulty === 'easy' ? 10 : params.difficulty === 'hard' ? 30 : 20,
      createdAt: new Date().toISOString()
    }
  ];
  
  return challenges[Math.floor(Math.random() * challenges.length)];
}
