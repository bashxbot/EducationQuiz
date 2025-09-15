
import { useTheme } from "@/lib/theme";
import { Moon, Sun, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 modern-card border-b border-border px-4 py-3 flex items-center justify-between backdrop-blur-sm bg-background/95">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
          <GraduationCap className="text-white h-6 w-6" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-xl gradient-text">EduLearn</h1>
          <p className="text-xs text-muted-foreground font-body">Smart Learning Platform</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        data-testid="button-theme-toggle"
        className="hover:bg-primary/10 hover:text-primary"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  );
}
