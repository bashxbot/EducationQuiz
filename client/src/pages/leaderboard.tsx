
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Trophy, Medal, Crown, Target, Zap, Calendar, Filter, Users, User, Star, TrendingUp, Award, Settings } from 'lucide-react';
import { useUserProfile } from '../hooks/use-app-storage';

interface LeaderboardEntry {
  id: string;
  name: string;
  class: string;
  school: string;
  totalPoints: number;
  accuracy: number;
  streak: number;
  badges: number;
  rank: number;
  change: number;
}

interface LeaderboardFilters {
  subject: string;
  timeframe: 'weekly' | 'monthly' | 'all-time';
  scope: 'global' | 'school' | 'class';
}

const subjects = [
  'All Subjects', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'English', 'History', 'Geography'
];

// Mock leaderboard data with updated profile sync
const createMockLeaderboard = (userProfile: any): LeaderboardEntry[] => {
  const baseData: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      class: 'Class 10',
      school: 'Delhi Public School',
      totalPoints: 2850,
      accuracy: 94,
      streak: 15,
      badges: 12,
      rank: 1,
      change: 0
    },
    {
      id: '2',
      name: 'Arjun Patel',
      class: 'Class 10',
      school: 'Kendriya Vidyalaya',
      totalPoints: 2720,
      accuracy: 91,
      streak: 8,
      badges: 10,
      rank: 2,
      change: 1
    },
    {
      id: '3',
      name: 'Sneha Gupta',
      class: 'Class 10',
      school: 'St. Mary\'s School',
      totalPoints: 2680,
      accuracy: 89,
      streak: 12,
      badges: 9,
      rank: 3,
      change: -1
    }
  ];

  // Generate additional entries
  for (let i = 4; i <= 100; i++) {
    if (i === 24) {
      baseData.push({
        id: 'demo-user',
        name: userProfile?.name || 'Alex Kumar',
        class: userProfile?.class || 'Class 10',
        school: userProfile?.school || 'Excellence High School',
        totalPoints: userProfile?.totalPoints || 1240,
        accuracy: 85,
        streak: userProfile?.currentStreak || 7,
        badges: 5,
        rank: 24,
        change: 3
      });
    } else {
      baseData.push({
        id: `user-${i}`,
        name: `Student ${i}`,
        class: `Class ${8 + Math.floor(Math.random() * 5)}`,
        school: 'Various Schools',
        totalPoints: Math.max(2650 - (i * 25) + Math.random() * 100, 500),
        accuracy: Math.floor(Math.random() * 30 + 70),
        streak: Math.floor(Math.random() * 20),
        badges: Math.floor(Math.random() * 15),
        rank: i <= 23 ? i : i + 1,
        change: Math.floor(Math.random() * 6) - 3
      });
    }
  }

  return baseData.sort((a, b) => a.rank - b.rank);
};

