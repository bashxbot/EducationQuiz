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
  Flame,
  BookOpen,
  Award,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Target
} from "lucide-react";
import { useUserProfile, useQuizHistory, useReasoningProgress, resetAppData } from "@/hooks/use-app-storage";
import { useBadges, useAutoAchievements } from "@/hooks/use-badges";
import { useTheme } from "@/lib/theme";

export default function Profile() {
  const { profile, updateProfile } = useUserProfile();
  const { quizHistory } = useQuizHistory();
  const { reasoningProgress } = useReasoningProgress();
  const { badges } = useBadges();
  const { theme, setTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-trigger achievements
  useAutoAchievements();

  // Calculate stats
  const totalQuizzes = quizHistory.length;
  const averageScore = totalQuizzes > 0 
    ? Math.round(quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / totalQuizzes)
    : 0;
  const totalReasoningChallenges = reasoningProgress.length;
  const reasoningAccuracy = totalReasoningChallenges > 0
    ? Math.round((reasoningProgress.filter(r => r.correct).length / totalReasoningChallenges) * 100)
    : 0;

  const handleSaveProfile = () => {
    updateProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleResetData = () => {
    resetAppData();
    setEditedProfile({
      name: "Anonymous User",
      email: "",
      class: "",
      school: "",
      totalPoints: 0,
      currentStreak: 0
    });
  };

  const exportData = () => {
    const data = {
      profile,
      quizHistory,
      reasoningProgress,
      badges: badges.earned,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-buddy-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Badge statistics
  const badgeStats = {
    total: badges.available.length,
    earned: badges.earned.length,
    progress: Math.round((badges.earned.length / badges.available.length) * 100)
  };

  // Achievements data
  const userBadges = badges.earned;
  const achievements = [
    { 
      icon: Target,
      title: 'Perfect Score',
      description: 'Scored 100% on a quiz',
      points: 50,
      earned: userBadges.includes('perfectionist')
    },
    { 
      icon: Trophy,
      title: 'Quiz Master',
      description: 'Completed 10 quizzes',
      points: 100,
      earned: userBadges.includes('quiz-master')
    },
    { 
      icon: Flame,
      title: 'Speed Demon',
      description: 'Completed a quiz in under 2 minutes',
      points: 75,
      earned: userBadges.includes('speedster')
    }
  ];

  return (
    <div className="p-4 space-y-6 pb-20 custom-scrollbar smooth-scroll">
      {/* Profile Header */}
      <Card className="glass-card glass-card-hover animate-slide-up">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative float-animation">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg neon-primary">
                {profile.name?.charAt(0) || 'A'}
              </div>
              <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 btn-glass hover-lift">
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full Name"
                    className="input-glass focus-enhanced"
                  />
                  <Input
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                    className="input-glass focus-enhanced"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={editedProfile.class}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, class: e.target.value }))}
                      placeholder="Class"
                      className="input-glass focus-enhanced"
                    />
                    <Input
                      value={editedProfile.school}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, school: e.target.value }))}
                      placeholder="School"
                      className="input-glass focus-enhanced"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveProfile} className="btn-neon micro-bounce">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit} className="btn-glass micro-bounce">
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold font-display gradient-text">{profile.name}</h2>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="hover-lift">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">{profile.email}</p>
                  <p className="text-muted-foreground text-sm">
                    {profile.class} • {profile.school}
                  </p>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="hover-lift">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card glass-card-hover pulse-glow animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold text-primary font-display neon-text">{profile.totalPoints}</div>
            </div>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </CardContent>
        </Card>

        <Card className="glass-card glass-card-hover pulse-glow animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div className="text-2xl font-bold text-orange-500 font-display neon-text">{profile.currentStreak}</div>
            </div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Academic Performance */}
      <Card className="glass-card glass-card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Trophy className="h-5 w-5" />
            Academic Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 glass-border rounded-lg hover-lift">
              <div className="text-lg font-bold font-display gradient-text">{totalQuizzes}</div>
              <p className="text-sm text-muted-foreground">Quizzes Completed</p>
            </div>
            <div className="text-center p-3 glass-border rounded-lg hover-lift">
              <div className="text-lg font-bold font-display gradient-text">{averageScore}%</div>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
            <div className="text-center p-3 glass-border rounded-lg hover-lift">
              <div className="text-lg font-bold font-display gradient-text">{totalReasoningChallenges}</div>
              <p className="text-sm text-muted-foreground">Reasoning Challenges</p>
            </div>
            <div className="text-center p-3 glass-border rounded-lg hover-lift">
              <div className="text-lg font-bold font-display gradient-text">{reasoningAccuracy}%</div>
              <p className="text-sm text-muted-foreground">Reasoning Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges & Achievements */}
      <Card className="glass-card glass-card-hover animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Award className="h-5 w-5" />
            Badges & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress: {badgeStats.earned}/{badgeStats.total}</span>
              <span>{badgeStats.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 progress-glow">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300" 
                style={{ width: `${badgeStats.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {badges.available.map((badge, index) => (
              <div key={`badge-${badge.id}`} className="text-center hover-lift">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl transition-all duration-300 ${
                  badges.earned.includes(badge.id) 
                    ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground neon-primary' 
                    : 'bg-muted text-muted-foreground glass-border'
                }`}>
                  {badge.id === 'scholar' && <BookOpen className="h-6 w-6" />}
                  {badge.id === 'speedster' && <Target className="h-6 w-6" />}
                  {badge.id === 'perfectionist' && <Star className="h-6 w-6" />}
                  {badge.id === 'streaker' && <Flame className="h-6 w-6" />}
                  {badge.id === 'quiz-master' && <Trophy className="h-6 w-6" />}
                  {!['scholar', 'speedster', 'perfectionist', 'streaker', 'quiz-master'].includes(badge.id) && <Medal className="h-6 w-6" />}
                </div>
                <p className="text-xs font-medium">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            ))}
          </div>

          {/* Achievements Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 font-display">
              <Lightbulb className="h-5 w-5" />
              Your Achievements
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div 
                  key={`achievement-${achievement.title}-${index}`}
                  className="flex items-center justify-between p-3 glass-border rounded-lg hover-lift"
                >
                  <div className="flex items-center gap-3">
                    <achievement.icon className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="glass-border">{achievement.points} pts</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glass-card glass-card-hover animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <History className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quizHistory.slice(0, 5).map((quiz, index) => (
              <div key={`quiz-${quiz.subject}-${quiz.completedAt}-${index}`} className="flex justify-between items-center p-3 glass-border rounded-lg hover-lift">
                <div>
                  <p className="font-medium">{quiz.subject}</p>
                  <p className="text-sm text-muted-foreground">{quiz.topic}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold gradient-text">{quiz.score}%</p>
                  <p className="text-sm text-muted-foreground">{quiz.difficulty}</p>
                </div>
              </div>
            ))}
            {quizHistory.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="font-display">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('light')}
                  className={theme === 'light' ? 'btn-neon' : 'btn-glass'}
                >
                  Light
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className={theme === 'dark' ? 'btn-neon' : 'btn-glass'}
                >
                  Dark
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('system')}
                  className={theme === 'system' ? 'btn-neon' : 'btn-glass'}
                >
                  System
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3 flex items-center gap-2 font-display">
                <Shield className="h-4 w-4" />
                Data Management
              </h3>
              <div className="space-y-2">
                <Button variant="outline" onClick={exportData} className="w-full justify-start btn-glass hover-lift">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-destructive btn-glass hover-lift">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">Reset All Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your progress, quiz history, and achievements.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="btn-glass">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetData} className="bg-destructive text-destructive-foreground btn-neon">
                        Reset Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}