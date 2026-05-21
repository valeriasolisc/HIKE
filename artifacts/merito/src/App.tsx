import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/components/auth-provider";
import { useAuth } from "@/hooks/use-auth";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import RecruiterSearch from "@/pages/RecruiterSearch";
import Projects from "@/pages/Projects";
import NewProject from "@/pages/NewProject";
import ProjectDetail from "@/pages/ProjectDetail";
import Sar from "@/pages/Sar";
import NewSar from "@/pages/NewSar";
import Skills from "@/pages/Skills";
import Microprojects from "@/pages/Microprojects";
import MicroprojectDetail from "@/pages/MicroprojectDetail";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, allowedRoles, layout = true }: { component: React.ComponentType<any>, allowedRoles?: string[], layout?: boolean }) {
  const { user, isLoaded } = useAuth();
  
  if (!isLoaded) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) {
    window.location.href = "/login";
    return null;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-8 text-center text-lg mt-10">Unauthorized: You do not have permission to view this page.</div>;
  }

  const Content = <Component />;
  return layout ? <AppLayout>{Content}</AppLayout> : Content;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Student Routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} allowedRoles={["student"]} />}
      </Route>
      <Route path="/projects">
        {() => <ProtectedRoute component={Projects} allowedRoles={["student"]} />}
      </Route>
      <Route path="/projects/new">
        {() => <ProtectedRoute component={NewProject} allowedRoles={["student"]} />}
      </Route>
      <Route path="/projects/:id">
        {() => <ProtectedRoute component={ProjectDetail} allowedRoles={["student"]} />}
      </Route>
      <Route path="/sar">
        {() => <ProtectedRoute component={Sar} allowedRoles={["student"]} />}
      </Route>
      <Route path="/sar/new">
        {() => <ProtectedRoute component={NewSar} allowedRoles={["student"]} />}
      </Route>
      <Route path="/skills">
        {() => <ProtectedRoute component={Skills} allowedRoles={["student"]} />}
      </Route>
      <Route path="/microprojects">
        {() => <ProtectedRoute component={Microprojects} allowedRoles={["student"]} />}
      </Route>
      <Route path="/microprojects/:id">
        {() => <ProtectedRoute component={MicroprojectDetail} allowedRoles={["student"]} />}
      </Route>
      
      {/* Recruiter Routes */}
      <Route path="/recruiter/search">
        {() => <ProtectedRoute component={RecruiterSearch} allowedRoles={["recruiter"]} />}
      </Route>
      
      {/* Shared/Public Profile */}
      <Route path="/profile/:userId">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      
      <Route path="/:rest*">
        {() => (
          <AppLayout>
            <NotFound />
          </AppLayout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
