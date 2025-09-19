
import { Home, MessageCircle, Trophy, User, Brain, Crown, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/", color: "text-blue-400" },
  { icon: MessageCircle, label: "Chat", path: "/chat", color: "text-green-400" },
  { icon: Brain, label: "Quiz", path: "/quiz", color: "text-purple-400" },
  { path: "/reasoning", icon: Zap, label: "Reason", color: "text-yellow-400" },
  { path: "/leaderboard", icon: Crown, label: "Leaders", color: "text-orange-400" },
  { path: "/profile", icon: User, label: "Profile", color: "text-pink-400" },
];

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <div className="mt-8 p-4">
      <nav className="mx-auto max-w-md premium-nav rounded-2xl border border-border/50 animate-slide-up">
        <div className="flex items-center justify-around py-3 px-2">
          {navItems.map(({ icon: Icon, label, path, color }) => {
            const isActive = location === path;
            return (
              <button
                key={path}
                onClick={() => setLocation(path)}
                className={cn(
                  "relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 font-medium text-xs group",
                  isActive 
                    ? "text-white bg-gradient-to-r from-primary via-accent to-pink-500 shadow-lg shadow-primary/30 scale-110 animate-pulse-glow" 
                    : "text-foreground-tertiary hover:text-foreground hover:bg-surface hover:scale-105"
                )}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <div className="relative">
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-white" : color
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium tracking-wide transition-all duration-300",
                  isActive ? "text-white font-semibold" : "text-foreground-tertiary group-hover:text-foreground"
                )}>
                  {label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Navigation glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-pink-500/10 opacity-50 blur-xl -z-10" />
      </nav>
    </div>
  );
}
