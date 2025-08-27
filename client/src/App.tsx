import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Messages from "@/pages/messages";
import Comments from "@/pages/comments";
import Upload from "@/pages/upload";
import ConnectSocials from "@/pages/connect-socials";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/messages" component={Messages} />
      <Route path="/comments" component={Comments} />
      <Route path="/upload" component={Upload} />
      <Route path="/connect-socials" component={ConnectSocials} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isMobile = useIsMobile();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground font-sans">
          <AppLayout>
            <Router />
          </AppLayout>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
