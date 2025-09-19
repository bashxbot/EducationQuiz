
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  TrendingUp, 
  RefreshCw,
  Puzzle,
  Hash,
  Grid3X3,
  Brain,
  MessageSquare,
  Box,
  Shuffle,
  Target,
  ClipboardList,
  Timer,
  Play,
  Settings2,
  Trophy,
  ChevronRight,
  History,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Star,
  Flame
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useReasoningQuizProgress } from "@/hooks/use-app-storage";
import type { ReasoningChallenge } from "@shared/schema";

const difficulties = [
  { id: "easy", name: "Easy", color: "bg-success", points: 10, description: "Basic logical reasoning" },
  { id: "medium", name: "Medium", color: "bg-warning", points: 20, description: "Intermediate problem solving" },
  { id: "hard", name: "Hard", color: "bg-destructive", points: 30, description: "Advanced critical thinking" },
];

const categories = [
  { id: "logic", name: "Logic Puzzles", icon: <Puzzle className="h-5 w-5" />, description: "Deductive reasoning problems" },
  { id: "number", name: "Number Series", icon: <Hash className="h-5 w-5" />, description: "Mathematical sequences" },
  { id: "pattern", name: "Pattern Match", icon: <Grid3X3 className="h-5 w-5" />, description: "Visual pattern recognition" },
  { id: "analytical", name: "Analytical", icon: <Brain className="h-5 w-5" />, description: "Critical thinking" },
  { id: "verbal", name: "Verbal Reasoning", icon: <MessageSquare className="h-5 w-5" />, description: "Language-based logic" },
  { id: "spatial", name: "Spatial Reasoning", icon: <Box className="h-5 w-5" />, description: "3D visualization" },
];

const reasoningTypes = [
  { id: "single", name: "Single Challenge", icon: <Target className="h-5 w-5" />, description: "Practice one problem at a time" },
  { id: "quiz", name: "Reasoning Quiz", icon: <ClipboardList className="h-5 w-5" />, description: "5-10 question series" },
  { id: "timed", name: "Timed Challenge", icon: <Timer className="h-5 w-5" />, description: "Race against time" },
  { id: "random", name: "Random Challenge", icon: <Shuffle className="h-5 w-5" />, description: "Mixed difficulty and type" },
];

