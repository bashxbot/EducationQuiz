
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
  Target,
  Zap,
  Crown,
  Gem,
  Sparkles,
  Rocket,
  Brain,
  Heart,
  Coins,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  Plus,
  BarChart3,
  Activity,
  LineChart
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
  const [activeTab, setActiveTab] = useState('overview');

  // Auto-trigger achievements
  useAutoAchievements();

  // Safe calculations with fallbacks
  const safeQuizHistory = quizHistory || [];
  const safeReasoningProgress = reasoningProgress || [];
  
  const totalQuizzes = safeQuizHistory.length;
  const averageScore = totalQuizzes > 0 
    ? Math.round(safeQuizHistory.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / totalQuizzes)
    : 0;
  const totalReasoningChallenges = safeReasoningProgress.length;
  const reasoningAccuracy = totalReasoningChallenges > 0
    ? Math.round((safeReasoningProgress.filter(r => r.correct).length / totalReasoningChallenges) * 100)
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
      quizHistory: safeQuizHistory,
      reasoningProgress: safeReasoningProgress,
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

  // Enhanced badge statistics with safety
  const safeBadges = badges || { available: [], earned: [] };
  const badgeStats = {
    total: safeBadges.available.length,
    earned: safeBadges.earned.length,
    progress: safeBadges.available.length > 0 ? Math.round((safeBadges.earned.length / safeBadges.available.length) * 100) : 0
  };

  // Enhanced stats calculations
  const perfectScores = safeQuizHistory.filter(q => q.score === 100).length;
  const bestScore = safeQuizHistory.length > 0 ? Math.max(...safeQuizHistory.map(q => q.score || 0)) : 0;
  const totalTimeSpent = safeQuizHistory.reduce((sum, quiz) => sum + (quiz.timeSpent || 0), 0);
  const averageTimePerQuiz = totalQuizzes > 0 ? Math.round(totalTimeSpent / totalQuizzes) : 0;

  // Experience level calculation
  const experienceLevel = Math.floor((profile.totalPoints || 0) / 100) + 1;
  const nextLevelPoints = experienceLevel * 100;
  const currentLevelProgress = ((profile.totalPoints || 0) % 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl animate-float delay-500"></div>
      </div>

      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl ring-4 ring-white/20">
                    {profile.name?.charAt(0) || 'A'}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {profile.name || "Anonymous User"}
                    </h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-gray-300 text-lg mb-1">{profile.email}</p>
                  <p className="text-gray-400">{profile.class} • {profile.school}</p>
                  
                  {/* Level Progress */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-300 font-semibold">Level {experienceLevel}</span>
                      <span className="text-gray-400">{currentLevelProgress}/100 XP</span>
                    </div>
                    <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000"
                        style={{ width: `${currentLevelProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowSettings(true)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-3"
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-400/30">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span className="text-xs text-purple-300 font-semibold">POINTS</span>
                </div>
                <div className="text-2xl font-bold text-white">{profile.totalPoints || 0}</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-4 border border-orange-400/30">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-6 h-6 text-orange-400" />
                  <span className="text-xs text-orange-300 font-semibold">STREAK</span>
                </div>
                <div className="text-2xl font-bold text-white">{profile.currentStreak || 0}</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 border border-blue-400/30">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-6 h-6 text-blue-400" />
                  <span className="text-xs text-blue-300 font-semibold">ACCURACY</span>
                </div>
                <div className="text-2xl font-bold text-white">{averageScore}%</div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-4 border border-green-400/30">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-6 h-6 text-green-400" />
                  <span className="text-xs text-green-300 font-semibold">BADGES</span>
                </div>
                <div className="text-2xl font-bold text-white">{badgeStats.earned}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: LineChart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <span>Performance</span>
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Quizzes Completed</p>
                      <p className="text-gray-400 text-sm">Total assessments taken</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{totalQuizzes}</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Perfect Scores</p>
                      <p className="text-gray-400 text-sm">100% quiz results</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{perfectScores}</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Avg Time/Quiz</p>
                      <p className="text-gray-400 text-sm">Minutes per quiz</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{Math.round(averageTimePerQuiz / 60)}m</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Reasoning Tasks</p>
                      <p className="text-gray-400 text-sm">Logic challenges solved</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{totalReasoningChallenges}</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <History className="w-6 h-6 text-blue-400" />
                <span>Recent Activity</span>
              </h3>
              
              <div className="space-y-4">
                {safeQuizHistory.slice(0, 6).map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        quiz.score >= 90 ? 'bg-gradient-to-br from-green-400 to-emerald-400' :
                        quiz.score >= 70 ? 'bg-gradient-to-br from-yellow-400 to-orange-400' :
                        'bg-gradient-to-br from-red-400 to-pink-400'
                      }`}>
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{quiz.subject}</p>
                        <p className="text-gray-400 text-sm">{quiz.topic}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">{quiz.score}%</div>
                      <div className="text-gray-400 text-sm">{quiz.difficulty}</div>
                    </div>
                  </div>
                ))}
                
                {safeQuizHistory.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-white/50" />
                    </div>
                    <p className="text-white/70">No quiz history yet</p>
                    <p className="text-white/50 text-sm">Start taking quizzes to see your progress</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-white flex items-center space-x-3">
                <Award className="w-8 h-8 text-yellow-400" />
                <span>Achievements & Badges</span>
              </h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{badgeStats.earned}/{badgeStats.total}</div>
                <div className="text-sm text-gray-400">Badges Earned</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-purple-300 font-semibold">Progress: {badgeStats.progress}%</span>
                <span className="text-gray-400">{badgeStats.total - badgeStats.earned} remaining</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full transition-all duration-1000"
                  style={{ width: `${badgeStats.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {safeBadges.available.map((badge, index) => {
                const isEarned = safeBadges.earned.includes(badge.id);
                return (
                  <div 
                    key={badge.id}
                    className={`relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                      isEarned 
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-lg' 
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {isEarned && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isEarned 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg' 
                        : 'bg-white/10'
                    }`}>
                      {badge.id === 'scholar' && <BookOpen className={`w-8 h-8 ${isEarned ? 'text-white' : 'text-white/50'}`} />}
                      {badge.id === 'speedster' && <Zap className={`w-8 h-8 ${isEarned ? 'text-white' : 'text-white/50'}`} />}
                      {badge.id === 'perfectionist' && <Star className={`w-8 h-8 ${isEarned ? 'text-white' : 'text-white/50'}`} />}
                      {badge.id === 'streaker' && <Flame className={`w-8 h-8 ${isEarned ? 'text-white' : 'text-white/50'}`} />}
                      {badge.id === 'quiz-master' && <Crown className={`w-8 h-8 ${isEarned ? 'text-white' : 'text-white/50'}`} />}
                      {!['scholar', 'speedster', 'perfectionist', 'streaker', 'quiz-master'].includes(badge.id) && 
                        <Medal className={`w-8 h-8 ${isEarned ? 'text-white' : 'text-white/50'}`} />
                      }
                    </div>
                    
                    <div className="text-center">
                      <h4 className={`font-bold mb-1 ${isEarned ? 'text-white' : 'text-white/70'}`}>
                        {badge.name}
                      </h4>
                      <p className={`text-sm mb-2 ${isEarned ? 'text-gray-300' : 'text-white/50'}`}>
                        {badge.description}
                      </p>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        isEarned 
                          ? 'bg-yellow-400/20 text-yellow-300' 
                          : 'bg-white/10 text-white/50'
                      }`}>
                        <Coins className="w-3 h-3" />
                        <span>{badge.points} pts</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border border-white/20 rounded-3xl text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block text-gray-300">Theme Preference</label>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'system'].map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() => setTheme(themeOption as any)}
                      className={`p-3 rounded-xl font-medium transition-all duration-300 ${
                        theme === themeOption
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/20 pt-6">
                <h3 className="font-medium mb-4 flex items-center space-x-2 text-white">
                  <Shield className="w-5 h-5" />
                  <span>Data Management</span>
                </h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={exportData} 
                    className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-red-500/20 border-red-400/50 text-red-300 hover:bg-red-500/30"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gradient-to-br from-slate-900/95 to-red-900/95 backdrop-blur-xl border border-red-400/50 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Reset All Data</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          This action cannot be undone. This will permanently delete all your progress, quiz history, and achievements.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleResetData} 
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white"
                        >
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

        {/* Edit Profile Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border border-white/20 rounded-3xl text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={editedProfile.name}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full Name"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
              />
              <Input
                value={editedProfile.email}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                type="email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={editedProfile.class}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, class: e.target.value }))}
                  placeholder="Class"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                />
                <Input
                  value={editedProfile.school}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, school: e.target.value }))}
                  placeholder="School"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button onClick={handleSaveProfile} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
