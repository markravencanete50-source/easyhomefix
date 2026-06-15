// ============================================================
// FixFlow — App.tsx
// Full routing with auth protection and role-based redirects
// ============================================================

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantRequests from "./pages/tenant/TenantRequests";
import ReportIssue from "./pages/tenant/ReportIssue";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import AllTickets from "./pages/manager/AllTickets";
import Contractors from "./pages/manager/Contractors";
import ContractorDashboard from "./pages/contractor/ContractorDashboard";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/admin/AdminDashboard";

// ─── Protected Route Wrapper ──────────────────────────────────
function ProtectedRoute({
  component: Component,
  allowedRoles,
}: {
  component: React.ComponentType;
  allowedRoles?: string[];
}) {
  const { currentUser, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading FixFlow...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

// ─── Role-based Home Redirect ─────────────────────────────────
function HomeRedirect() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading FixFlow...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  switch (currentUser.role) {
    case 'tenant':
      return <TenantDashboard />;
    case 'property_manager':
      return <ManagerDashboard />;
    case 'contractor':
      return <ContractorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <TenantDashboard />;
  }
}

// ─── Login Route (redirect if already logged in) ──────────────
function LoginRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentUser) {
    return <Redirect to="/" />;
  }

  return <Login />;
}

// ─── Router ───────────────────────────────────────────────────
function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/login" component={LoginRoute} />

      {/* Home — role-based redirect */}
      <Route path="/" component={HomeRedirect} />

      {/* Tenant routes */}
      <Route path="/tenant/requests">
        {() => <ProtectedRoute component={TenantRequests} allowedRoles={['tenant']} />}
      </Route>
      <Route path="/tenant/report">
        {() => <ProtectedRoute component={ReportIssue} allowedRoles={['tenant']} />}
      </Route>

      {/* Manager routes */}
      <Route path="/manager/tickets">
        {() => <ProtectedRoute component={AllTickets} allowedRoles={['property_manager', 'admin']} />}
      </Route>
      <Route path="/manager/contractors">
        {() => <ProtectedRoute component={Contractors} allowedRoles={['property_manager', 'admin']} />}
      </Route>
      <Route path="/manager/properties">
        {() => <ProtectedRoute component={() => {
          const { default: AllTickets } = { default: Contractors }; // placeholder
          return <Contractors />;
        }} allowedRoles={['property_manager', 'admin']} />}
      </Route>
      <Route path="/manager/tenants">
        {() => <ProtectedRoute component={AllTickets} allowedRoles={['property_manager', 'admin']} />}
      </Route>
      <Route path="/manager/analytics">
        {() => <ProtectedRoute component={ManagerDashboard} allowedRoles={['property_manager', 'admin']} />}
      </Route>

      {/* Contractor routes */}
      <Route path="/contractor/jobs">
        {() => <ProtectedRoute component={ContractorDashboard} allowedRoles={['contractor']} />}
      </Route>

      {/* Shared routes */}
      <Route path="/messages">
        {() => <ProtectedRoute component={Messages} allowedRoles={['tenant', 'property_manager', 'contractor']} />}
      </Route>

      {/* Admin routes */}
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={['admin']} />}
      </Route>
      <Route path="/admin/logs">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={['admin']} />}
      </Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// ─── App Root ─────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster richColors position="top-right" />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
