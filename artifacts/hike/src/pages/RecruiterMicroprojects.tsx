import { useState } from "react";
import { useListMicroprojects, useCreateMicroproject } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Users, Clock, Zap, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const microprojectSchema = z.object({
  companyName: z.string().min(2, "Nombre de empresa requerido"),
  title: z.string().min(5, "Título requerido"),
  description: z.string().min(20, "Descripción detallada (mín. 20 caracteres)"),
  methodologyDescription: z.string().optional(),
  requiredSkills: z.string().min(2, "Habilidades requeridas (separadas por coma)"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  duration: z.string().min(2, "Duración estimada"),
  rewardPoints: z.coerce.number().min(10, "Mínimo 10 HP").max(1000, "Máximo 1000 HP"),
  hp2: z.coerce.number().min(0).max(1000).optional(),
  hp3: z.coerce.number().min(0).max(1000).optional(),
  minParticipants: z.coerce.number().min(1).optional(),
});

export default function RecruiterMicroprojects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { data: microprojects, isLoading } = useListMicroprojects();
  const createMicroproject = useCreateMicroproject();

  const form = useForm<z.infer<typeof microprojectSchema>>({
    resolver: zodResolver(microprojectSchema),
    defaultValues: {
      companyName: "",
      title: "",
      description: "",
      methodologyDescription: "",
      requiredSkills: "",
      difficulty: "medium",
      duration: "",
      rewardPoints: 100,
      hp2: 0,
      hp3: 0,
      minParticipants: 1,
    },
  });

  const rewardPoints = form.watch("rewardPoints");
  const hp2Default = Math.round((rewardPoints || 0) * 0.5);
  const hp3Default = Math.round((rewardPoints || 0) * 0.2);

  const onSubmit = (data: z.infer<typeof microprojectSchema>) => {
    createMicroproject.mutate(
      {
        data: {
          ...data,
          requiredSkills: data.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
          hp2: data.hp2 || hp2Default,
          hp3: data.hp3 || hp3Default,
          hpParticipant: 1,
          minParticipants: data.minParticipants || 1,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/microprojects"] });
          setIsOpen(false);
          form.reset();
          toast({ title: "Microproyecto publicado", description: "Los estudiantes ya pueden postular." });
        },
      }
    );
  };

  const difficultyConfig = {
    easy: { color: "bg-green-100 text-green-700", label: "Fácil" },
    medium: { color: "bg-amber-100 text-amber-700", label: "Medio" },
    hard: { color: "bg-rose-100 text-rose-700", label: "Difícil" },
  };

  const myMicroprojects = microprojects?.filter(m => true) ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Microproyectos</h1>
          <p className="text-slate-500">Publica retos para evaluar talento en acción real.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nuevo Reto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Microproyecto</DialogTitle>
              <DialogDescription>
                Define un reto claro que permita evaluar las habilidades que necesitas en tu equipo.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="companyName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl><Input placeholder="Ej. Culqi, Platzi, Yape..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Reto</FormLabel>
                      <FormControl><Input placeholder="Ej. Optimización de Query SQL" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción general</FormLabel>
                    <FormDescription className="text-xs">Contexto del reto y lo que se espera.</FormDescription>
                    <FormControl>
                      <Textarea placeholder="¿Qué problema quieres que resuelvan los candidatos?" className="h-24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="methodologyDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metodología y entregables (opcional)</FormLabel>
                    <FormDescription className="text-xs">Detalla cómo debe realizarse el reto y qué deben entregar.</FormDescription>
                    <FormControl>
                      <Textarea placeholder="Ej: Repositorio en GitHub + demo funcional + documentación técnica..." className="h-20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="requiredSkills" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habilidades Requeridas</FormLabel>
                    <FormDescription className="text-xs">Separadas por coma.</FormDescription>
                    <FormControl><Input placeholder="React, API REST, UI/UX, PostgreSQL..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="difficulty" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dificultad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Fácil</SelectItem>
                          <SelectItem value="medium">Medio</SelectItem>
                          <SelectItem value="hard">Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración Estimada</FormLabel>
                      <FormControl><Input placeholder="Ej. 2 semanas" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="minParticipants" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mín. participantes</FormLabel>
                      <FormControl><Input type="number" min={1} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="border rounded-xl p-4 space-y-3 bg-amber-50/50 border-amber-200">
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> HikePoints por posición
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="rewardPoints" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">🥇 1er lugar (HP)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="hp2" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">🥈 2do lugar (HP)</FormLabel>
                        <FormControl><Input type="number" placeholder={String(hp2Default)} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="hp3" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">🥉 3er lugar (HP)</FormLabel>
                        <FormControl><Input type="number" placeholder={String(hp3Default)} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <p className="text-xs text-slate-500">Los participantes que no queden en podio reciben 1 HP automáticamente.</p>
                </div>

                <Button type="submit" className="w-full" disabled={createMicroproject.isPending}>
                  {createMicroproject.isPending ? "Publicando..." : "Publicar Reto"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : myMicroprojects.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">No hay retos publicados</h3>
            <p className="text-slate-500">Crea un microproyecto para atraer talento.</p>
          </div>
        ) : (
          myMicroprojects.map(project => (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {project.companyName}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${project.status === "open" ? "text-green-600 border-green-200 bg-green-50" : "text-slate-500"}`}
                    >
                      {project.status === "open" ? "Activo" : project.status === "reviewing" ? "En revisión" : "Cerrado"}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-900">{project.applicantCount}</span> postulantes
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                    <Clock className="w-4 h-4 text-slate-400" /> {project.duration}
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-amber-700">{project.rewardPoints} HP</span>
                    <span className="text-amber-500 text-xs">1er lugar</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${difficultyConfig[project.difficulty].color} border-none`}
                  >
                    {difficultyConfig[project.difficulty].label}
                  </Badge>
                </div>
                {project.requiredSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.requiredSkills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
