import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/Login";
import MasterLogin from "@/pages/MasterLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import MasterDashboard from "@/pages/MasterDashboard";
import StudentPortal from "@/pages/StudentPortal";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: string | string[] }) {
  const userRole = localStorage.getItem('userRole');

  if (!userRole) {
    return <Redirect to="/" />;
  }

  const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  if (!roles.includes(userRole)) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/admin">
        <ProtectedRoute allowedRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/master" component={MasterLogin} />
      <Route path="/master-dashboard">
        <ProtectedRoute allowedRole="master">
          <MasterDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/student">
        <ProtectedRoute allowedRole="student">
          <StudentPortal />
        </ProtectedRoute>
      </Route>
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