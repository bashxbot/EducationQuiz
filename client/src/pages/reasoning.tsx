
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Flame, BarChart3, Lightbulb, TrendingUp, Layers, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ReasoningChallenge } from "@shared/schema";

const difficulties = [
  { name: "Easy", color: "bg-success", points: 10, description: "Basic logical reasoning" },
  { name: "Medium", color: "bg-warning", points: 20, description: "Intermediate problem solving" },
  { name: "Hard", color: "bg-destructive", points: 30, description: "Advanced critical thinking" },
];

const categories = [
  { name: "Logic Puzzles", icon: "🧩" },
  { name: "Number Series", icon: "🔢" },
  { name: "Pattern Match", icon: "🔷" },
  { name: "Analytical", icon: "🧠" },
];

export default function Reasoning() {
  const [currentChallenge, setCurrentChallenge] = useState<ReasoningChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [challengeResult, setChallengeResult] = useState<any>(null);

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

  const startChallenge = (difficulty: string, category: string = "logic") => {
    generateChallengeMutation.mutate({ difficulty: difficulty.toLowerCase(), category });
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
      <div className="p-4 space-y-6 pb-20 custom-scrollbar smooth-scroll">
        <Card className="glass-card glass-card-hover animate-slide-up neon-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display gradient-text">
              {challengeResult.correct ? "Correct! 🎉" : "Not quite right 😔"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="font-medium mb-2">Your answer:</p>
              <p className="text-lg glass-border p-3 rounded-lg">{challengeResult.userAnswer}</p>
            </div>

            <div className="text-center">
              <p className="font-medium mb-2">Correct answer:</p>
              <p className="text-lg glass-border p-3 rounded-lg text-primary font-semibold neon-text">
                {challengeResult.answer}
              </p>
            </div>

            {challengeResult.correct && (
              <div className="text-center float-animation">
                <Badge className="text-lg px-4 py-2 bg-success neon-accent">
                  +{challengeResult.points} points earned!
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={resetChallenge} variant="outline" data-testid="button-new-challenge" className="btn-glass hover-lift">
                New Challenge
              </Button>
              <Button 
                onClick={() => startChallenge(currentChallenge?.difficulty || "medium")}
                data-testid="button-try-again"
                className="btn-neon micro-bounce"
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
      <div className="p-4 space-y-6 pb-20 custom-scrollbar smooth-scroll">
        <Card className="glass-card glass-card-hover animate-slide-up">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg capitalize font-display gradient-text">
                {currentChallenge.difficulty} Challenge
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetChallenge} data-testid="button-exit-challenge" className="hover-lift">
                Exit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 glass-border rounded-lg">
              <p className="text-sm font-medium mb-2 gradient-text">{currentChallenge.category}</p>
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
                className="input-glass focus-enhanced"
              />
              
              <Button
                onClick={submitAnswer}
                disabled={!userAnswer.trim() || submitAnswerMutation.isPending}
                className="w-full btn-neon micro-bounce"
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

  return (
    <div className="p-4 space-y-6 pb-20 custom-scrollbar smooth-scroll">
      {/* Header */}
      <div className="text-center animate-slide-up">
        <h2 className="text-2xl font-bold mb-2 font-display gradient-text">Daily Reasoning</h2>
        <p className="text-muted-foreground">Sharpen your critical thinking skills</p>
      </div>

      {/* Streak Counter */}
      <div className="glass-card glass-card-hover neon-primary p-6 rounded-xl text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-center gap-2 mb-2 float-animation">
          <Flame className="h-8 w-8 text-orange-500" />
          <span className="text-3xl font-bold font-display neon-text" data-testid="text-streak">
            {user?.currentStreak || 0}
          </span>
        </div>
        <p className="font-semibold font-display">Day Streak</p>
        <p className="text-sm opacity-90 mt-1">Keep it up! You're on fire! 🔥</p>
      </div>

      {/* Difficulty Selection */}
      <Card className="glass-card glass-card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 font-display">
            <BarChart3 className="h-5 w-5 text-primary" />
            Choose Difficulty
          </h3>
          <div className="space-y-2">
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty.name}
                variant="outline"
                className="w-full p-4 h-auto justify-between glass-card-hover btn-glass"
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
                <Badge variant="secondary" className="text-xs glass-border">
                  +{difficulty.points} pts
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Challenge */}
      <Card className="glass-card glass-card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 font-display">
            <Lightbulb className="h-5 w-5 text-accent" />
            Today's Challenge
          </h3>
          <div className="p-4 glass-border rounded-lg mb-4">
            <p className="text-sm font-medium mb-2 gradient-text">Pattern Recognition</p>
            <p className="text-sm text-muted-foreground mb-3">
              Look at the sequence: 2, 6, 12, 20, 30, ?
            </p>
            <p className="text-sm">What comes next in this sequence?</p>
          </div>
          <Button 
            onClick={() => startChallenge("Medium")}
            className="w-full btn-neon micro-bounce"
            disabled={generateChallengeMutation.isPending}
            data-testid="button-start-daily-challenge"
          >
            Start Challenge
          </Button>
        </CardContent>
      </Card>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card glass-card-hover pulse-glow animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1 font-display neon-text" data-testid="text-problems-solved">
              {reasoningHistory.length}
            </div>
            <p className="text-xs text-muted-foreground">Problems Solved</p>
          </CardContent>
        </Card>
        <Card className="glass-card glass-card-hover pulse-glow animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1 font-display neon-text" data-testid="text-accuracy">
              {accuracyRate}%
            </div>
            <p className="text-xs text-muted-foreground">Accuracy Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card className="glass-card glass-card-hover animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 font-display">
            <Layers className="h-5 w-5 text-muted-foreground" />
            Practice Categories
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                className="p-3 h-auto flex-col gap-2 glass-card-hover btn-glass"
                onClick={() => startChallenge("Medium", category.name.toLowerCase().replace(" ", "_"))}
                disabled={generateChallengeMutation.isPending}
                data-testid={`button-category-${category.name.toLowerCase().replace(' ', '-')}`}
              >
                <span className="text-lg">{category.icon}</span>
                <p className="text-sm font-medium">{category.name}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance */}
      <Card className="glass-card glass-card-hover animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 font-display">
            <TrendingUp className="h-5 w-5 text-primary" />
            This Week's Performance
          </h3>
          <div className="flex items-end justify-between h-24 mb-3 glass-border rounded-lg p-3">
            {Array.from({ length: 7 }, (_, i) => {
              const dayData = Math.floor(Math.random() * 5) + 1;
              const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div 
                    className="bg-gradient-to-t from-primary to-accent w-4 rounded-t transition-all hover-lift" 
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
