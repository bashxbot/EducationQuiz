
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Trophy, Medal, Crown, Target, Zap, Calendar, Filter, Users } from 'lucide-react';
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
  change: number; // rank change from last period
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
  },
  {
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
  }
];

// Add more mock entries
for (let i = 4; i <= 50; i++) {
  if (i === 24) continue; // Skip demo-user position
  mockLeaderboard.push({
    id: `user-${i}`,
    name: `Student ${i}`,
    class: 'Class 10',
    school: 'Various Schools',
    totalPoints: Math.max(2650 - (i * 50) + Math.random() * 100, 500),
    accuracy: Math.floor(Math.random() * 30 + 70),
    streak: Math.floor(Math.random() * 20),
    badges: Math.floor(Math.random() * 15),
    rank: i <= 23 ? i : i + 1,
    change: Math.floor(Math.random() * 6) - 3
  });
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('global');
  const [filters, setFilters] = useState<LeaderboardFilters>({
    subject: 'All Subjects',
    timeframe: 'all-time',
    scope: 'global'
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const { profile } = useUserProfile();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium">#{rank}</span>;
    }
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <span className="text-green-600 text-xs">↑{change}</span>;
    if (change < 0) return <span className="text-red-600 text-xs">↓{Math.abs(change)}</span>;
    return <span className="text-gray-500 text-xs">-</span>;
  };

  const getTopThree = () => leaderboard.slice(0, 3);
  const getRestOfLeaderboard = () => leaderboard.slice(3);

  const getCurrentUserEntry = () => 
    leaderboard.find(entry => entry.id === 'demo-user');

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
    // In a real app, this would fetch filtered data from the API
    // For now, we'll just randomize the order slightly to simulate filtering
    const shuffled = [...mockLeaderboard].sort(() => Math.random() - 0.5);
    setLeaderboard(shuffled);
  };

  const challengeUser = (userId: string) => {
    // In a real app, this would send a challenge request
    console.log('Challenging user:', userId);
  };

  const viewProfile = (userId: string) => {
    // In a real app, this would navigate to user profile
    console.log('Viewing profile:', userId);
  };

  const TopThreeDisplay = () => {
    const topThree = getTopThree();
    
    return (
      <div className="flex justify-center items-end gap-4 mb-6 p-4">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="text-center">
            <div className="relative mb-2">
              <div className="w-16 h-20 bg-gray-200 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-lg font-bold text-gray-600">2</span>
              </div>
              <Avatar className="w-12 h-12 mx-auto -mt-6 ring-2 ring-white">
                <AvatarFallback>{topThree[1].name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <h3 className="font-medium text-sm">{topThree[1].name}</h3>
            <p className="text-xs text-muted-foreground">{topThree[1].totalPoints} pts</p>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="text-center">
            <div className="relative mb-2">
              <div className="w-16 h-24 bg-yellow-400 rounded-t-lg flex items-end justify-center pb-2">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <Avatar className="w-14 h-14 mx-auto -mt-7 ring-2 ring-yellow-400">
                <AvatarFallback>{topThree[0].name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <h3 className="font-medium text-sm">{topThree[0].name}</h3>
            <p className="text-xs text-muted-foreground">{topThree[0].totalPoints} pts</p>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="text-center">
            <div className="relative mb-2">
              <div className="w-16 h-16 bg-amber-600 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-lg font-bold text-white">3</span>
              </div>
              <Avatar className="w-12 h-12 mx-auto -mt-6 ring-2 ring-white">
                <AvatarFallback>{topThree[2].name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <h3 className="font-medium text-sm">{topThree[2].name}</h3>
            <p className="text-xs text-muted-foreground">{topThree[2].totalPoints} pts</p>
          </div>
        )}
      </div>
    );
  };

  const LeaderboardEntry = ({ entry, showActions = false }: { entry: LeaderboardEntry; showActions?: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      entry.id === 'demo-user' ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-8 flex justify-center">
          {getRankIcon(entry.rank)}
        </div>
        <Avatar className="w-10 h-10">
          <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">{entry.name}</h3>
            {entry.id === 'demo-user' && <Badge variant="secondary" className="text-xs">You</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">{entry.class} • {entry.school}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{entry.totalPoints}</span>
            <Trophy className="h-3 w-3 text-yellow-500" />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            {entry.accuracy}%
            <Zap className="h-3 w-3 ml-1" />
            {entry.streak}
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          {getRankChangeIcon(entry.change)}
          {showActions && entry.id !== 'demo-user' && (
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => viewProfile(entry.id)}
              >
                <Users className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => challengeUser(entry.id)}
              >
                <Target className="h-3 w-3" />
              </Button>
            </div>
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
            <Button variant="outline" size="sm" className="premium-button-secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filter Rankings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-2">
        <Select value={filters.subject} onValueChange={(value) => filterLeaderboard({ subject: value })}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.timeframe} onValueChange={(value: any) => filterLeaderboard({ timeframe: value })}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="all-time">All Time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.scope} onValueChange={(value: any) => filterLeaderboard({ scope: value })}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">Global</SelectItem>
            <SelectItem value="school">My School</SelectItem>
            <SelectItem value="class">My Class</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          {/* Top 3 Podium */}
          <Card>
            <CardContent className="p-4">
              <TopThreeDisplay />
            </CardContent>
          </Card>

          {/* Rest of leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rankings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getRestOfLeaderboard().slice(0, 20).map(entry => (
                <LeaderboardEntry key={entry.id} entry={entry} showActions={true} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nearby" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Users Near Your Rank</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getNearbyUsers().map(entry => (
                <LeaderboardEntry key={entry.id} entry={entry} showActions={true} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Friends Leaderboard</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaderboardEntry entry={getCurrentUserEntry()!} />
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">{getCurrentUserEntry()?.badges}</div>
                  <div className="text-xs text-muted-foreground">Badges</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{getCurrentUserEntry()?.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{getCurrentUserEntry()?.streak}</div>
                  <div className="text-xs text-muted-foreground">Streak</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
