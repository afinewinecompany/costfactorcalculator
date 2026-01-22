import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ProjectListPage from "@/pages/project-list";
import CalculatorPage from "@/pages/calculator";
import PresentationPage from "@/pages/presentation";
import ComparisonPage from "@/pages/comparison";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProjectListPage} />
      <Route path="/editor" component={CalculatorPage} />
      <Route path="/presentation" component={PresentationPage} />
      <Route path="/compare" component={ComparisonPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
