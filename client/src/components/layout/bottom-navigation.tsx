
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
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md neon-card border-t border-primary/20 backdrop-blur-xl">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 font-body text-xs font-medium",
                isActive 
                  ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,255,136,0.3)] scale-110" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5 hover:scale-105"
              )}
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]")} />
              <span className={cn(isActive && "text-neon")}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
