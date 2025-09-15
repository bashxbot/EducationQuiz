import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  LogOut,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  RotateCcw,
  Star,
  Target,
  Flame,
  BookOpen,
  Award,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { useUserProfile, useQuizHistory, useReasoningProgress, resetAppData } from "@/hooks/use-app-storage";
import { useBadges, useAutoAchievements } from "@/hooks/use-badges";
import { useTheme } from "@/lib/theme";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  type?: "text" | "email" | "password";
  multiline?: boolean;
}

function EditableField({ label, value, onSave, type = "text", multiline = false }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="flex gap-2">
          {multiline ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1"
              data-testid={`input-${label.toLowerCase().replace(' ', '-')}`}
            />
          ) : (
            <Input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1"
              data-testid={`input-${label.toLowerCase().replace(' ', '-')}`}
            />
          )}
          <Button 
            size="sm" 
            onClick={handleSave}
            data-testid={`button-save-${label.toLowerCase().replace(' ', '-')}`}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleCancel}
            data-testid={`button-cancel-${label.toLowerCase().replace(' ', '-')}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <p className="text-sm" data-testid={`text-${label.toLowerCase().replace(' ', '-')}`}>
          {type === "password" ? "••••••••" : value}
        </p>
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => setIsEditing(true)}
        data-testid={`button-edit-${label.toLowerCase().replace(' ', '-')}`}
      >
        <Edit3 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function Profile() {
  const { profile, updateProfile } = useUserProfile();
  const { history, getAverageScore, getSubjectStats } = useQuizHistory();
  const { getAllBadgeDefinitions, badges } = useBadges();
  const { progress: reasoningProgress } = useReasoningProgress();
  const { theme, setTheme } = useTheme();
  
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  const totalQuizzes = history.length;
  const averageScore = getAverageScore();
  const subjectStats = getSubjectStats();

  // Auto-check achievements with current data
  useAutoAchievements({
    totalQuizzes,
    history,
    totalPoints: profile.totalPoints,
    currentStreak: reasoningProgress.currentStreak,
    reasoningAccuracy: reasoningProgress.accuracyRate,
  });

  const motivationalMessages = [
    "Great progress! Keep learning every day!",
    `You've completed ${totalQuizzes} quizzes. Challenge yourself with a new subject!`,
    "Your consistency is impressive! Try a harder difficulty level.",
    `${reasoningProgress.currentStreak} day streak! You're building great habits!`,
    "Learning is a journey, not a destination. Keep exploring!",
  ];

  const todayMessage = motivationalMessages[new Date().getDay() % motivationalMessages.length];

  const allBadges = getAllBadgeDefinitions();

  const resetProgress = () => {
    // Clear only app-specific data, not all localStorage
    resetAppData();
    window.location.reload();
  };

  const downloadData = () => {
    const data = {
      profile,
      history,
      badges,
      reasoningProgress,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduapp-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* User Profile Header */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-white" data-testid="text-user-initials">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="absolute -bottom-1 -right-1 rounded-full p-2"
              data-testid="button-change-picture"
            >
              <Camera className="h-3 w-3" />
            </Button>
          </div>
          <h2 className="text-xl font-bold mb-1" data-testid="text-user-name">
            {profile.name}
          </h2>
          <p className="text-muted-foreground text-sm mb-3" data-testid="text-user-details">
            {profile.class} • {profile.school}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span data-testid="text-join-date">
                Joined {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-accent" />
              <span data-testid="text-user-rank">Rank #{Math.floor(profile.totalPoints / 50) + 1}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent" />
            <p className="text-sm font-medium" data-testid="text-motivation">
              {todayMessage}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Editable Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPen className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EditableField
            label="Full Name"
            value={profile.name}
            onSave={(value) => updateProfile({ name: value })}
          />
          <EditableField
            label="Email"
            value={profile.email}
            onSave={(value) => updateProfile({ email: value })}
            type="email"
          />
          <EditableField
            label="Class/Year"
            value={profile.class}
            onSave={(value) => updateProfile({ class: value })}
          />
          <EditableField
            label="School/College"
            value={profile.school}
            onSave={(value) => updateProfile({ school: value })}
          />
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
                    ? badge.color
                    : 'bg-muted'
                }`}>
                  <badge.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            ))}
          </div>
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
                {profile.totalPoints}
              </div>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-1" data-testid="text-current-streak">
                {reasoningProgress.currentStreak}
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
          
          {/* Subject Progress */}
          <div className="space-y-3">
            <h4 className="font-medium">Subject Performance</h4>
            {subjectStats.map((subject, index) => (
              <div key={`${subject.subject}-${index}`} className="flex items-center justify-between">
                <span className="text-sm font-medium">{subject.subject}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-secondary rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${subject.averageScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground" data-testid={`progress-${subject.subject.toLowerCase()}`}>
                    {subject.averageScore}% ({subject.count})
                  </span>
                </div>
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
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {history.slice(0, 10).map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    quiz.score >= 80 ? 'bg-success' : quiz.score >= 60 ? 'bg-warning' : 'bg-destructive'
                  }`}>
                    <span className="text-white text-sm">
                      {quiz.score >= 80 ? '✓' : quiz.score >= 60 ? '!' : '✗'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {quiz.subject}: {quiz.topic || 'Mixed Topics'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(quiz.completedAt).toLocaleDateString()} • {quiz.totalQuestions} questions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    quiz.score >= 80 ? 'text-success' : quiz.score >= 60 ? 'text-warning' : 'text-destructive'
                  }`} data-testid={`score-${quiz.id}`}>
                    {quiz.score}%
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedQuiz(quiz)}
                    data-testid={`button-review-${quiz.id}`}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {history.length > 10 && (
            <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-history">
              View All History ({history.length} quizzes)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Settings & Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <span className="text-sm">Dark Mode</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                data-testid="button-toggle-theme"
              >
                {theme === "light" ? "Enable" : "Disable"}
              </Button>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-between" data-testid="button-change-password">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm">Change Password</span>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input type="password" placeholder="Current Password" />
                  <Input type="password" placeholder="New Password" />
                  <Input type="password" placeholder="Confirm New Password" />
                  <Button className="w-full">Update Password</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="ghost" 
              className="w-full justify-between" 
              onClick={downloadData}
              data-testid="button-download-data"
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary" />
                <span className="text-sm">Download My Data</span>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-destructive hover:text-destructive hover:bg-destructive/10"
                  data-testid="button-reset-progress"
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5" />
                    <span className="text-sm">Reset All Progress</span>
                  </div>
                  <span className="text-xs">→</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your quiz history, badges, and progress. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetProgress} className="bg-destructive hover:bg-destructive/90">
                    Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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

      {/* Quiz Review Dialog */}
      {selectedQuiz && (
        <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Quiz Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold">{selectedQuiz.subject}: {selectedQuiz.topic || 'Mixed Topics'}</h3>
                <p className="text-muted-foreground text-sm">
                  {new Date(selectedQuiz.completedAt).toLocaleDateString()}
                </p>
                <div className="text-3xl font-bold text-primary mt-2">
                  {selectedQuiz.score}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {Math.round((selectedQuiz.score / 100) * selectedQuiz.totalQuestions)} out of {selectedQuiz.totalQuestions} correct
                </p>
              </div>
              <div className="text-center">
                <Badge 
                  variant={selectedQuiz.score >= 80 ? "default" : selectedQuiz.score >= 60 ? "secondary" : "destructive"}
                  className="text-lg px-4 py-2"
                >
                  {selectedQuiz.score >= 80 ? "Excellent!" : selectedQuiz.score >= 60 ? "Good Job!" : "Keep Practicing!"}
                </Badge>
              </div>
              <Button onClick={() => setSelectedQuiz(null)} className="w-full">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}