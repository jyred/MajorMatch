import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Assessment from "@/pages/assessment";
import Results from "@/pages/results";
import Chat from "@/pages/chat";
import RiasecInfo from "@/pages/riasec-info";
import Help from "@/pages/help";
import Privacy from "@/pages/privacy";
import Login from "@/pages/login";
import Register from "@/pages/register";
import SatisfactionSurvey from "@/pages/satisfaction-survey";
import Profile from "@/pages/profile";

import Navigation from "@/components/navigation";
import { FloatingChatButton } from "@/components/floating-chat-button";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/results/:id?" component={Results} />
      <Route path="/satisfaction-survey/:assessmentId" component={SatisfactionSurvey} />
      <Route path="/chat" component={Chat} />
      <Route path="/profile" component={Profile} />

      <Route path="/riasec-info" component={RiasecInfo} />
      <Route path="/help" component={Help} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="riasec-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <Navigation />
            <Toaster />
            <Router />
            <FloatingChatButton />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