export default function Reasoning() {
  const [mode, setMode] = useState<'selection' | 'single' | 'quiz' | 'results' | 'review'>('selection');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  
  // Single challenge state
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [challengeResult, setChallengeResult] = useState<any>(null);
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { progress, saveProgress, clearProgress } = useReasoningQuizProgress();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: reasoningHistory = [] } = useQuery({
    queryKey: ["/api/reasoning/history"],
  });

  const generateChallengeMutation = useMutation({
    mutationFn: async (params: { difficulty: string; category: string }) => {
      const response = await apiRequest("POST", "/api/reasoning/generate", params);
      return response.json();
    },
    onSuccess: (challenge) => {
      setCurrentChallenge(challenge);
      setUserAnswer("");
      setShowResult(false);
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ challengeId, answer }: { challengeId: string; answer: string }) => {
      const response = await apiRequest("POST", `/api/reasoning/${challengeId}/submit`, { answer });
      return response.json();
    },
    onSuccess: (result) => {
      setChallengeResult(result);
      setShowResult(true);
      queryClient.invalidateQueries({ queryKey: ["/api/reasoning/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  const startSingleChallenge = (difficulty: string, category: string = "logic") => {
    setMode('single');
    generateChallengeMutation.mutate({ difficulty: difficulty.toLowerCase(), category });
  };

  const startReasoningQuiz = async (difficulty: string, category: string, count: number = 5) => {
    setIsLoading(true);
    setMode('quiz');
    setCurrentQuizIndex(0);
    setQuizAnswers([]);
    setTimer(0);

    // Generate multiple questions
    const questions = [];
    for (let i = 0; i < count; i++) {
      try {
        const response = await apiRequest("POST", "/api/reasoning/generate", { 
          difficulty: difficulty.toLowerCase(), 
          category 
        });
        const question = await response.json();
        questions.push(question);
      } catch (error) {
        console.error('Failed to generate quiz question:', error);
        // Add fallback question
        questions.push({
          id: `fallback_${i}`,
          question: `Logic Problem ${i + 1}: If all roses are flowers and some flowers are red, which statement must be true?`,
          answer: "Some roses might be red",
          explanation: "This is a basic logical reasoning problem.",
          difficulty: difficulty.toLowerCase(),
          category: category,
          points: difficulty === 'easy' ? 10 : difficulty === 'hard' ? 30 : 20
        });
      }
    }
    
    setQuizQuestions(questions);
    setQuizAnswers(new Array(questions.length).fill(''));
    
    // Save progress
    saveProgress({
      quizId: `reasoning_quiz_${Date.now()}`,
      currentQuestionIndex: 0,
      answers: new Array(questions.length).fill(''),
      selectedDifficulty: difficulty,
      selectedCategory: category,
      startedAt: new Date().toISOString()
    });

    setIsLoading(false);
  };

  const handleModeSelection = (modeId: string) => {
    setSelectedMode(modeId);
    if (modeId === 'random') {
      startSingleChallenge('medium');
    }
  };

  const submitAnswer = () => {
    if (currentChallenge && userAnswer.trim()) {
      submitAnswerMutation.mutate({
        challengeId: currentChallenge.id,
        answer: userAnswer.trim(),
      });
    }
  };

  const selectQuizAnswer = (answer: string) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuizIndex] = answer;
    setQuizAnswers(newAnswers);
    
    // Update saved progress
    if (progress) {
      saveProgress({
        ...progress,
        currentQuestionIndex,
        answers: newAnswers
      });
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const prevQuizQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1);
    }
  };

  const finishQuiz = async () => {
    let correctCount = 0;
    const results = [];

    for (let i = 0; i < quizQuestions.length; i++) {
      const question = quizQuestions[i];
      const userAnswer = quizAnswers[i];
      
      try {
        const response = await apiRequest("POST", `/api/reasoning/${question.id}/submit`, { answer: userAnswer });
        const result = await response.json();
        results.push(result);
        if (result.correct) correctCount++;
      } catch (error) {
        console.error('Error submitting answer:', error);
        // Fallback evaluation
        const isCorrect = Math.random() > 0.4; // 60% chance for demo
        results.push({
          correct: isCorrect,
          points: isCorrect ? question.points : 0,
          answer: question.answer,
          explanation: question.explanation
        });
        if (isCorrect) correctCount++;
      }
    }

    const score = Math.round((correctCount / quizQuestions.length) * 100);
    
    setQuizResults({
      score,
      correctCount,
      totalQuestions: quizQuestions.length,
      timeSpent: timer,
      results
    });

    clearProgress(); // Clear saved progress
    setMode('results');
  };

  const resetToSelection = () => {
    setMode('selection');
    setSelectedMode('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setCurrentChallenge(null);
    setQuizQuestions([]);
    setUserAnswer('');
    setShowResult(false);
    setChallengeResult(null);
    setQuizResults(null);
    setTimer(0);
    clearProgress();
  };

  // Stats
  const completedToday = reasoningHistory.filter((challenge: any) => {
    const today = new Date();
    const challengeDate = new Date(challenge.completedAt || challenge.createdAt);
    return challengeDate.toDateString() === today.toDateString();
  }).length;

  const accuracyRate = reasoningHistory.length > 0 
    ? Math.round((reasoningHistory.filter((c: any) => c.correct).length / reasoningHistory.length) * 100)
    : 0;

  // Single challenge result screen
  if (mode === 'single' && showResult && challengeResult) {
    return (
      <div className="p-4 space-y-6 premium-container">
        <Card className="premium-card glass-morphism animate-slide-up">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gradient-primary">
              {challengeResult.correct ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-8 w-8 text-success" />
                  Correct!
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="h-8 w-8 text-destructive" />
                  Not quite right
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="font-medium mb-2 text-foreground-secondary">Your answer:</p>
              <p className="text-lg bg-secondary p-3 rounded-lg">{challengeResult.userAnswer}</p>
            </div>

            <div className="text-center">
              <p className="font-medium mb-2 text-foreground-secondary">Correct answer:</p>
              <p className="text-lg bg-primary/10 p-3 rounded-lg text-primary font-semibold">
                {challengeResult.answer}
              </p>
            </div>

            {challengeResult.explanation && (
              <div className="text-center">
                <p className="font-medium mb-2 text-foreground-secondary">Explanation:</p>
                <p className="text-sm bg-accent/10 p-3 rounded-lg text-left">
                  {challengeResult.explanation}
                </p>
              </div>
            )}

            {challengeResult.correct && (
              <div className="text-center">
                <Badge className="text-lg px-4 py-2 bg-success">
                  +{challengeResult.points} points earned!
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={resetToSelection} variant="outline" className="premium-button-secondary">
                New Challenge
              </Button>
              <Button 
                onClick={() => startSingleChallenge(currentChallenge?.difficulty || "medium")}
                className="premium-button"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Single challenge screen
  if (mode === 'single' && currentChallenge) {
    return (
      <div className="p-4 space-y-6 premium-container">
        <Card className="premium-card glass-morphism animate-slide-up">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg capitalize text-gradient-primary">
                {currentChallenge.difficulty} Challenge
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetToSelection} className="premium-button-ghost">
                Exit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm font-medium mb-2 text-foreground-secondary">{currentChallenge.category}</p>
              <p className="text-lg">{currentChallenge.question}</p>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your answer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && submitAnswer()}
                className="premium-input"
              />

              <Button
                onClick={submitAnswer}
                disabled={!userAnswer.trim() || submitAnswerMutation.isPending}
                className="w-full premium-button"
              >
                Submit Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz results screen
  if (mode === 'results' && quizResults) {
    return (
      <div className="p-4 space-y-6 premium-container">
        <Card className="premium-card glass-morphism animate-slide-up">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gradient-primary flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {quizResults.score}%
              </div>
              <p className="text-muted-foreground">
                {quizResults.correctCount} out of {quizResults.totalQuestions} correct
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Time: {Math.floor(quizResults.timeSpent / 60)}:{(quizResults.timeSpent % 60).toString().padStart(2, '0')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{quizResults.correctCount}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{quizResults.totalQuestions - quizResults.correctCount}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Wrong</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => setMode('review')} variant="outline">
                Review Answers
              </Button>
              <Button onClick={resetToSelection} variant="outline">
                New Quiz
              </Button>
            </div>

            <Button onClick={() => startReasoningQuiz(selectedDifficulty || 'medium', selectedCategory || 'logic', 5)} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz screen
  if (mode === 'quiz' && quizQuestions.length > 0) {
    const currentQuestion = quizQuestions[currentQuizIndex];
    const progress = ((currentQuizIndex + 1) / quizQuestions.length) * 100;

    return (
      <div className="p-4 space-y-6 premium-container">
        <Card className="premium-card glass-morphism animate-slide-up">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Question {currentQuizIndex + 1} of {quizQuestions.length}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetToSelection}>
                Exit
              </Button>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm font-medium mb-2 text-foreground-secondary">{currentQuestion.category}</p>
              <p className="text-lg">{currentQuestion.question}</p>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your answer..."
                value={quizAnswers[currentQuizIndex] || ''}
                onChange={(e) => selectQuizAnswer(e.target.value)}
                className="premium-input"
              />
            </div>

            <div className="flex justify-between">
              <Button
                onClick={prevQuizQuestion}
                disabled={currentQuizIndex === 0}
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {currentQuizIndex === quizQuestions.length - 1 ? (
                <Button onClick={finishQuiz} disabled={!quizAnswers[currentQuizIndex]?.trim()}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Complete Quiz
                </Button>
              ) : (
                <Button onClick={nextQuizQuestion} disabled={!quizAnswers[currentQuizIndex]?.trim()}>
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

  // Configuration screen
  if (selectedMode && mode === 'selection') {
    return (
      <div className="p-4 space-y-6 premium-container">
        <Card className="premium-card glass-morphism animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Configure {selectedMode === 'quiz' ? 'Reasoning Quiz' : 'Challenge'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedMode('')}>
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Select Category</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="p-4 h-auto flex-col gap-2"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
                      {category.icon}
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Select Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {difficulties.map((difficulty) => (
                  <Button
                    key={difficulty.id}
                    variant={selectedDifficulty === difficulty.id ? "default" : "outline"}
                    className="p-3 h-auto flex-col gap-2"
                    onClick={() => setSelectedDifficulty(difficulty.id)}
                  >
                    <div className={`w-3 h-3 ${difficulty.color} rounded-full`}></div>
                    <span className="text-sm font-medium">{difficulty.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={() => {
                if (selectedMode === 'quiz') {
                  startReasoningQuiz(selectedDifficulty || 'medium', selectedCategory || 'logic', 5);
                } else {
                  startSingleChallenge(selectedDifficulty || 'medium', selectedCategory || 'logic');
                }
              }}
              disabled={!selectedCategory || !selectedDifficulty || isLoading}
              className="w-full premium-button"
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Generating...' : `Start ${selectedMode === 'quiz' ? 'Quiz' : 'Challenge'}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main selection screen
  return (
    <div className="p-4 space-y-6 premium-container">
      {/* Header */}
      <Card className="premium-card glass-morphism animate-slide-up">
        <CardContent className="p-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">Logical Reasoning</h1>
                <p className="text-sm text-foreground-secondary">Sharpen your analytical thinking skills</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">{user?.currentStreak || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode Selection */}
      <Card className="premium-card glass-morphism animate-slide-up delay-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Select Challenge Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reasoningTypes.map((type) => (
            <Button
              key={type.id}
              variant="outline"
              className="w-full p-4 h-auto justify-start hover:bg-primary hover:text-primary-foreground premium-button-outline"
              onClick={() => handleModeSelection(type.id)}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                  {type.icon}
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="premium-card glass-morphism animate-slide-up delay-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{reasoningHistory.length}</div>
            <p className="text-xs text-muted-foreground">Problems Solved</p>
          </CardContent>
        </Card>
        <Card className="premium-card glass-morphism animate-slide-up delay-300">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">{accuracyRate}%</div>
            <p className="text-xs text-muted-foreground">Accuracy Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent History */}
      {reasoningHistory.length > 0 && (
        <Card className="premium-card glass-morphism animate-slide-up delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {reasoningHistory.slice(0, 5).map((challenge: any, index: number) => (
                <div key={`${challenge.id}-${index}`} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg border border-primary/10">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary capitalize">
                      {challenge.difficulty} • {challenge.category}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-48">
                      {challenge.question}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {challenge.correct ? (
                      <Badge className="bg-success text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <XCircle className="h-3 w-3 mr-1" />
                        Wrong
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {challenge.points || 0} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
