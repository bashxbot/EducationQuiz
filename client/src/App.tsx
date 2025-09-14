import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { AchievementProvider } from "@/providers/AchievementProvider";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Quiz from "@/pages/quiz";
import Reasoning from "@/pages/reasoning";
import Profile from "@/pages/profile";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/chat" component={Chat} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/reasoning" component={Reasoning} />
      <Route path="/profile" component={Profile} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="eduapp-theme">
        <AchievementProvider>
          <TooltipProvider>
          <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
            <Header />
            <main className="flex-1 overflow-hidden">
              <Router />
            </main>
            <BottomNavigation />
          </div>
          <Toaster />
          </TooltipProvider>
        </AchievementProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;