export default function Leaderboard() {
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState('global');
  const [filters, setFilters] = useState<LeaderboardFilters>({
    subject: 'All Subjects',
    timeframe: 'all-time',
    scope: 'global'
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => createMockLeaderboard(profile));
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync leaderboard with profile updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const updatedProfile = event.detail;
      setLeaderboard(prev => prev.map(entry => 
        entry.id === 'demo-user' 
          ? { 
              ...entry, 
              name: updatedProfile.name, 
              class: updatedProfile.class, 
              school: updatedProfile.school,
              totalPoints: updatedProfile.totalPoints,
              streak: updatedProfile.currentStreak
            }
          : entry
      ));
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
  }, []);

  // Update leaderboard when profile changes
  useEffect(() => {
    if (profile) {
      setLeaderboard(createMockLeaderboard(profile));
    }
  }, [profile]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-bold">{rank}</span>
          </div>
        );
    }
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <span className="text-green-600 text-xs flex items-center"><TrendingUp className="h-3 w-3 mr-1" />+{change}</span>;
    if (change < 0) return <span className="text-red-600 text-xs flex items-center"><TrendingUp className="h-3 w-3 mr-1 rotate-180" />{change}</span>;
    return <span className="text-muted-foreground text-xs">-</span>;
  };

  const getTopThree = () => leaderboard.slice(0, 3);
  const getCurrentUserEntry = () => leaderboard.find(entry => entry.id === 'demo-user');
  const getNearbyUsers = () => {
    const userEntry = getCurrentUserEntry();
    if (!userEntry) return [];
    
    const userRank = userEntry.rank;
    const startRank = Math.max(1, userRank - 2);
    const endRank = Math.min(leaderboard.length, userRank + 2);
    
    return leaderboard.filter(entry => 
      entry.rank >= startRank && entry.rank <= endRank
    ).sort((a, b) => a.rank - b.rank);
  };

  const applyFilters = async (newFilters: Partial<LeaderboardFilters>) => {
    setIsLoading(true);
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create filtered data based on current profile
    const filteredData = createMockLeaderboard(profile);
    
    // Apply some filtering logic for demonstration
    if (newFilters.scope === 'school' && profile?.school) {
      const schoolData = filteredData.filter(entry => 
        entry.school === profile.school || entry.id === 'demo-user'
      );
      setLeaderboard(schoolData);
    } else if (newFilters.scope === 'class' && profile?.class) {
      const classData = filteredData.filter(entry => 
        entry.class === profile.class || entry.id === 'demo-user'
      );
      setLeaderboard(classData);
    } else {
      setLeaderboard(filteredData);
    }
    
    setIsLoading(false);
    setShowFilters(false);
  };

  const TopThreeDisplay = () => {
    const topThree = getTopThree();
    
    return (
      <div className="flex justify-center items-end gap-6 p-8 bg-gradient-to-br from-background via-surface to-background rounded-xl">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="text-center transform hover:scale-105 transition-transform">
            <div className="relative mb-4">
              <div className="w-20 h-24 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-xl flex items-end justify-center pb-3 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <Avatar className="w-16 h-16 mx-auto -mt-8 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  {topThree[1].name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-xs font-medium">{topThree[1].name}</h3>
            <p className="text-xs text-muted-foreground">{topThree[1].totalPoints.toLocaleString()} pts</p>
            <Badge variant="secondary" className="mt-1 text-xs">{topThree[1].accuracy}%</Badge>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="text-center transform hover:scale-105 transition-transform">
            <div className="relative mb-4">
              <div className="w-24 h-32 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-xl flex items-end justify-center pb-3 shadow-xl animate-pulse-glow">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <Avatar className="w-20 h-20 mx-auto -mt-10 border-4 border-yellow-400 shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-lg">
                  {topThree[0].name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-sm font-medium">{topThree[0].name}</h3>
            <p className="text-xs text-muted-foreground">{topThree[0].totalPoints.toLocaleString()} pts</p>
            <Badge className="mt-1">{topThree[0].accuracy}%</Badge>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="text-center transform hover:scale-105 transition-transform">
            <div className="relative mb-4">
              <div className="w-20 h-20 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-xl flex items-end justify-center pb-3 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <Avatar className="w-16 h-16 mx-auto -mt-8 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold">
                  {topThree[2].name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-xs font-medium">{topThree[2].name}</h3>
            <p className="text-xs text-muted-foreground">{topThree[2].totalPoints.toLocaleString()} pts</p>
            <Badge variant="secondary" className="mt-1 text-xs">{topThree[2].accuracy}%</Badge>
          </div>
        )}
      </div>
    );
  };

  const LeaderboardEntry = ({ entry, showRank = true }: { entry: LeaderboardEntry; showRank?: boolean }) => (
    <div 
      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:bg-surface/50 hover:border-primary/30 hover:shadow-md ${
        entry.id === 'demo-user' ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-card border-border'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {showRank && (
          <div className="w-10 flex justify-center flex-shrink-0">
            {getRankIcon(entry.rank)}
          </div>
        )}
        <Avatar className="w-12 h-12 border-2 border-border flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
            {entry.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-foreground truncate">{entry.name}</h3>
            {entry.id === 'demo-user' && <Badge variant="secondary" className="text-xs">You</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate">{entry.class} • {entry.school}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1 justify-end">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-bold text-foreground">{entry.totalPoints.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground justify-end">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {entry.accuracy}%
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {entry.streak}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {getRankChangeIcon(entry.change)}
          {entry.id !== 'demo-user' && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-primary/10"
              onClick={() => setSelectedProfile(entry)}
            >
              <User className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="premium-container space-y-6">
      {/* Header with Improved Filters */}
      <Card className="premium-card glass-morphism animate-slide-up">
        <CardContent className="p-8">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-primary">Global Leaderboard</h1>
                <p className="text-foreground-secondary">Compete with learners worldwide</p>
              </div>
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      <Card className="premium-card">
        <CardContent className="p-0">
          <TopThreeDisplay />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Global Rankings
          </TabsTrigger>
          <TabsTrigger value="nearby" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Nearby
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Friends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          {/* Main Rankings Container - Fixed Height with Scroll */}
          <Card className="premium-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top 100 Rankings
                </div>
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Filtering...
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t border-border">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 p-6">
                    {leaderboard.slice(0, 100).map((entry, index) => (
                      <LeaderboardEntry key={`${entry.id}-${index}`} entry={entry} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nearby" className="space-y-4">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users Near Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getNearbyUsers().map((entry, index) => (
                <LeaderboardEntry key={`nearby-${entry.id}-${index}`} entry={entry} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Friends Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Friends Yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Connect with classmates and friends to see how you compare! Challenge them to beat your scores.
              </p>
              <Button variant="outline" className="premium-button-secondary">
                <Users className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Current User Stats */}
      {getCurrentUserEntry() && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Your Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LeaderboardEntry entry={getCurrentUserEntry()!} showRank={true} />
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-surface/50 rounded-lg border border-border">
                <div className="text-2xl font-bold text-primary">{getCurrentUserEntry()?.badges}</div>
                <div className="text-xs text-muted-foreground mt-1">Badges Earned</div>
              </div>
              <div className="text-center p-4 bg-surface/50 rounded-lg border border-border">
                <div className="text-2xl font-bold text-green-600">{getCurrentUserEntry()?.accuracy}%</div>
                <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-surface/50 rounded-lg border border-border">
                <div className="text-2xl font-bold text-orange-600">{getCurrentUserEntry()?.streak}</div>
                <div className="text-xs text-muted-foreground mt-1">Day Streak</div>
              </div>
              <div className="text-center p-4 bg-surface/50 rounded-lg border border-border">
                <div className="text-2xl font-bold text-blue-600">#{getCurrentUserEntry()?.rank}</div>
                <div className="text-xs text-muted-foreground mt-1">Global Rank</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="premium-card max-w-md fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Rankings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium block">Subject</label>
              <Select 
                value={filters.subject} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-[200px]" position="popper" sideOffset={4}>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Timeframe</label>
              <Select 
                value={filters.timeframe} 
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, timeframe: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-[200px]" position="popper" sideOffset={4}>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Scope</label>
              <Select 
                value={filters.scope} 
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, scope: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-[200px]" position="popper" sideOffset={4}>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="school">My School</SelectItem>
                  <SelectItem value="class">My Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => applyFilters(filters)}
                disabled={isLoading}
                className="flex-1 premium-button"
              >
                {isLoading ? 'Applying...' : 'Apply Filters'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Profile Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="premium-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                  {selectedProfile?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedProfile?.name}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Rank #{selectedProfile?.rank}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-surface/50 rounded-lg border border-border">
                  <div className="text-xl font-bold text-primary">#{selectedProfile.rank}</div>
                  <div className="text-xs text-muted-foreground mt-1">Global Rank</div>
                </div>
                <div className="text-center p-4 bg-surface/50 rounded-lg border border-border">
                  <div className="text-xl font-bold text-orange-500">{selectedProfile.totalPoints.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total Points</div>
                </div>
                <div className="text-center p-4 bg-surface/50 rounded-lg border border-border">
                  <div className="text-xl font-bold text-green-500">{selectedProfile.accuracy}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-surface/50 rounded-lg border border-border">
                  <div className="text-xl font-bold text-blue-500">{selectedProfile.streak}</div>
                  <div className="text-xs text-muted-foreground mt-1">Day Streak</div>
                </div>
              </div>
              <div className="p-4 bg-surface/50 rounded-lg border border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Class:</span>
                  <span className="font-medium">{selectedProfile.class}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">School:</span>
                  <span className="font-medium">{selectedProfile.school}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Badges:</span>
                  <span className="font-medium">{selectedProfile.badges} earned</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rank Change:</span>
                  <span className={`font-medium ${selectedProfile.change > 0 ? 'text-green-600' : selectedProfile.change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {selectedProfile.change > 0 ? '+' : ''}{selectedProfile.change === 0 ? 'No change' : selectedProfile.change}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
