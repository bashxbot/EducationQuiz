import { useTheme } from "@/lib/theme";
import { Moon, Sun, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <GraduationCap className="text-primary-foreground h-5 w-5" />
        </div>
        <h1 className="font-semibold text-lg">EduChat</h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        data-testid="button-theme-toggle"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  );
}
