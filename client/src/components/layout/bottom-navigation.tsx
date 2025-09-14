import { Home, MessageCircle, Brain, Lightbulb, User } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: Brain, label: "Quiz", path: "/quiz" },
  { icon: Lightbulb, label: "Reasoning", path: "/reasoning" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => setLocation(path)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors",
              location === path && "text-primary"
            )}
            data-testid={`nav-${label.toLowerCase()}`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
