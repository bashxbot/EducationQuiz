import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Medal, Brain, TrendingUp, Calendar, Clock, MessageCircle, BarChart3, Atom } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  // Listen for profile updates
  useEffect(() => {
    setCurrentUser(user);

    const handleProfileUpdate = (event: CustomEvent) => {
      const updatedProfile = event.detail;
      setCurrentUser((prev: any) => ({ ...prev, ...updatedProfile }));
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
  }, [user]);

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  const { data: badges } = useQuery({
    queryKey: ["/api/badges"],
  });

  const motivationalQuotes = [
    "The beautiful thing about learning is that nobody can take it away from you.",
    "Education is the most powerful weapon which you can use to change the world.",
    "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    "The more that you read, the more things you will know.",
  ];

  const todayQuote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-xl text-white">
        <h2 className="text-xl font-semibold mb-2" data-testid="text-greeting">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {currentUser?.name || 'Student'}!
        </h2>
        <p className="opacity-90 text-sm" data-testid="text-quote">"{todayQuote}"</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-300" />
            <span className="font-medium text-sm" data-testid="text-streak">
              {currentUser?.currentStreak || 0} day streak
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-yellow-300" />
            <span className="font-medium text-sm" data-testid="text-points">
              {currentUser?.totalPoints || 0} points
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-success" data-testid="text-quizzes-completed">
                23
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Quizzes Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold text-primary" data-testid="text-average-score">
                87%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Physics Quiz: Mechanics</p>
                  <p className="text-xs text-muted-foreground">Scored 92% • 2 hours ago</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">💬</span>
                </div>
                <div>
                  <p className="font-medium text-sm">AI Chat Session</p>
                  <p className="text-xs text-muted-foreground">Math help • Yesterday</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Progress */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Learning Progress
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Mathematics</p>
                  <p className="text-xs text-muted-foreground">8/12 topics completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-secondary rounded-full">
                  <div className="w-2/3 h-full bg-primary rounded-full"></div>
                </div>
                <span className="text-sm font-medium">67%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Atom className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Physics</p>
                  <p className="text-xs text-muted-foreground">5/10 topics completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-secondary rounded-full">
                  <div className="w-1/2 h-full bg-success rounded-full"></div>
                </div>
                <span className="text-sm font-medium">50%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => setLocation("/quiz")}
          className="bg-primary text-primary-foreground p-4 h-auto flex flex-col items-center gap-2 hover:bg-primary/90"
          data-testid="button-start-quiz"
        >
          <Brain className="h-6 w-6" />
          <span className="font-medium">Start Quiz</span>
        </Button>
        <Button
          onClick={() => setLocation("/chat")}
          className="bg-accent text-accent-foreground p-4 h-auto flex flex-col items-center gap-2 hover:bg-accent/90"
          data-testid="button-ask-ai"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="font-medium">Ask AI</span>
        </Button>
      </div>
    </div>
  );
}