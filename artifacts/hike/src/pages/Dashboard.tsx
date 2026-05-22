import { useAuth } from "@/hooks/use-auth";
import { useGetStudentDashboard, useGetScoreBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Code, CheckCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: dashboard, isLoading: isLoadingDash } = useGetStudentDashboard(userId || 0, {
    query: { enabled: !!userId }
  });

  const { data: score, isLoading: isLoadingScore } = useGetScoreBreakdown(userId || 0, {
    query: { enabled: !!userId }
  });

  if (isLoadingDash || isLoadingScore) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[150px] rounded-2xl" />
          <Skeleton className="h-[150px] rounded-2xl" />
          <Skeleton className="h-[150px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const levelColors: Record<string, string> = {
    emerging: "text-slate-500 bg-slate-100",
    developing: "text-blue-600 bg-blue-100",
    proficient: "text-purple-600 bg-purple-100",
    expert: "text-amber-600 bg-amber-100",
  };

  const levelLabels: Record<string, string> = {
    emerging: "Junior",
    developing: "Competitivo",
    proficient: "Destacado",
    expert: "Top Talent",
  };

  const currentLevel = score?.level || "emerging";
  const levelColor = levelColors[currentLevel];
  const levelLabel = levelLabels[currentLevel];
  
  const scoreProgress = score?.nextMilestone 
    ? ((score.totalScore) / score.nextMilestone) * 100 
    : 100;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hola, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-500">Aquí está el resumen de tu perfil profesional.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Card */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/10 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeDasharray={`${scoreProgress * 2.82} 282`}
                    className="text-primary transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute text-center flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-slate-900">{score?.totalScore || 0}</span>
                  <span className="text-xs font-semibold text-primary uppercase">HikePoints</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <Badge className={`${levelColor} hover:${levelColor} border-none px-3 py-1 text-sm font-bold mb-2`}>
                    Nivel: {levelLabel}
                  </Badge>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">¡Estás en racha!</h2>
                  <p className="text-slate-600 text-sm">
                    {score?.nextMilestone 
                      ? `Solo te faltan ${score.nextMilestone - (score.totalScore || 0)} HP para alcanzar el siguiente nivel.` 
                      : "¡Has alcanzado el nivel máximo actual!"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Proyectos</div>
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{score?.projectsScore || 0} HP</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Habilidades</div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold">{score?.skillsScore || 0} HP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Call */}
        <Card className="bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              IA Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Para mejorar tu perfil esta semana, te recomiendo <strong>agregar una experiencia SAR</strong> destacando tus habilidades de liderazgo. Los perfiles con SAR tienen un 40% más de visibilidad.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle className="w-4 h-4 text-green-400" /> Añadir portafolio (Hecho)
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center"></div>
                Crear primera exp. SAR (+50 HP)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Proyectos</div>
              <div className="text-2xl font-bold">{dashboard?.projectCount || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Habilidades</div>
              <div className="text-2xl font-bold">{dashboard?.skillCount || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Validaciones</div>
              <div className="text-2xl font-bold">{dashboard?.validationCount || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
