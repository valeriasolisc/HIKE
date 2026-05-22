import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListMicroprojects, useApplyMicroproject } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Building, Clock, Target, Lock, Trophy, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const applySchema = z.object({
  proposal: z.string().min(20, "Tu propuesta debe ser detallada (mínimo 20 caracteres)"),
});

export default function Microprojects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const { data: microprojects, isLoading } = useListMicroprojects();
  const applyMicroproject = useApplyMicroproject();

  const form = useForm<z.infer<typeof applySchema>>({
    resolver: zodResolver(applySchema),
    defaultValues: { proposal: "" }
  });

  const onSubmit = (data: z.infer<typeof applySchema>) => {
    if (!selectedProject) return;
    
    applyMicroproject.mutate({
      data: {
        microprojectId: selectedProject,
        userId: user?.id || 0,
        ...data
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/microprojects"] });
        setSelectedProject(null);
        form.reset();
        toast({ title: "Postulación enviada", description: "Tu propuesta ha sido enviada a la empresa." });
      }
    });
  };

  const difficultyConfig = {
    easy: { color: "text-green-600 bg-green-100", label: "Fácil" },
    medium: { color: "text-amber-600 bg-amber-100", label: "Medio" },
    hard: { color: "text-rose-600 bg-rose-100", label: "Difícil" }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Microproyectos</h1>
          <p className="text-slate-500">Resuelve retos reales de empresas y gana HikePoints.</p>
        </div>
        
        <div className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-xl flex items-center gap-2">
          <Trophy className="w-5 h-5" /> Gana hasta 500 HP
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-2xl" />
          ))
        ) : microprojects?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No hay retos disponibles</h3>
            <p className="text-slate-500">Vuelve más tarde para ver nuevos microproyectos de las empresas.</p>
          </div>
        ) : (
          microprojects?.map(project => {
            const diff = difficultyConfig[project.difficulty];
            return (
              <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
                <CardHeader className="pb-4 relative">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 font-semibold border-slate-200">
                      <Building className="w-3 h-3 mr-1" /> {project.companyName}
                    </Badge>
                    <Badge className={`${diff.color} border-none font-bold`}>
                      {diff.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{project.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">{project.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="w-4 h-4 mr-2" /> Duración: {project.duration}
                    </div>
                    <div className="flex items-center text-sm font-bold text-primary">
                      <Zap className="w-4 h-4 mr-2" /> Recompensa: {project.rewardPoints} HP
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {project.requiredSkills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs bg-slate-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-slate-50/50">
                  <Dialog open={selectedProject === project.id} onOpenChange={(open) => !open && setSelectedProject(null)}>
                    <DialogTrigger asChild>
                      <Button className="w-full font-bold" onClick={() => setSelectedProject(project.id)}>
                        Postular a Reto
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Postular: {project.title}</DialogTitle>
                        <DialogDescription>Describe cómo resolverías este reto para {project.companyName}.</DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField control={form.control} name="proposal" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tu propuesta de solución</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Explica tu enfoque, herramientas que usarías y tiempos estimados..." 
                                  className="h-32 resize-none" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <Button type="submit" className="w-full" disabled={applyMicroproject.isPending}>
                            {applyMicroproject.isPending ? "Enviando..." : "Enviar Postulación"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
}
