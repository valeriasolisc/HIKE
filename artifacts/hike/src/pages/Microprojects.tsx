import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListMicroprojects, useApplyMicroproject, getListMicroprojectsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Briefcase, Building, Clock, Trophy, Zap, Star, Users, CheckCircle2, AlertCircle, Send, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const applySchema = z.object({
  proposal: z.string().min(50, "Tu enfoque debe tener al menos 50 caracteres"),
  tools: z.string().min(10, "Menciona al menos una herramienta o tecnología"),
  timeline: z.string().min(10, "Describe tu planificación de tiempo"),
  whyYou: z.string().min(30, "Cuéntanos por qué eres el candidato ideal"),
});

type ApplyValues = z.infer<typeof applySchema>;

const DIFFICULTY_CONFIG = {
  easy: {
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Fácil",
    description: "Ideal para empezar",
  },
  medium: {
    color: "text-amber-700 bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
    label: "Medio",
    description: "Requiere experiencia base",
  },
  hard: {
    color: "text-rose-700 bg-rose-50 border-rose-200",
    dot: "bg-rose-500",
    label: "Difícil",
    description: "Para perfiles avanzados",
  },
};

const STATUS_CONFIG = {
  open: { label: "Abierto", color: "text-emerald-600 bg-emerald-50" },
  reviewing: { label: "En revisión", color: "text-amber-600 bg-amber-50" },
  closed: { label: "Cerrado", color: "text-slate-500 bg-slate-100" },
};

type Microproject = {
  id: number;
  companyName: string;
  title: string;
  description: string;
  requiredSkills: string[];
  difficulty: "easy" | "medium" | "hard";
  duration: string;
  rewardPoints: number;
  status: "open" | "reviewing" | "closed";
  applicantCount: number;
  createdAt: string;
};

