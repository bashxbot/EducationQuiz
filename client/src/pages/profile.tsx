import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Trophy, 
  Medal, 
  History, 
  PieChart, 
  Settings, 
  Bell, 
  UserPen, 
  Download, 
  LogOut 
} from "lucide-react";
import type { User, Quiz } from "@shared/schema";

export default function Profile() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: quizHistory = [] } = useQuery({
    queryKey: ["/api/quiz/history"],
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["/api/badges"],
  });

  const totalQuizzes = quizHistory.length;
  const averageScore = totalQuizzes > 0 
    ? Math.round(quizHistory.reduce((sum: number, quiz: Quiz) => sum + (quiz.score || 0), 0) / totalQuizzes)
    : 0;

  const subjectProgress = [
    { name: "Mathematics", completed: 8, total: 12, percentage: 67 },
    { name: "Physics", completed: 5, total: 10, percentage: 50 },
    { name: "Chemistry", completed: 6, total: 9, percentage: 67 },
  ];

  const allBadges = [
    { 
      type: "streak_master", 
      name: "Streak Master", 
      description: "7+ days", 
      icon: "🔥", 
      earned: (user?.currentStreak || 0) >= 7 
    },
    { 
      type: "quiz_master", 
      name: "Quiz Master", 
      description: "20+ quizzes", 
      icon: "🧠", 
      earned: totalQuizzes >= 20 
    },
    { 
      type: "perfectionist", 
      name: "Perfectionist", 
      description: "100% score", 
      icon: "⭐", 
      earned: quizHistory.some((quiz: Quiz) => quiz.score === 100) 
    },
    { 
      type: "scholar", 
      name: "Scholar", 
      description: "1000+ points", 
      icon: "🎓", 
      earned: (user?.totalPoints || 0) >= 1000 
    },
    { 
      type: "speed_demon", 
      name: "Speed Demon", 
      description: "Fast answers", 
      icon: "⚡", 
      earned: false 
    },
    { 
      type: "helper", 
      name: "Helper", 
      description: "Help others", 
      icon: "👥", 
      earned: false 
    },
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* User Profile Header */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white" data-testid="text-user-initials">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'AK'}
            </span>
          </div>
          <h2 className="text-xl font-bold mb-1" data-testid="text-user-name">
            {user?.name || 'Alex Kumar'}
          </h2>
          <p className="text-muted-foreground text-sm mb-3" data-testid="text-user-class">
            {user?.class || 'Class 10'} • Science Stream
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span data-testid="text-join-date">
                Joined {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Mar 2024'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-accent" />
              <span data-testid="text-user-rank">Rank #23</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Medal className="h-5 w-5 text-accent" />
            Achievement Badges
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {allBadges.map((badge) => (
              <div 
                key={badge.type} 
                className={`text-center ${!badge.earned ? 'opacity-50' : ''}`}
                data-testid={`badge-${badge.type}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  badge.earned 
                    ? 'bg-gradient-to-r from-accent to-warning' 
                    : 'bg-muted'
                }`}>
                  <span className="text-white text-lg">{badge.icon}</span>
                </div>
                <p className="text-xs font-medium">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiz History */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Recent Quiz History
          </h3>
          <div className="space-y-3">
            {quizHistory.slice(0, 3).map((quiz: Quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    (quiz.score || 0) >= 80 ? 'bg-success' : (quiz.score || 0) >= 60 ? 'bg-warning' : 'bg-destructive'
                  }`}>
                    <span className="text-white text-sm">
                      {(quiz.score || 0) >= 80 ? '✓' : (quiz.score || 0) >= 60 ? '!' : '✗'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {quiz.subject}: {quiz.topic || 'Mixed Topics'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : 'In Progress'} • {quiz.totalQuestions} questions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    (quiz.score || 0) >= 80 ? 'text-success' : (quiz.score || 0) >= 60 ? 'text-warning' : 'text-destructive'
                  }`} data-testid={`score-${quiz.id}`}>
                    {quiz.score || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{Math.max((quiz.score || 0) - 50, 0)} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-history">
            View All History
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-accent" />
            Learning Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="text-total-quizzes">
                {totalQuizzes}
              </div>
              <p className="text-xs text-muted-foreground">Total Quizzes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1" data-testid="text-average-score">
                {averageScore}%
              </div>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1" data-testid="text-total-points">
                {user?.totalPoints || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-1" data-testid="text-current-streak">
                {user?.currentStreak || 0}
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
          
          {/* Subject Progress */}
          <div className="space-y-3">
            {subjectProgress.map((subject) => (
              <div key={subject.name} className="flex items-center justify-between">
                <span className="text-sm font-medium">{subject.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-secondary rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${subject.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground" data-testid={`progress-${subject.name.toLowerCase()}`}>
                    {subject.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Settings
          </h3>
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-between" data-testid="button-notifications">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <span className="text-sm">Notifications</span>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </Button>
            <Button variant="ghost" className="w-full justify-between" data-testid="button-edit-profile">
              <div className="flex items-center gap-3">
                <UserPen className="h-5 w-5 text-primary" />
                <span className="text-sm">Edit Profile</span>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </Button>
            <Button variant="ghost" className="w-full justify-between" data-testid="button-download-data">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary" />
                <span className="text-sm">Download Data</span>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-between text-destructive hover:text-destructive hover:bg-destructive/10" 
              data-testid="button-sign-out"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Sign Out</span>
              </div>
              <span className="text-xs">→</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
