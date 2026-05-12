import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import MovieDetailPage from "@/pages/MovieDetailPage";
import WatchlistPage from "@/pages/WatchlistPage";
import PremiumPage from "@/pages/PremiumPage";
import AdminPage from "@/pages/AdminPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/movies/:id" component={MovieDetailPage} />
      <Route path="/watchlist" component={WatchlistPage} />
      <Route path="/premium" component={PremiumPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
