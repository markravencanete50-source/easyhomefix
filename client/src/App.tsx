import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/AppLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import TicketList from "./pages/TicketList";
import TicketDetail from "./pages/TicketDetail";
import SubmitTicket from "./pages/SubmitTicket";
import JobList from "./pages/JobList";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Notifications from "./pages/Notifications";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import Home from "./pages/Home";

function AppRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/tickets" component={TicketList} />
        <Route path="/tickets/new" component={SubmitTicket} />
        <Route path="/tickets/:id" component={TicketDetail} />
        <Route path="/jobs" component={JobList} />
        <Route path="/properties" component={Properties} />
        <Route path="/properties/:id" component={PropertyDetail} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppRoutes />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
