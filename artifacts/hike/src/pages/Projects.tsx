import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListProjects, useCreateProject, useDeleteProject } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Github, ExternalLink, Trash2, Edit2, Code, Target, Lightbulb, Rocket, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  title: z.string().min(2, "El título es requerido"),
  description: z.string().min(10, "Describe el proyecto (min 10 caracteres)"),
  problem: z.string().min(10, "Describe el problema"),
  solution: z.string().min(10, "Describe la solución"),
  impact: z.string().min(5, "Describe el impacto o resultado"),
  role: z.string().min(2, "Tu rol es requerido"),
  technologies: z.string().min(2, "Lista las tecnologías (separadas por coma)"),
  githubUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  demoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export default function Projects() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: projects, isLoading } = useListProjects({ userId }, {
    query: { enabled: !!userId }
  });

  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "", description: "", problem: "", solution: "", 
      impact: "", role: "", technologies: "", githubUrl: "", demoUrl: ""
    }
  });

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    createProject.mutate({
      data: {
        ...data,
        technologies: data.technologies.split(",").map(t => t.trim()).filter(Boolean),
        githubUrl: data.githubUrl || undefined,
        demoUrl: data.demoUrl || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        setIsOpen(false);
        form.reset();
        toast({ title: "Proyecto creado", description: "Has ganado +10 HP" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este proyecto?")) {
      deleteProject.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
          toast({ title: "Proyecto eliminado" });
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Portafolio de Proyectos</h1>
          <p className="text-slate-500">Demuestra lo que sabes hacer. Cada proyecto suma 10 HP a tu perfil.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full">
              <Plus className="w-4 h-4" /> Agregar Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Proyecto</DialogTitle>
              <DialogDescription>Muestra tu capacidad de resolver problemas reales.</DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Título del Proyecto</FormLabel>
                      <FormControl><Input placeholder="E.g. E-commerce Platform" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Tu Rol</FormLabel>
                      <FormControl><Input placeholder="E.g. Frontend Developer" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Breve</FormLabel>
                    <FormControl><Textarea placeholder="Un resumen de 2-3 líneas sobre el proyecto..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="problem" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problema (Contexto)</FormLabel>
                      <FormControl><Textarea placeholder="¿Qué problema resolvías?" className="h-24" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="solution" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solución</FormLabel>
                      <FormControl><Textarea placeholder="¿Cómo lo resolviste?" className="h-24" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="impact" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impacto / Resultado</FormLabel>
                    <FormControl><Input placeholder="E.g. Redujo el tiempo de carga un 40%" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="technologies" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tecnologías (separadas por coma)</FormLabel>
                    <FormControl><Input placeholder="React, Node.js, PostgreSQL" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="githubUrl" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Enlace GitHub (Opcional)</FormLabel>
                      <FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="demoUrl" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Enlace Demo (Opcional)</FormLabel>
                      <FormControl><Input placeholder="https://demo.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <Button type="submit" className="w-full" disabled={createProject.isPending}>
                  {createProject.isPending ? "Guardando..." : "Guardar Proyecto (+10 HP)"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
      ) : projects?.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Rocket className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No tienes proyectos todavía</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">El portafolio es la mejor manera de demostrar tus habilidades reales más allá del CV.</p>
          <Button onClick={() => setIsOpen(true)}>Crear Primer Proyecto</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects?.map((project) => (
            <Card key={project.id} className="flex flex-col h-full hover:border-primary/40 transition-colors group">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">{project.title}</CardTitle>
                    <CardDescription className="font-medium text-slate-700">{project.role}</CardDescription>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(project.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                <p className="text-sm text-slate-600 mb-6 line-clamp-3">{project.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-sm">
                    <Target className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    <div><span className="font-semibold block text-slate-700">Problema:</span> <span className="text-slate-600 line-clamp-2">{project.problem}</span></div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div><span className="font-semibold block text-slate-700">Solución:</span> <span className="text-slate-600 line-clamp-2">{project.solution}</span></div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div><span className="font-semibold block text-slate-700">Impacto:</span> <span className="text-slate-600">{project.impact}</span></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs bg-slate-100 font-medium">
                      <Code className="w-3 h-3 mr-1 opacity-50" /> {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              {(project.githubUrl || project.demoUrl) && (
                <CardFooter className="pt-0 flex gap-3 border-t p-4 bg-slate-50/50 mt-auto">
                  {project.githubUrl && (
                    <Button variant="outline" size="sm" asChild className="text-xs h-8">
                      <a href={project.githubUrl} target="_blank" rel="noreferrer"><Github className="w-3.5 h-3.5 mr-1.5" /> Código</a>
                    </Button>
                  )}
                  {project.demoUrl && (
                    <Button variant="outline" size="sm" asChild className="text-xs h-8">
                      <a href={project.demoUrl} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Ver Demo</a>
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
