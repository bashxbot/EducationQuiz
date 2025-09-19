import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import {
  Play,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  Star,
  Award,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  BarChart3,
  Triangle,
  TrendingUp,
  BarChart,
  Settings,
  Thermometer,
  Zap,
  Search,
  FlaskConical,
  Atom,
  Microscope,
  Dna,
  Leaf,
  TreePine,
  Code,
  Binary,
  Database,
  Server,
  PenTool,
  Edit,
  Feather,
  Building,
  Castle,
  Factory,
  Swords,
  Mountain,
  Users,
  DollarSign,
  MapPin,
  Brain,
  GraduationCap,
  Library,
  FileText
} from "lucide-react";
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

const classes = [
  { id: '6', name: 'Class 6', icon: <GraduationCap className="h-7 w-7" /> },
  { id: '7', name: 'Class 7', icon: <GraduationCap className="h-7 w-7" /> },
  { id: '8', name: 'Class 8', icon: <GraduationCap className="h-7 w-7" /> },
  { id: '9', name: 'Class 9', icon: <GraduationCap className="h-7 w-7" /> },
  { id: '10', name: 'Class 10', icon: <GraduationCap className="h-7 w-7" /> },
  { id: '11', name: 'Class 11', icon: <GraduationCap className="h-7 w-7" /> },
  { id: '12', name: 'Class 12', icon: <GraduationCap className="h-7 w-7" /> }
];

const subjects = [
  { id: 'mathematics', name: 'Mathematics', icon: <BarChart3 className="h-7 w-7" />, color: 'from-blue-500 to-cyan-500' },
  { id: 'physics', name: 'Physics', icon: <Thermometer className="h-7 w-7" />, color: 'from-purple-500 to-pink-500' },
  { id: 'chemistry', name: 'Chemistry', icon: <FlaskConical className="h-7 w-7" />, color: 'from-green-500 to-emerald-500' },
  { id: 'biology', name: 'Biology', icon: <Dna className="h-7 w-7" />, color: 'from-red-500 to-orange-500' },
  { id: 'computer-science', name: 'Computer Science', icon: <Code className="h-7 w-7" />, color: 'from-indigo-500 to-purple-500' },
  { id: 'english', name: 'English', icon: <BookOpen className="h-7 w-7" />, color: 'from-yellow-500 to-orange-500' },
  { id: 'history', name: 'History', icon: <Building className="h-7 w-7" />, color: 'from-amber-600 to-yellow-500' },
  { id: 'geography', name: 'Geography', icon: <Mountain className="h-7 w-7" />, color: 'from-emerald-500 to-teal-500' }
];

const chaptersBySubject: Record<string, { id: string; name: string; icon: React.ReactNode }[]> = {
  'mathematics': [
    { id: 'algebra', name: 'Algebra', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'geometry', name: 'Geometry', icon: <Triangle className="h-5 w-5" /> },
    { id: 'calculus', name: 'Calculus', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'statistics', name: 'Statistics', icon: <BarChart className="h-5 w-5" /> }
  ],
  'physics': [
    { id: 'mechanics', name: 'Mechanics', icon: <Settings className="h-5 w-5" /> },
    { id: 'thermodynamics', name: 'Thermodynamics', icon: <Thermometer className="h-5 w-5" /> },
    { id: 'electromagnetism', name: 'Electromagnetism', icon: <Zap className="h-5 w-5" /> },
    { id: 'optics', name: 'Optics', icon: <Search className="h-5 w-5" /> }
  ],
  'chemistry': [
    { id: 'organic', name: 'Organic Chemistry', icon: <FlaskConical className="h-5 w-5" /> },
    { id: 'inorganic', name: 'Inorganic Chemistry', icon: <Atom className="h-5 w-5" /> },
    { id: 'physical', name: 'Physical Chemistry', icon: <Microscope className="h-5 w-5" /> },
    { id: 'biochemistry', name: 'Biochemistry', icon: <Dna className="h-5 w-5" /> }
  ],
  'biology': [
    { id: 'cell', name: 'Cell Biology', icon: <Microscope className="h-5 w-5" /> },
    { id: 'genetics', name: 'Genetics', icon: <Dna className="h-5 w-5" /> },
    { id: 'ecology', name: 'Ecology', icon: <Leaf className="h-5 w-5" /> },
    { id: 'evolution', name: 'Evolution', icon: <TreePine className="h-5 w-5" /> }
  ],
  'computer-science': [
    { id: 'programming', name: 'Programming', icon: <Code className="h-5 w-5" /> },
    { id: 'algorithms', name: 'Algorithms', icon: <Binary className="h-5 w-5" /> },
    { id: 'data_structures', name: 'Data Structures', icon: <Database className="h-5 w-5" /> },
    { id: 'databases', name: 'Databases', icon: <Server className="h-5 w-5" /> }
  ],
  'english': [
    { id: 'grammar', name: 'Grammar', icon: <PenTool className="h-5 w-5" /> },
    { id: 'literature', name: 'Literature', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'writing', name: 'Writing', icon: <Edit className="h-5 w-5" /> },
    { id: 'poetry', name: 'Poetry', icon: <Feather className="h-5 w-5" /> }
  ],
  'history': [
    { id: 'ancient', name: 'Ancient History', icon: <Building className="h-5 w-5" /> },
    { id: 'medieval', name: 'Medieval History', icon: <Castle className="h-5 w-5" /> },
    { id: 'modern', name: 'Modern History', icon: <Factory className="h-5 w-5" /> },
    { id: 'world_wars', name: 'World Wars', icon: <Swords className="h-5 w-5" /> }
  ],
  'geography': [
    { id: 'physical', name: 'Physical Geography', icon: <Mountain className="h-5 w-5" /> },
    { id: 'human', name: 'Human Geography', icon: <Users className="h-5 w-5" /> },
    { id: 'economic', name: 'Economic Geography', icon: <DollarSign className="h-5 w-5" /> },
    { id: 'political', name: 'Political Geography', icon: <MapPin className="h-5 w-5" /> }
  ]
};

