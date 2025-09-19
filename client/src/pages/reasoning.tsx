import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  BarChart3, 
  Lightbulb, 
  TrendingUp, 
  Layers, 
  Clock, 
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
  History
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ReasoningChallenge } from "@shared/schema";

const difficulties = [
  { name: "Easy", color: "bg-success", points: 10, description: "Basic logical reasoning" },
  { name: "Medium", color: "bg-warning", points: 20, description: "Intermediate problem solving" },
  { name: "Hard", color: "bg-destructive", points: 30, description: "Advanced critical thinking" },
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
  { id: "random", name: "Random Challenge", icon: <Shuffle className="h-5 w-5" />, description: "Mixed difficulty and type" },
  { id: "targeted", name: "Targeted Practice", icon: <Target className="h-5 w-5" />, description: "Choose specific type" },
  { id: "quiz", name: "Reasoning Quiz", icon: <ClipboardList className="h-5 w-5" />, description: "5-10 question series" },
  { id: "timed", name: "Timed Challenge", icon: <Timer className="h-5 w-5" />, description: "Race against time" },
];


export default function Reasoning() {
  const [currentChallenge, setCurrentChallenge] = useState<ReasoningChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [challengeResult, setChallengeResult] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);


  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  }) as { data: { id: string; name: string; currentStreak: number; totalPoints: number } | undefined };

  const { data: reasoningHistory = [] } = useQuery({
    queryKey: ["/api/reasoning/history"],
  }) as { data: ReasoningChallenge[] };

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

  const startChallenge = (difficulty: string, category: string = "logic") => {
    generateChallengeMutation.mutate({ difficulty: difficulty.toLowerCase(), category });
  };

  const startReasoningQuiz = async (difficulty: string, category: string, count: number = 5) => {
    setQuizMode(true);
    setCurrentQuizIndex(0);
    setQuizAnswers([]);

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
      }
    }
    setQuizQuestions(questions);
  };

  const handleModeSelection = (mode: string) => {
    setSelectedMode(mode);
    if (mode === 'random') {
      startChallenge('medium');
    } else {
      setShowModeSelection(true);
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

  const resetChallenge = () => {
    setCurrentChallenge(null);
    setUserAnswer("");
    setShowResult(false);
    setChallengeResult(null);
  };

  const completedToday = reasoningHistory.filter((challenge: ReasoningChallenge) => {
    const today = new Date();
    const challengeDate = new Date(challenge.completedAt || challenge.createdAt!);
    return challengeDate.toDateString() === today.toDateString();
  }).length;

  const accuracyRate = reasoningHistory.length > 0 
    ? Math.round((reasoningHistory.filter((c: ReasoningChallenge) => c.correct).length / reasoningHistory.length) * 100)
    : 0;

  if (showResult && challengeResult) {
    return (
      <div className="p-4 space-y-6 premium-container">
        <Card className="premium-card glass-morphism animate-slide-up">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gradient-primary">
              {challengeResult.correct ? "Correct! 🎉" : "Not quite right 😔"}
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
              <Button onClick={resetChallenge} variant="outline" data-testid="button-new-challenge" className="premium-button-secondary">
                New Challenge
              </Button>
              <Button 
                onClick={() => startChallenge(currentChallenge?.difficulty || "medium")}
                data-testid="button-try-again"
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

  if (currentChallenge) {
    return (
      <div className="p-4 space-y-6 premium-container">
        <Card className="premium-card glass-morphism animate-slide-up">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg capitalize text-gradient-primary">
                {currentChallenge.difficulty} Challenge
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetChallenge} data-testid="button-exit-challenge" className="premium-button-ghost">
                Exit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm font-medium mb-2 text-foreground-secondary">{currentChallenge.category}</p>
              <p className="text-lg" data-testid="text-challenge-question">
                {currentChallenge.question}
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your answer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && submitAnswer()}
                data-testid="input-answer"
                className="premium-input"
              />

              <Button
                onClick={submitAnswer}
                disabled={!userAnswer.trim() || submitAnswerMutation.isPending}
                className="w-full premium-button"
                data-testid="button-submit-answer"
              >
                Submit Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mode selection screen
  if (!currentChallenge && !quizMode && !selectedMode) {
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
                  <p className="text-sm text-foreground-secondary">Choose your reasoning challenge type</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reasoning Mode Selection */}
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

        {/* Review Previous Challenges */}
        {reasoningHistory.length > 0 && (
          <Card className="premium-card glass-morphism animate-slide-up delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Review Previous Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-64 overflow-y-auto space-y-2">
                {reasoningHistory.slice(0, 5).map((challenge, index) => (
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
                        <Badge className="bg-success text-xs">Correct</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Wrong</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {challenge.points || 0} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {reasoningHistory.length > 5 && (
                <p className="text-xs text-center text-muted-foreground">
                  Showing recent 5 of {reasoningHistory.length} challenges
                </p>
              )}
            </CardContent>
          </Card>
        )}

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
      </div>
    );
  }

  // Configuration screen for targeted practice and quiz
  if (showModeSelection && !currentChallenge && !quizMode) {
    return (
      <div className="p-4 space-y-6 premium-container">
        <Card className="premium-card glass-morphism animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configure {selectedMode === 'quiz' ? 'Reasoning Quiz' : 'Practice Session'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setShowModeSelection(false); setSelectedMode(''); }}>
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
                    key={difficulty.name}
                    variant={selectedDifficulty === difficulty.name.toLowerCase() ? "default" : "outline"}
                    className="p-3 h-auto flex-col gap-2"
                    onClick={() => setSelectedDifficulty(difficulty.name.toLowerCase())}
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
                  startChallenge(selectedDifficulty || 'medium', selectedCategory || 'logic');
                }
                setShowModeSelection(false);
              }}
              disabled={!selectedCategory || !selectedDifficulty}
              className="w-full premium-button"
            >
              <Play className="h-4 w-4 mr-2" />
              Start {selectedMode === 'quiz' ? 'Quiz' : 'Practice'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the main dashboard-like layout
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
            <Button onClick={() => startChallenge("medium")} size="sm" className="premium-button animate-pulse-glow">
              <RefreshCw className="h-4 w-4 mr-2" />
              New Challenge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Streak Counter */}
      <Card className="premium-card glass-morphism animate-slide-up delay-100">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="h-8 w-8 text-gradient-accent" />
            <span className="text-3xl font-bold text-gradient-primary" data-testid="text-streak">
              {user?.currentStreak || 0}
            </span>
          </div>
          <p className="font-semibold text-foreground-secondary">Day Streak</p>
          <p className="text-sm opacity-90 mt-1">Keep it up! You're on fire! 🔥</p>
        </CardContent>
      </Card>

      {/* Difficulty Selection */}
      <Card className="premium-card glass-morphism animate-slide-up delay-200">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-gradient-primary">
            <BarChart3 className="h-5 w-5 text-primary" />
            Choose Difficulty
          </h3>
          <div className="space-y-2">
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty.name}
                variant="outline"
                className="w-full p-4 h-auto justify-between hover:bg-primary hover:text-primary-foreground premium-button-outline"
                onClick={() => startChallenge(difficulty.name)}
                disabled={generateChallengeMutation.isPending}
                data-testid={`button-difficulty-${difficulty.name.toLowerCase()}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${difficulty.color} rounded-full`}></div>
                  <div className="text-left">
                    <p className="font-medium">{difficulty.name}</p>
                    <p className="text-xs text-muted-foreground">{difficulty.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs premium-badge">
                  +{difficulty.points} pts
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Challenge */}
      <Card className="premium-card glass-morphism animate-slide-up delay-300">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-gradient-primary">
            <Lightbulb className="h-5 w-5 text-accent" />
            Today's Challenge
          </h3>
          <div className="p-4 bg-secondary rounded-lg mb-4">
            <p className="text-sm font-medium mb-2 text-foreground-secondary">Pattern Recognition</p>
            <p className="text-sm text-muted-foreground mb-3">
              Look at the sequence: 2, 6, 12, 20, 30, ?
            </p>
            <p className="text-sm text-foreground-secondary">What comes next in this sequence?</p>
          </div>
          <Button 
            onClick={() => startChallenge("Medium")}
            className="w-full premium-button"
            disabled={generateChallengeMutation.isPending}
            data-testid="button-start-daily-challenge"
          >
            Start Challenge
          </Button>
        </CardContent>
      </Card>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="premium-card glass-morphism animate-slide-up delay-400">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1" data-testid="text-problems-solved">
              {reasoningHistory.length}
            </div>
            <p className="text-xs text-muted-foreground">Problems Solved</p>
          </CardContent>
        </Card>
        <Card className="premium-card glass-morphism animate-slide-up delay-500">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1" data-testid="text-accuracy">
              {accuracyRate}%
            </div>
            <p className="text-xs text-muted-foreground">Accuracy Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card className="premium-card glass-morphism animate-slide-up delay-600">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-gradient-primary">
            <Layers className="h-5 w-5 text-muted-foreground" />
            Practice Categories
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                className="p-3 h-auto flex-col gap-2 hover:bg-primary hover:text-primary-foreground premium-button-outline"
                onClick={() => startChallenge("Medium", category.id)}
                disabled={generateChallengeMutation.isPending}
                data-testid={`button-category-${category.name.toLowerCase().replace(' ', '-')}`}
              >
                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
                  {category.icon}
                </div>
                <p className="font-medium text-foreground-secondary">{category.name}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance */}
      <Card className="premium-card glass-morphism animate-slide-up delay-700">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-gradient-primary">
            <TrendingUp className="h-5 w-5 text-primary" />
            This Week's Performance
          </h3>
          <div className="flex items-end justify-between h-24 mb-3">
            {Array.from({ length: 7 }, (_, i) => {
              const dayData = Math.floor(Math.random() * 5) + 1;
              const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div 
                    className="bg-primary w-4 rounded-t transition-all" 
                    style={{ height: `${dayData * 4 + 8}px` }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{dayNames[i]}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center">Problems solved per day</p>
        </CardContent>
      </Card>
    </div>
  );
}