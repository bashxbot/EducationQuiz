
import React from 'react';
import { useLocation } from 'wouter';
import { Home, MessageSquare, Trophy, Users, Brain, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: Trophy, label: 'Quiz', path: '/quiz' },
  { icon: Brain, label: 'Reasoning', path: '/reasoning' },
  { icon: Users, label: 'Leaderboard', path: '/leaderboard' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="glass-card border-t border-border/40 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 hover-lift ${
                  isActive 
                    ? 'bg-primary/20 text-primary neon-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                }`}
              >
                <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isActive ? 'font-display gradient-text' : ''
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
