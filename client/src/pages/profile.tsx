
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
  XCircle,
  Zap
} from "lucide-react";
import { useUserProfile, useQuizHistory, useReasoningProgress, resetAppData } from "@/hooks/use-app-storage";
import { useBadges, useAutoAchievements } from "@/hooks/use-badges";
import { useTheme } from "@/lib/theme";

export default function Profile() {
  const { profile, updateProfile } = useUserProfile();
  const { history: quizHistory } = useQuizHistory();
  const { progress: reasoningProgress } = useReasoningProgress();
  const { badges, getAllBadgeDefinitions } = useBadges();
  const { theme, setTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [showSettings, setShowSettings] = useState(false);

  // Add loading check
  if (!profile || !quizHistory || !reasoningProgress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Safe badge data object with proper defaults
  const badgeData = {
    totalQuizzes: quizHistory?.length || 0,
    history: quizHistory || [],
    totalPoints: profile?.totalPoints || 0,
    currentStreak: profile?.currentStreak || 0,
    reasoningAccuracy: reasoningProgress?.totalSolved > 0
      ? Math.round((reasoningProgress.accuracyRate * reasoningProgress.totalSolved) / reasoningProgress.totalSolved)
      : 0
  };

  // Auto-trigger achievements with safe data
  useAutoAchievements(badgeData);

  // Calculate stats with safe defaults
  const totalQuizzes = quizHistory?.length || 0;
  const averageScore = totalQuizzes > 0 
    ? Math.round(quizHistory.reduce((sum: number, quiz: any) => sum + (quiz.score || 0), 0) / totalQuizzes)
    : 0;
  const totalReasoningChallenges = reasoningProgress?.totalSolved || 0;
  const reasoningAccuracy = reasoningProgress?.accuracyRate || 0;

  const handleSaveProfile = async () => {
    // Update profile locally and globally
    updateProfile(editedProfile);
    
    // Also send to server to update globally
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProfile)
      });
    } catch (error) {
      console.error('Error updating profile globally:', error);
    }
    
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleResetData = () => {
    resetAppData();
    setEditedProfile({
      ...profile,
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
      badges: badges,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Badge statistics
  const allBadgeDefinitions = getAllBadgeDefinitions();
  const earnedBadgeIds = new Set((badges || []).map(b => b.id));
  const badgeStats = {
    total: allBadgeDefinitions.length,
    earned: (badges || []).length,
    progress: allBadgeDefinitions.length > 0 ? Math.round(((badges || []).length / allBadgeDefinitions.length) * 100) : 0
  };

  return (
    <div className="premium-container">
      {/* Profile Header */}
      <Card className="premium-card glass-morphism animate-slide-up">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary via-accent to-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl animate-pulse-glow">
                <span className="relative z-10">{profile?.name?.charAt(0) || 'U'}</span>
              </div>
              <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 premium-button-secondary shadow-lg">
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
                    className="border-primary/30 focus:border-primary"
                  />
                  <Input
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                    className="border-primary/30 focus:border-primary"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={editedProfile.class}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, class: e.target.value }))}
                      placeholder="Class"
                      className="border-primary/30 focus:border-primary"
                    />
                    <Input
                      value={editedProfile.school}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, school: e.target.value }))}
                      placeholder="School"
                      className="border-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveProfile} variant="default">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold gradient-text font-heading">{profile?.name || 'Student'}</h2>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="hover:text-primary">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm font-body">{profile?.email || 'user@school.edu'}</p>
                  <p className="text-muted-foreground text-sm font-body">
                    {profile?.class || 'Class 10'} • {profile?.school || 'School'}
                  </p>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="hover:text-primary">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="premium-card hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold text-primary font-heading">{profile?.totalPoints || 0}</div>
            </div>
            <p className="text-sm text-muted-foreground font-body">Total Points</p>
          </CardContent>
        </Card>

        <Card className="premium-card hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-accent" />
              <div className="text-2xl font-bold text-accent font-heading">{profile?.currentStreak || 0}</div>
            </div>
            <p className="text-sm text-muted-foreground font-body">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Academic Performance */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <Trophy className="h-5 w-5" />
            Academic Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-surface/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="text-lg font-bold text-primary font-heading">{totalQuizzes}</div>
              <p className="text-sm text-muted-foreground font-body">Tests Completed</p>
            </div>
            <div className="text-center p-3 bg-surface/50 rounded-lg border border-accent/20 hover:border-accent/40 transition-colors">
              <div className="text-lg font-bold text-accent font-heading">{averageScore}%</div>
              <p className="text-sm text-muted-foreground font-body">Average Score</p>
            </div>
            <div className="text-center p-3 bg-surface/50 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="text-lg font-bold text-blue-500 font-heading">{totalReasoningChallenges}</div>
              <p className="text-sm text-muted-foreground font-body">Logic Puzzles</p>
            </div>
            <div className="text-center p-3 bg-surface/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="text-lg font-bold text-primary font-heading">{reasoningAccuracy}%</div>
              <p className="text-sm text-muted-foreground font-body">Logic Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges & Achievements */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <Award className="h-5 w-5" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2 font-body">
              <span>Progress: {badgeStats.earned}/{badgeStats.total}</span>
              <span className="text-primary">{badgeStats.progress}%</span>
            </div>
            <div className="w-full bg-surface rounded-full h-3 border border-primary/20">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500 shadow-lg" 
                style={{ width: `${badgeStats.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {allBadgeDefinitions.map((badge: any, index: number) => (
              <div key={`badge-${badge.id}-${index}`} className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl transition-all duration-300 ${
                  earnedBadgeIds.has(badge.id) 
                    ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg' 
                    : 'bg-muted text-muted-foreground border border-border'
                }`}>
                  {badge.id === 'scholar' && <BookOpen className="h-6 w-6" />}
                  {badge.id === 'speedster' && <Target className="h-6 w-6" />}
                  {badge.id === 'perfectionist' && <Star className="h-6 w-6" />}
                  {badge.id === 'streaker' && <Flame className="h-6 w-6" />}
                  {!['scholar', 'speedster', 'perfectionist', 'streaker'].includes(badge.id) && <Medal className="h-6 w-6" />}
                </div>
                <p className="text-xs font-medium font-body">{badge.name}</p>
                <p className="text-xs text-muted-foreground font-body">{badge.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <History className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(quizHistory || []).slice(0, 5).map((quiz: any, index: number) => (
              <div key={`quiz-${quiz.subject}-${quiz.completedAt}-${index}`} className="flex justify-between items-center p-3 bg-surface/30 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                <div>
                  <p className="font-medium text-primary font-body">{quiz.subject}</p>
                  <p className="text-sm text-muted-foreground font-body">{quiz.topic}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent font-heading">{quiz.score}%</p>
                  <p className="text-sm text-muted-foreground font-body">{quiz.difficulty}</p>
                </div>
              </div>
            ))}
            {(!quizHistory || quizHistory.length === 0) && (
              <p className="text-center text-muted-foreground py-4 font-body">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="premium-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="gradient-text font-heading">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block font-body">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  Dark Mode
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  Auto Mode
                </Button>
              </div>
            </div>

            <div className="border-t border-primary/20 pt-4">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-primary font-heading">
                <Shield className="h-4 w-4" />
                Data Management
              </h3>
              <div className="space-y-2">
                <Button variant="outline" onClick={exportData} className="w-full justify-start border-primary/30 hover:border-primary">
                  <Download className="h-4 w-4 mr-2" />
                  Export Learning Data
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-destructive border-destructive/30 hover:border-destructive">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="premium-card border-destructive/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive font-heading">Reset All Data</AlertDialogTitle>
                      <AlertDialogDescription className="font-body">
                        This action cannot be undone. This will permanently delete all your progress, test history, and achievements.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetData} className="bg-destructive text-destructive-foreground hover:bg-destructive/80">
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
