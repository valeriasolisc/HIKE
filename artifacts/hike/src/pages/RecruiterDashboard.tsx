import { useGetPlatformStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecruiterDashboard() {
  const { data: stats, isLoading } = useGetPlatformStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel Principal</h1>
        <p className="text-slate-500">Resumen de la plataforma y tu actividad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Candidatos Activos</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalStudents || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Proyectos Subidos</CardTitle>
            <FileText className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalProjects || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Validaciones</CardTitle>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalValidations || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Promedio HikeScore</CardTitle>
            <Star className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.avgScore ? Math.round(stats.avgScore) : 0} HP</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">¿Buscas talento específico?</h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Utiliza nuestro buscador anti-sesgo para encontrar candidatos basándote únicamente en su mérito real (HikeScore y habilidades comprobadas).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
