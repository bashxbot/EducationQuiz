
import { useTheme } from "@/lib/theme";
import { Moon, Sun, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 premium-nav border-b border-border/50 animate-slide-down">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-primary via-accent to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-glow">
              <GraduationCap className="text-white h-7 w-7" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div className="animate-slide-up">
            <h1 className="font-bold text-2xl text-gradient-primary tracking-tight">
              EduLearn
            </h1>
            <p className="text-xs text-foreground-tertiary font-medium tracking-wide">
              Premium Learning Platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="status-indicator status-online">
            <div className="w-3 h-3 bg-success rounded-full"></div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            data-testid="button-theme-toggle"
            className="relative rounded-xl hover:bg-surface border border-border/50 hover:border-border group"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 group-hover:rotate-12 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 group-hover:-rotate-12 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
