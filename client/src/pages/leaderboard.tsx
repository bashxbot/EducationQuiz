
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Crown, Target, Flame, Star, Users, Globe, School, Calendar, Filter, Zap, Award } from "lucide-react";
import { useQuizHistory, useUserProfile } from "@/hooks/use-app-storage";

interface LeaderboardUser {
  id: string;
  name: string;
  class: string;
  school: string;
  totalPoints: number;
  averageScore: number;
  quizCount: number;
  streak: number;
  badges: number;
  rank: number;
  region?: string;
}

interface Challenge {
  id: string;
  fromUser: string;
  toUser: string;
  subject: string;
  status: 'pending' | 'accepted' | 'completed';
  createdAt: string;
}

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("global");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  const { profile } = useUserProfile();
  const { history, getAverageScore, getSubjectStats } = useQuizHistory();

  // Generate mock leaderboard data based on current user
  const generateLeaderboardData = (): LeaderboardUser[] => {
    const currentUser: LeaderboardUser = {
      id: profile.id,
      name: profile.name,
      class: profile.class,
      school: profile.school,
      totalPoints: profile.totalPoints,
      averageScore: getAverageScore(),
      quizCount: history.length,
      streak: profile.currentStreak,
      badges: 3, // Mock badge count
      rank: Math.max(1, Math.floor(Math.random() * 50) + 1),
      region: "Your Region",
    };

    // Generate mock users around current user's rank
    const mockUsers: LeaderboardUser[] = [];
    for (let i = 1; i <= 100; i++) {
      if (i === currentUser.rank) {
        mockUsers.push(currentUser);
        continue;
      }

      const mockUser: LeaderboardUser = {
        id: `user_${i}`,
        name: `Student ${i}`,
        class: ["Class 10", "Class 11", "Class 12"][Math.floor(Math.random() * 3)],
        school: `School ${Math.floor(Math.random() * 20) + 1}`,
        totalPoints: Math.max(0, currentUser.totalPoints + (currentUser.rank - i) * 50 + Math.floor(Math.random() * 100)),
        averageScore: Math.min(100, Math.max(60, currentUser.averageScore + Math.floor(Math.random() * 20) - 10)),
        quizCount: Math.max(1, currentUser.quizCount + Math.floor(Math.random() * 10) - 5),
        streak: Math.max(0, currentUser.streak + Math.floor(Math.random() * 5) - 2),
        badges: Math.floor(Math.random() * 8),
        rank: i,
        region: ["North", "South", "East", "West", "Central"][Math.floor(Math.random() * 5)],
      };
      mockUsers.push(mockUser);
    }

    return mockUsers.sort((a, b) => a.rank - b.rank);
  };

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    setLeaderboardData(generateLeaderboardData());
  }, [profile, history]);

  const filterData = (data: LeaderboardUser[]) => {
    let filtered = [...data];

    if (selectedTab === "class") {
      filtered = filtered.filter(user => user.class === profile.class);
    } else if (selectedTab === "school") {
      filtered = filtered.filter(user => user.school === profile.school);
    } else if (selectedTab === "regional") {
      filtered = filtered.filter(user => user.region === "Your Region");
    }

    return filtered.slice(0, 50); // Show top 50
  };

  const getCurrentUserRank = () => {
    const filtered = filterData(leaderboardData);
    return filtered.findIndex(user => user.id === profile.id) + 1;
  };

  const sendChallenge = (toUserId: string) => {
    const newChallenge: Challenge = {
      id: `challenge_${Date.now()}`,
      fromUser: profile.id,
      toUser: toUserId,
      subject: "Mathematics", // Default subject
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setChallenges(prev => [...prev, newChallenge]);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return "text-red-500";
    if (streak >= 3) return "text-orange-500";
    return "text-gray-500";
  };

  const filteredData = filterData(leaderboardData);
  const currentUserRank = getCurrentUserRank();
  const userRankData = filteredData.find(user => user.id === profile.id);

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Leaderboard</h2>
        <p className="text-muted-foreground">Compete with students worldwide</p>
      </div>

      {/* Current User Rank Card */}
      {userRankData && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">Your Current Rank</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  {getRankIcon(currentUserRank)}
                  <span className="text-lg font-bold">#{currentUserRank}</span>
                </div>
                <p className="text-sm text-muted-foreground">{userRankData.totalPoints} points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="daily">Today</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global" className="text-xs">
            <Globe className="h-4 w-4 mr-1" />
            Global
          </TabsTrigger>
          <TabsTrigger value="regional" className="text-xs">
            <Users className="h-4 w-4 mr-1" />
            Regional
          </TabsTrigger>
          <TabsTrigger value="class" className="text-xs">
            <School className="h-4 w-4 mr-1" />
            Class
          </TabsTrigger>
          <TabsTrigger value="school" className="text-xs">
            <Trophy className="h-4 w-4 mr-1" />
            School
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {/* Top 3 Podium */}
          {filteredData.length >= 3 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-end justify-center gap-4">
                  {/* 2nd Place */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <Medal className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-sm font-medium">{filteredData[1].name}</div>
                    <div className="text-xs text-muted-foreground">{filteredData[1].totalPoints} pts</div>
                  </div>

                  {/* 1st Place */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <Crown className="h-10 w-10 text-yellow-500" />
                    </div>
                    <div className="font-bold">{filteredData[0].name}</div>
                    <div className="text-sm text-muted-foreground">{filteredData[0].totalPoints} pts</div>
                    <Badge className="mt-1">Champion</Badge>
                  </div>

                  {/* 3rd Place */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <Medal className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="text-sm font-medium">{filteredData[2].name}</div>
                    <div className="text-xs text-muted-foreground">{filteredData[2].totalPoints} pts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rankings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredData.slice(3).map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                      user.id === profile.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center">
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.class} • {user.school}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{user.totalPoints}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{user.averageScore}%</div>
                        <div className="text-xs text-muted-foreground">avg</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className={`h-4 w-4 ${getStreakColor(user.streak)}`} />
                        <span className="text-sm font-medium">{user.streak}</span>
                      </div>
                      {user.id !== profile.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendChallenge(user.id)}
                          className="text-xs"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Challenge
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Active Challenges */}
      {challenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {challenges.slice(0, 3).map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      Challenge sent to Student {challenge.toUser.slice(-1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Subject: {challenge.subject} • {new Date(challenge.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={challenge.status === 'pending' ? 'secondary' : 'default'}>
                    {challenge.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-sm text-green-800 dark:text-green-200">
                  Moved up 3 ranks this week!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Keep up the great work
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Flame className="h-6 w-6 text-orange-500" />
              <div>
                <p className="font-medium text-sm text-blue-800 dark:text-blue-200">
                  {profile.currentStreak} day learning streak
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Don't break the chain!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