const difficulties = [
  { id: 'easy', name: 'Easy', icon: <Target className="h-7 w-7" />, description: 'Perfect for beginners' },
  { id: 'medium', name: 'Medium', icon: <Target className="h-7 w-7" />, description: 'Good challenge level' },
  { id: 'hard', name: 'Hard', icon: <Target className="h-7 w-7" />, description: 'Expert level questions' }
];

export default function Quiz() {
  const [quizMode, setQuizMode] = useState<'setup' | 'quiz' | 'results' | 'review'>('setup');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
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
    if (!selectedClass || !selectedSubject) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: selectedClass,
          subject: selectedSubject,
          topic: selectedChapter || undefined,
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

    addQuizResult({
      subject: selectedSubject,
      topic: selectedChapter || 'Mixed Topics',
      score,
      totalQuestions: questions.length,
      timeSpent: timer,
      difficulty: selectedDifficulty
    });

    const pointsEarned = Math.max(score - 50, 0);
    updateProfile({ totalPoints: prev => (prev || 0) + pointsEarned });

    setQuizMode('results');
  };

  const resetQuiz = () => {
    setQuizMode('setup');
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedChapter('');
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
      <div className="premium-container">
        {/* Header */}
        <Card className="premium-card glass-morphism animate-slide-up">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Start New Quiz</h1>
                <p className="text-foreground-secondary">Choose your preferences and begin learning</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Selection */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Select Your Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {classes.map(cls => (
                <Button
                  key={cls.id}
                  variant={selectedClass === cls.id ? "default" : "outline"}
                  onClick={() => setSelectedClass(cls.id)}
                  className="h-16 flex flex-col gap-1"
                >
                  {cls.icon}
                  <span className="text-sm font-medium">{cls.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject Selection */}
        {selectedClass && (
          <Card className="premium-card animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5" />
                Choose Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {subjects.map(subject => (
                  <Button
                    key={subject.id}
                    variant={selectedSubject === subject.id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedSubject(subject.id);
                      setSelectedChapter(''); // Reset chapter when subject changes
                    }}
                    className="h-20 flex flex-col gap-2 relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-10`} />
                    <span className="text-xl relative z-10">{subject.icon}</span>
                    <span className="text-sm font-medium relative z-10">{subject.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chapter Selection (Optional) */}
        {selectedSubject && (
          <Card className="premium-card animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Select Chapter (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant={selectedChapter === '' ? "default" : "outline"}
                  onClick={() => setSelectedChapter('')}
                  className="w-full justify-start"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center mr-3">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  All Chapters (Mixed)
                </Button>

                <div className="grid grid-cols-1 gap-2">
                  {chaptersBySubject[selectedSubject]?.map(chapter => (
                    <Button
                      key={chapter.id}
                      variant={selectedChapter === chapter.id ? "default" : "outline"}
                      onClick={() => setSelectedChapter(chapter.id)}
                      className="justify-start"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center mr-3">
                        {chapter.icon}
                      </div>
                      {chapter.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Difficulty Selection */}
        {selectedSubject && (
          <Card className="premium-card animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Difficulty Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {difficulties.map(diff => (
                  <Button
                    key={diff.id}
                    variant={selectedDifficulty === diff.id ? "default" : "outline"}
                    onClick={() => setSelectedDifficulty(diff.id as any)}
                    className="h-20 flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                        {diff.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{diff.name}</h3>
                        <p className="text-sm text-muted-foreground">{diff.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Quiz Button */}
        {selectedClass && selectedSubject && (
          <Button
            onClick={generateQuiz}
            disabled={isLoading}
            className="w-full h-14 text-lg font-semibold premium-button animate-slide-up"
            loading={isLoading}
          >
            <Play className="h-5 w-5 mr-2" />
            {isLoading ? 'Generating Quiz...' : 'Start Quiz'}
          </Button>
        )}
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
      <div className="premium-container">
        <Card className="premium-card">
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
      <div className="premium-container">
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
    <div className="premium-container">
      {/* Quiz Header */}
      <Card className="premium-card glass-morphism animate-slide-up">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient-primary">
                    {subjects.find(s => s.id === selectedSubject)?.name} Quiz
                  </h1>
                  <p className="text-foreground-secondary">
                    {selectedChapter ? chaptersBySubject[selectedSubject]?.find(c => c.id === selectedChapter)?.name : 'Mixed Topics'}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-sm text-foreground-tertiary font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="w-32 h-3 bg-background-soft rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-foreground-tertiary">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="premium-card glass-morphism animate-slide-up-delay">
        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="w-full h-1 bg-gradient-to-r from-primary/20 via-accent/40 to-primary/20 rounded-full"></div>
            <h3 className="text-xl font-semibold leading-relaxed text-foreground-primary">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "default" : "outline"}
                onClick={() => selectAnswer(option)}
                className={`w-full justify-start text-left h-auto p-3 ${
                  selectedAnswer === option
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg transform scale-[1.02]'
                    : 'hover:scale-[1.01] hover:shadow-md bg-background-soft border-border-subtle'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-base">{option}</span>
                </span>
              </Button>
            ))}
          </div>

          <div className="flex justify-between pt-6 border-t border-border-subtle">
            <Button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="premium-button-secondary"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={nextQuestion}
              disabled={!selectedAnswer}
              className={`premium-button ${!selectedAnswer ? 'opacity-50' : 'animate-pulse-glow'}`}
            >
              {currentQuestionIndex === questions.length - 1 ? (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Complete Quiz
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}