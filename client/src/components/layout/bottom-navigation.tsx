
import { Home, MessageCircle, Trophy, User, Brain, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: Brain, label: "Quiz", path: "/quiz" },
  { path: "/reasoning", icon: Brain, label: "Reasoning" },
  { path: "/leaderboard", icon: Crown, label: "Leaderboard" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md modern-card border-t border-border z-50">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 font-body text-xs font-medium",
                isActive 
                  ? "text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 scale-110" 
                  : "text-purple-200 hover:text-white hover:bg-white/10 hover:scale-105"
              )}
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
