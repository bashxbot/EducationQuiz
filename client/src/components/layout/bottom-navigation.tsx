
import React from 'react';
import { useLocation } from 'wouter';
import { Home, MessageSquare, Trophy, Users, Brain, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/', gradient: 'from-purple-400 to-pink-400' },
  { icon: MessageSquare, label: 'Chat', path: '/chat', gradient: 'from-blue-400 to-cyan-400' },
  { icon: Trophy, label: 'Quiz', path: '/quiz', gradient: 'from-yellow-400 to-orange-400' },
  { icon: Brain, label: 'Reasoning', path: '/reasoning', gradient: 'from-green-400 to-emerald-400' },
  { icon: Users, label: 'Leaderboard', path: '/leaderboard', gradient: 'from-red-400 to-pink-400' },
  { icon: User, label: 'Profile', path: '/profile', gradient: 'from-indigo-400 to-purple-400' },
];

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="mx-4 mb-4">
        <div className="bg-gradient-to-r from-black/40 via-black/30 to-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 animate-gradient"></div>
          
          <div className="relative flex items-center justify-around px-2 py-3">
            {navItems.map(({ icon: Icon, label, path, gradient }) => {
              const isActive = location === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all duration-300 relative group ${
                    isActive 
                      ? 'scale-110' 
                      : 'hover:scale-105 hover:bg-white/10'
                  }`}
                >
                  {/* Active background glow */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl opacity-20 blur-sm`}></div>
                  )}
                  
                  {/* Icon container */}
                  <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-r ${gradient} shadow-lg` 
                      : 'bg-white/10 group-hover:bg-white/20'
                  }`}>
                    <Icon className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-white scale-110' : 'text-white/70 group-hover:text-white'
                    }`} />
                  </div>
                  
                  {/* Label */}
                  <span className={`text-xs font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-white font-semibold font-display' 
                      : 'text-white/70 group-hover:text-white'
                  }`}>
                    {label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r ${gradient} rounded-full animate-pulse`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
