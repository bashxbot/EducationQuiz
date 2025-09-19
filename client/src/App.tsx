
import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { AchievementProvider } from "@/providers/AchievementProvider";
import { useUserProfile } from "@/hooks/use-app-storage";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Quiz from "@/pages/quiz";
import Reasoning from "@/pages/reasoning";
import Profile from "@/pages/profile";
import Leaderboard from "@/pages/leaderboard";
import Welcome from "@/pages/welcome";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <div className="animate-fade-in">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/chat" component={Chat} />
        <Route path="/quiz" component={Quiz} />
        <Route path="/reasoning" component={Reasoning} />
        <Route path="/profile" component={Profile} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function Router() {
  const { profile } = useUserProfile();

  // Show welcome screen if user is not authenticated
  if (!profile?.isAuthenticated) {
    return <Welcome />;
  }

  return <AuthenticatedApp />;
}

function App() {
  const { profile } = useUserProfile();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="eduapp-theme">
        <AchievementProvider>
          <TooltipProvider>
            {profile?.isAuthenticated ? (
              <div className="flex flex-col min-h-screen max-w-md mx-auto relative overflow-hidden">
                {/* App background with noise texture */}
                <div className="fixed inset-0 bg-noise opacity-20 pointer-events-none" />

                {/* Main app container */}
                <div className="relative z-10 flex flex-col min-h-screen w-full">
                  <Header />

                  <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
                    <div className="w-full min-h-full pb-24">
                      <Router />
                    </div>
                  </main>

                  <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
                    <BottomNavigation />
                  </div>
                </div>

                {/* Ambient lighting effects */}
                <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-full h-64 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />
              </div>
            ) : (
              <Router />
            )}

            <Toaster />
          </TooltipProvider>
        </AchievementProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
