import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Briefcase, Home, FileText, Target, User, LayoutDashboard, Search, Users, MessageSquare, PlusCircle, Award, LogOut } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const studentLinks = [
    { title: "Inicio", icon: Home, url: "/inicio" },
    { title: "Mi Perfil", icon: User, url: "/mi-perfil" },
    { title: "Proyectos", icon: FileText, url: "/proyectos" },
    { title: "Habilidades", icon: Award, url: "/habilidades" },
    { title: "Experiencias SAR", icon: Target, url: "/experiencias-sar" },
    { title: "Microproyectos", icon: Briefcase, url: "/microproyectos" },
  ];

  const recruiterLinks = [
    { title: "Panel Principal", icon: LayoutDashboard, url: "/panel" },
    { title: "Mis Microproyectos", icon: Briefcase, url: "/mis-microproyectos" },
    { title: "Buscar Talento", icon: Search, url: "/buscar-talento" },
    { title: "Postulaciones", icon: FileText, url: "/postulaciones" },
    { title: "Candidatos Guardados", icon: Users, url: "/candidatos" },
    { title: "Mensajes", icon: MessageSquare, url: "/mensajes" },
  ];

  const links = user?.role === "recruiter" ? recruiterLinks : studentLinks;

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gray-50">
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center px-4 border-b">
            <Link href={user?.role === "recruiter" ? "/panel" : "/inicio"} className="flex items-center gap-2 font-bold text-xl text-primary">
              <img src="/logo.png" alt="HIKE" className="h-8 w-8" />
              HIKE
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {links.map((link) => (
                    <SidebarMenuItem key={link.url}>
                      <SidebarMenuButton asChild isActive={location === link.url}>
                        <Link href={link.url} className="flex items-center gap-3">
                          <link.icon className="h-5 w-5" />
                          <span>{link.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-auto flex flex-col">
          <header className="h-16 border-b bg-white flex items-center px-4 lg:hidden">
            <SidebarTrigger />
            <span className="ml-4 font-bold text-primary">HIKE</span>
          </header>
          <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
