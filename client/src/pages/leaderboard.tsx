
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Trophy, Medal, Crown, Target, Zap, Calendar, Filter, Users, User, Star, TrendingUp, Award } from 'lucide-react';
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

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
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

// Generate more mock entries for demonstration
for (let i = 4; i <= 100; i++) {
  if (i === 24) {
    mockLeaderboard.push({
      id: 'demo-user',
      name: 'Alex Kumar',
      class: 'Class 10',
      school: 'Excellence High School',
      totalPoints: 1240,
      accuracy: 85,
      streak: 7,
      badges: 5,
      rank: 24,
      change: 3
    });
  } else {
    mockLeaderboard.push({
      id: `user-${i}`,
      name: `Student ${i}`,
      class: 'Class 10',
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

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('global');
  const [filters, setFilters] = useState<LeaderboardFilters>({
    subject: 'All Subjects',
    timeframe: 'all-time',
    scope: 'global'
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<LeaderboardEntry | null>(null);
  const { profile } = useUserProfile();

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

  const filterLeaderboard = (newFilters: Partial<LeaderboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Simulate filtering by randomizing slightly
    const shuffled = [...mockLeaderboard].sort(() => Math.random() - 0.5);
    setLeaderboard(shuffled);
  };

  const viewProfile = (entry: LeaderboardEntry) => {
    setSelectedProfile(entry);
  };

  const TopThreeDisplay = () => {
    const topThree = getTopThree();
    
    return (
      <div className="flex justify-center items-end gap-6 p-6 bg-gradient-to-r from-background via-surface to-background rounded-lg">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="text-center">
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
            <h3 className="font-semibold text-sm">{topThree[1].name}</h3>
            <p className="text-xs text-muted-foreground">{topThree[1].totalPoints} pts</p>
            <Badge variant="secondary" className="mt-1">{topThree[1].accuracy}%</Badge>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="text-center">
            <div className="relative mb-4">
              <div className="w-24 h-32 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-xl flex items-end justify-center pb-3 shadow-xl">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <Avatar className="w-20 h-20 mx-auto -mt-10 border-4 border-yellow-400 shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-lg">
                  {topThree[0].name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="font-semibold">{topThree[0].name}</h3>
            <p className="text-sm text-muted-foreground">{topThree[0].totalPoints} pts</p>
            <Badge className="mt-1">{topThree[0].accuracy}%</Badge>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="text-center">
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
            <h3 className="font-semibold text-sm">{topThree[2].name}</h3>
            <p className="text-xs text-muted-foreground">{topThree[2].totalPoints} pts</p>
            <Badge variant="secondary" className="mt-1">{topThree[2].accuracy}%</Badge>
          </div>
        )}
      </div>
    );
  };

  const LeaderboardEntry = ({ entry, showRank = true }: { entry: LeaderboardEntry; showRank?: boolean }) => (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:bg-surface/50 hover:border-primary/30 ${
        entry.id === 'demo-user' ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'
      }`}
    >
      <div className="flex items-center gap-4">
        {showRank && (
          <div className="w-10 flex justify-center">
            {getRankIcon(entry.rank)}
          </div>
        )}
        <Avatar className="w-12 h-12 border-2 border-border">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
            {entry.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{entry.name}</h3>
            {entry.id === 'demo-user' && <Badge variant="secondary" className="text-xs">You</Badge>}
          </div>
          <p className="text-sm text-muted-foreground truncate">{entry.class} • {entry.school}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-bold text-foreground">{entry.totalPoints}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
              className="h-8 w-8 p-0"
              onClick={() => viewProfile(entry)}
            >
              <User className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="premium-container">
      {/* Header */}
      <Card className="premium-card glass-morphism animate-slide-up">
        <CardContent className="p-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-primary">Global Leaderboard</h1>
                <p className="text-foreground-secondary">Compete with learners worldwide</p>
              </div>
            </div>
            <Dialog open={showFilters} onOpenChange={setShowFilters}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="premium-button-secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Rankings
                </Button>
              </DialogTrigger>
              <DialogContent className="premium-card">
                <DialogHeader>
                  <DialogTitle>Filter Rankings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Select value={filters.subject} onValueChange={(value) => filterLeaderboard({ subject: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Time Period</label>
                    <Select value={filters.timeframe} onValueChange={(value: any) => filterLeaderboard({ timeframe: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">This Week</SelectItem>
                        <SelectItem value="monthly">This Month</SelectItem>
                        <SelectItem value="all-time">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Scope</label>
                    <Select value={filters.scope} onValueChange={(value: any) => filterLeaderboard({ scope: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="school">My School</SelectItem>
                        <SelectItem value="class">My Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="global">Global Rankings</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          {/* Rankings Box */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top 100 Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] px-6 pb-6">
                <div className="space-y-2">
                  {leaderboard.slice(0, 100).map((entry, index) => (
                    <LeaderboardEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </ScrollArea>
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
              {getNearbyUsers().map(entry => (
                <LeaderboardEntry key={entry.id} entry={entry} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Friends Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No Friends Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with classmates to see how you compare!
              </p>
              <Button variant="outline">Find Friends</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Current User Stats */}
      {getCurrentUserEntry() && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Your Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeaderboardEntry entry={getCurrentUserEntry()!} showRank={false} />
            <div className="mt-4 p-4 bg-surface/50 rounded-lg border border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-primary">{getCurrentUserEntry()?.badges}</div>
                  <div className="text-xs text-muted-foreground">Badges</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{getCurrentUserEntry()?.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-600">{getCurrentUserEntry()?.streak}</div>
                  <div className="text-xs text-muted-foreground">Streak</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="premium-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                  {selectedProfile?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {selectedProfile?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-surface/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedProfile.rank}</div>
                  <div className="text-sm text-muted-foreground">Rank</div>
                </div>
                <div className="text-center p-3 bg-surface/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">{selectedProfile.totalPoints}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </div>
                <div className="text-center p-3 bg-surface/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{selectedProfile.accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center p-3 bg-surface/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{selectedProfile.streak}</div>
                  <div className="text-sm text-muted-foreground">Streak</div>
                </div>
              </div>
              <div className="p-3 bg-surface/50 rounded-lg">
                <p className="text-sm"><strong>Class:</strong> {selectedProfile.class}</p>
                <p className="text-sm"><strong>School:</strong> {selectedProfile.school}</p>
                <p className="text-sm"><strong>Badges:</strong> {selectedProfile.badges}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
