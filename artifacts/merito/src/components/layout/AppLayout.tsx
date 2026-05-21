import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Search, 
  Home, 
  Award, 
  Star, 
  LogOut,
  User as UserIcon,
  LayoutDashboard
} from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col">
        <header className="border-b bg-card h-16 flex items-center px-6 justify-between shrink-0">
          <Link href="/" className="font-bold text-xl text-primary tracking-tight">MÉRITO</Link>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost">Log in</Button></Link>
            <Link href="/register"><Button>Sign up</Button></Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  const isStudent = user.role === "student";

  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col shrink-0 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <Link href={isStudent ? "/dashboard" : "/recruiter/search"} className="font-bold text-xl text-sidebar-primary tracking-tight">
            MÉRITO
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {isStudent ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm font-medium">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link href={`/profile/${user.id}`} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm font-medium">
                <UserIcon size={18} /> My Profile
              </Link>
              <Link href="/projects" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm font-medium">
                <Briefcase size={18} /> Projects
              </Link>
              <Link href="/skills" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm font-medium">
                <Star size={18} /> Skills
              </Link>
              <Link href="/sar" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm font-medium">
                <Award size={18} /> SAR Experiences
              </Link>
              <Link href="/microprojects" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm font-medium">
                <Search size={18} /> Microprojects
              </Link>
            </>
          ) : (
            <>
              <Link href="/recruiter/search" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm font-medium">
                <Search size={18} /> Talent Search
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-sidebar-border shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/20 hover:text-destructive transition-colors text-sm font-medium text-sidebar-foreground/80"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="h-14 border-b bg-card flex items-center px-4 md:hidden shrink-0">
          <Link href={isStudent ? "/dashboard" : "/recruiter/search"} className="font-bold text-lg text-primary">MÉRITO</Link>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut size={18} />
            </Button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto bg-gray-50/50 p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
