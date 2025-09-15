
import { useTheme } from "@/lib/theme";
import { Moon, Sun, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 modern-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <GraduationCap className="text-white h-7 w-7" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">EduLearn</h1>
          <p className="text-xs text-purple-200 font-body">Smart Learning Platform</p>
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
