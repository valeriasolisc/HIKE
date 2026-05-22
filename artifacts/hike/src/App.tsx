import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Onboarding from "@/pages/Onboarding";
import { AppLayout } from "@/components/layout/AppLayout";

// Student
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Projects from "@/pages/Projects";
import Skills from "@/pages/Skills";
import SarExperiences from "@/pages/SarExperiences";
import Microprojects from "@/pages/Microprojects";

// Recruiter
import RecruiterDashboard from "@/pages/RecruiterDashboard";
import RecruiterMicroprojects from "@/pages/RecruiterMicroprojects";
import SearchTalent from "@/pages/SearchTalent";
import Applications from "@/pages/Applications";
import SavedCandidates from "@/pages/SavedCandidates";
import Messages from "@/pages/Messages";

const queryClient = new QueryClient();

function StudentRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/inicio" component={Dashboard} />
        <Route path="/mi-perfil" component={Profile} />
        <Route path="/proyectos" component={Projects} />
        <Route path="/habilidades" component={Skills} />
        <Route path="/experiencias-sar" component={SarExperiences} />
        <Route path="/microproyectos" component={Microprojects} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function RecruiterRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/panel" component={RecruiterDashboard} />
        <Route path="/mis-microproyectos" component={RecruiterMicroprojects} />
        <Route path="/buscar-talento" component={SearchTalent} />
        <Route path="/postulaciones" component={Applications} />
        <Route path="/candidatos" component={SavedCandidates} />
        <Route path="/mensajes" component={Messages} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/registro" component={Register} />
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Grouped Routes */}
      <Route path="/inicio" component={StudentRoutes} />
      <Route path="/mi-perfil" component={StudentRoutes} />
      <Route path="/proyectos" component={StudentRoutes} />
      <Route path="/habilidades" component={StudentRoutes} />
      <Route path="/experiencias-sar" component={StudentRoutes} />
      <Route path="/microproyectos" component={StudentRoutes} />

      <Route path="/panel" component={RecruiterRoutes} />
      <Route path="/mis-microproyectos" component={RecruiterRoutes} />
      <Route path="/buscar-talento" component={RecruiterRoutes} />
      <Route path="/postulaciones" component={RecruiterRoutes} />
      <Route path="/candidatos" component={RecruiterRoutes} />
      <Route path="/mensajes" component={RecruiterRoutes} />
      
      <Route component={NotFound} />
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
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