export default function Microprojects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Microproject | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  const { data: microprojects, isLoading } = useListMicroprojects();
  const applyMutation = useApplyMicroproject();

  const form = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { proposal: "", tools: "", timeline: "", whyYou: "" },
  });

  const openApply = (project: Microproject) => {
    setSelectedProject(project);
    form.reset();
    setDialogOpen(true);
  };

  const onSubmit = (data: ApplyValues) => {
    if (!selectedProject) return;
    const fullProposal = `ENFOQUE:\n${data.proposal}\n\nHERRAMIENTAS:\n${data.tools}\n\nPLANIFICACIÓN:\n${data.timeline}\n\nPOR QUÉ YO:\n${data.whyYou}`;

    applyMutation.mutate(
      { id: selectedProject.id, data: { proposal: fullProposal } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMicroprojectsQueryKey() });
          setDialogOpen(false);
          setSelectedProject(null);
          form.reset();
          toast({
            title: "Postulación enviada",
            description: `Tu propuesta para "${selectedProject.title}" fue enviada con éxito.`,
          });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo enviar la postulación.", variant: "destructive" });
        },
      }
    );
  };

  const filtered = microprojects?.filter(p =>
    filterDifficulty === "all" || p.difficulty === filterDifficulty
  ) as Microproject[] | undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Microproyectos</h1>
          <p className="text-slate-500 mt-0.5">Resuelve retos reales de empresas y gana HikePoints para destacar.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4" /> Gana hasta 300 HP por reto
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <span className="font-semibold">Sistema de puntuación competitivo:</span> todos los participantes ganan 1 HP por postular.
          Los primeros 3 puestos ganan <strong>300, 150 y 60 HP</strong> respectivamente. Los microproyectos completados quedan como
          experiencia real verificable en tu perfil.
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-500 font-medium mr-1">Dificultad:</span>
        {["all", "easy", "medium", "hard"].map(d => (
          <button
            key={d}
            type="button"
            onClick={() => setFilterDifficulty(d)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              filterDifficulty === d
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-primary/40"
            )}
          >
            {d === "all" ? "Todos" : DIFFICULTY_CONFIG[d as keyof typeof DIFFICULTY_CONFIG].label}
          </button>
        ))}
        {microprojects && (
          <span className="ml-auto text-sm text-slate-400">{filtered?.length || 0} reto{filtered?.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
        ) : !filtered || filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No hay retos disponibles</h3>
            <p className="text-slate-500 mt-1">Vuelve pronto para ver nuevos microproyectos.</p>
          </div>
        ) : (
          filtered.map(project => {
            const diff = DIFFICULTY_CONFIG[project.difficulty];
            const status = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
            const isOpen = project.status === "open";

            return (
              <Card key={project.id} className={cn(
                "flex flex-col hover:shadow-lg transition-all duration-200 overflow-hidden group",
                !isOpen && "opacity-70"
              )}>
                {/* Difficulty stripe */}
                <div className={cn("h-1", {
                  "bg-emerald-400": project.difficulty === "easy",
                  "bg-amber-400": project.difficulty === "medium",
                  "bg-rose-400": project.difficulty === "hard",
                })} />

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs font-medium bg-slate-50 border-slate-200 gap-1">
                      <Building className="w-3 h-3" /> {project.companyName}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", status.color)}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <CardTitle className="text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 pb-3 space-y-4">
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{project.description}</p>

                  {/* Required skills */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Habilidades requeridas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.requiredSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", diff.dot)} />
                        <span className={cn("text-xs font-bold", diff.color.split(" ")[0])}>{diff.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Dificultad</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-700 truncate">{project.duration}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Duración</span>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-100">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span className="text-xs font-bold text-amber-700">{project.rewardPoints} HP</span>
                      </div>
                      <span className="text-[10px] text-amber-500">1er lugar</span>
                    </div>
                  </div>

                  {/* Applicant count */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    {project.applicantCount > 0
                      ? `${project.applicantCount} postulante${project.applicantCount !== 1 ? "s" : ""}`
                      : "Sé el primero en postular"}
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t bg-slate-50/50">
                  <Dialog open={dialogOpen && selectedProject?.id === project.id} onOpenChange={(open) => {
                    if (!open) { setDialogOpen(false); setSelectedProject(null); }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full font-semibold gap-2"
                        disabled={!isOpen}
                        onClick={() => openApply(project)}
                      >
                        {isOpen ? (
                          <><Send className="w-4 h-4" /> Postular al Reto</>
                        ) : (
                          <><AlertCircle className="w-4 h-4" /> {status.label}</>
                        )}
                      </Button>
                    </DialogTrigger>

                    {selectedProject && (
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl">Postular al reto</DialogTitle>
                        </DialogHeader>

                        {/* Project summary inside dialog */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs font-medium gap-1 bg-white">
                                  <Building className="w-3 h-3" /> {selectedProject.companyName}
                                </Badge>
                                <Badge className={cn("text-xs border font-semibold", diff.color)}>
                                  {diff.label}
                                </Badge>
                              </div>
                              <h3 className="font-bold text-slate-900 text-base leading-tight">{selectedProject.title}</h3>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center shrink-0">
                              <div className="text-xs text-amber-600 font-medium">1er lugar</div>
                              <div className="text-lg font-extrabold text-amber-700">{selectedProject.rewardPoints} HP</div>
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed">{selectedProject.description}</p>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span><strong>Duración:</strong> {selectedProject.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span><strong>Postulantes:</strong> {selectedProject.applicantCount}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Habilidades requeridas</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedProject.requiredSkills.map(skill => (
                                <Badge key={skill} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200">
                            <div className="text-center">
                              <div className="text-sm font-bold text-amber-600">{selectedProject.rewardPoints} HP</div>
                              <div className="text-[10px] text-slate-400">1er lugar</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold text-slate-500">{Math.round(selectedProject.rewardPoints * 0.5)} HP</div>
                              <div className="text-[10px] text-slate-400">2do lugar</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold text-slate-400">{Math.round(selectedProject.rewardPoints * 0.2)} HP</div>
                              <div className="text-[10px] text-slate-400">3er lugar</div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Application form */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-primary" />
                            <h4 className="font-bold text-slate-900">Tu propuesta de solución</h4>
                          </div>

                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                              <FormField control={form.control} name="proposal" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold">Enfoque y metodología</FormLabel>
                                  <FormDescription className="text-xs">
                                    ¿Cómo vas a resolver el reto? Describe tu enfoque paso a paso.
                                  </FormDescription>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ejemplo: Primero analizaré los requerimientos del reto identificando los casos de uso principales. Luego diseñaré la arquitectura de la solución considerando escalabilidad y mantenibilidad..."
                                      className="h-28 resize-none text-sm"
                                      {...field}
                                    />
                                  </FormControl>
                                  <div className="flex justify-between">
                                    <FormMessage />
                                    <span className="text-xs text-slate-400 ml-auto">{field.value.length}/500</span>
                                  </div>
                                </FormItem>
                              )} />

                              <FormField control={form.control} name="tools" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold">Herramientas y tecnologías</FormLabel>
                                  <FormDescription className="text-xs">
                                    ¿Qué tecnologías, librerías o herramientas usarás y por qué?
                                  </FormDescription>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ejemplo: Usaré Python + FastAPI para el backend por su rendimiento y facilidad de documentación automática. Para la base de datos elegiré PostgreSQL porque..."
                                      className="h-20 resize-none text-sm"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />

                              <FormField control={form.control} name="timeline" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold">Planificación y entregables</FormLabel>
                                  <FormDescription className="text-xs">
                                    ¿Cómo distribuirás el tiempo disponible ({selectedProject.duration})? ¿Qué entregarás?
                                  </FormDescription>
                                  <FormControl>
                                    <Textarea
                                      placeholder={`Ejemplo: Día 1-2: Análisis de requerimientos y diseño. Día 3-4: Implementación del core. Día 5: Pruebas y documentación. Entregable: repositorio GitHub + demo funcional.`}
                                      className="h-20 resize-none text-sm"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />

                              <FormField control={form.control} name="whyYou" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold">¿Por qué eres el candidato ideal?</FormLabel>
                                  <FormDescription className="text-xs">
                                    Menciona experiencias, proyectos o habilidades relevantes para este reto.
                                  </FormDescription>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ejemplo: He desarrollado 2 proyectos similares donde implementé soluciones de backend en Python. Tengo experiencia específica con las APIs de pago que se mencionan en el reto..."
                                      className="h-20 resize-none text-sm"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />

                              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-emerald-700">
                                  Al enviar tu postulación, ganas <strong>1 HP garantizado</strong> por participar.
                                  Si quedas entre los primeros 3 puestos, recibirás los HikePoints adicionales del ranking.
                                </p>
                              </div>

                              <div className="flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 gap-2 font-semibold" disabled={applyMutation.isPending}>
                                  {applyMutation.isPending ? (
                                    "Enviando..."
                                  ) : (
                                    <><Send className="w-4 h-4" /> Enviar Postulación</>
                                  )}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
