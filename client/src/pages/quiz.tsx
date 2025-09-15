import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Clock, Trophy, Target, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useQuizHistory, useUserProfile } from '../hooks/use-app-storage';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

interface QuizResults {
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
}

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'English', 'History', 'Geography'
];

const topicsBySubject: Record<string, string[]> = {
  'Mathematics': ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'],
  'Physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'],
  'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Biochemistry'],
  'Biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Biology'],
  'Computer Science': ['Programming', 'Data Structures', 'Algorithms', 'Database', 'Networks'],
  'English': ['Grammar', 'Literature', 'Vocabulary', 'Writing', 'Reading Comprehension'],
  'History': ['Ancient History', 'Medieval History', 'Modern History', 'World Wars', 'Indian History'],
  'Geography': ['Physical Geography', 'Human Geography', 'Economic Geography', 'Political Geography']
};

export default function Quiz() {
  const [quizMode, setQuizMode] = useState<'setup' | 'quiz' | 'results' | 'review'>('setup');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [timer, setTimer] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const { addQuizResult } = useQuizHistory();
  const { updateProfile } = useUserProfile();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizMode === 'quiz') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateQuiz = async () => {
    if (!selectedSubject) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: 'Class 10',
          subject: selectedSubject,
          topic: selectedTopic === 'mixed' ? undefined : selectedTopic || undefined,
          difficulty: selectedDifficulty,
          count: 10
        })
      });

      if (!response.ok) throw new Error('Failed to generate quiz');

      const quiz = await response.json();
      setQuestions(quiz.questions);
      setUserAnswers(new Array(quiz.questions.length).fill(''));
      setCurrentQuestionIndex(0);
      setTimer(0);
      setQuizMode('quiz');
    } catch (error) {
      console.error('Quiz generation error:', error);
      // Use fallback sample questions to keep app functional
      const sampleQuestions: QuizQuestion[] = [
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
        }
      ];
      setQuestions(sampleQuestions);
      setUserAnswers(new Array(sampleQuestions.length).fill(''));
      setCurrentQuestionIndex(0);
      setTimer(0);
      setQuizMode('quiz');
      // Show a non-blocking notification instead of alert
      console.warn('Using fallback questions due to API error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] || '');
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] || '');
    }
  };

  const finishQuiz = () => {
    const correctCount = questions.reduce((count, question, index) => {
      return count + (userAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const score = Math.round((correctCount / questions.length) * 100);
    const results: QuizResults = {
      score,
      correctCount,
      totalQuestions: questions.length,
      timeSpent: timer
    };

    setQuizResults(results);

    // Save to history
    addQuizResult({
      subject: selectedSubject,
      topic: selectedTopic === 'mixed' || !selectedTopic ? 'Mixed Topics' : selectedTopic,
      score,
      totalQuestions: questions.length,
      timeSpent: timer,
      difficulty: selectedDifficulty
    });

    // Update user points
    const pointsEarned = Math.max(score - 50, 0);
    updateProfile({ totalPoints: prev => (prev || 0) + pointsEarned });

    setQuizMode('results');
  };

  const resetQuiz = () => {
    setQuizMode('setup');
    setSelectedSubject('');
    setSelectedTopic('');
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setTimer(0);
    setQuizResults(null);
    setReviewMode(false);
  };

  const startReview = () => {
    setReviewMode(true);
    setCurrentQuestionIndex(0);
    setQuizMode('review');
  };

  const retryWrongOnly = () => {
    const wrongQuestions = questions.filter((question, index) => 
      userAnswers[index] !== question.correctAnswer
    );
    setQuestions(wrongQuestions);
    setUserAnswers(new Array(wrongQuestions.length).fill(''));
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setTimer(0);
    setQuizMode('quiz');
  };

  if (quizMode === 'setup') {
    return (
      <div className="p-4 space-y-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Start New Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSubject && (
              <div>
                <label className="text-sm font-medium mb-2 block">Topic (Optional)</label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a topic or leave for mixed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed Topics</SelectItem>
                    {topicsBySubject[selectedSubject]?.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={(value: any) => setSelectedDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateQuiz} 
              disabled={!selectedSubject || isLoading}
              className="w-full"
            >
              {isLoading ? 'Generating Quiz...' : 'Start Quiz'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions.length) {
    return <div className="p-4">Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (quizMode === 'results') {
    const wrongQuestions = questions.filter((question, index) => 
      userAnswers[index] !== question.correctAnswer
    );

    return (
      <div className="p-4 space-y-6 pb-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {quizResults?.score}%
              </div>
              <p className="text-muted-foreground">
                {quizResults?.correctCount} out of {quizResults?.totalQuestions} correct
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Time: {formatTime(quizResults?.timeSpent || 0)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{quizResults?.correctCount}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{wrongQuestions.length}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Wrong</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={startReview} variant="outline">
                Review Answers
              </Button>
              <Button onClick={resetQuiz} variant="outline">
                New Quiz
              </Button>
            </div>

            {wrongQuestions.length > 0 && (
              <Button onClick={retryWrongOnly} className="w-full">
                Retry Wrong Questions ({wrongQuestions.length})
              </Button>
            )}

            <Button onClick={() => generateQuiz()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizMode === 'review') {
    const userAnswer = userAnswers[currentQuestionIndex];
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    return (
      <div className="p-4 space-y-6 pb-20">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Review {currentQuestionIndex + 1} of {questions.length}
              </CardTitle>
              <Badge variant={isCorrect ? "default" : "destructive"}>
                {isCorrect ? "Correct" : "Wrong"}
              </Badge>
            </div>
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {currentQuestion.question}
              </ReactMarkdown>
            </div>

            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => {
                const isUserAnswer = option === userAnswer;
                const isCorrectAnswer = option === currentQuestion.correctAnswer;

                let variant: "outline" | "default" | "destructive" = "outline";
                if (isCorrectAnswer) variant = "default";
                else if (isUserAnswer && !isCorrect) variant = "destructive";

                return (
                  <Button
                    key={index}
                    variant={variant}
                    className="w-full justify-start text-left h-auto p-3"
                    disabled
                  >
                    <span className="flex-1">{option}</span>
                    {isUserAnswer && <Badge variant="secondary" className="ml-2">Your Answer</Badge>}
                    {isCorrectAnswer && <Badge variant="default" className="ml-2">Correct</Badge>}
                  </Button>
                );
              })}
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Explanation:</h4>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {currentQuestion.explanation}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                onClick={prevQuestion} 
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={resetQuiz}>
                  Finish Review
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(timer)}
                </div>
                <div>{selectedSubject}: {selectedTopic === 'mixed' || !selectedTopic ? 'Mixed Topics' : selectedTopic}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetQuiz}>
              Exit
            </Button>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {currentQuestion.question}
            </ReactMarkdown>
          </div>

          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "default" : "outline"}
                onClick={() => selectAnswer(option)}
                className="w-full justify-start text-left h-auto p-3"
              >
                {option}
              </Button>
            ))}
          </div>

          <div className="flex justify-between">
            <Button 
              onClick={prevQuestion} 
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button 
              onClick={nextQuestion} 
              disabled={!selectedAnswer}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}