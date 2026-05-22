import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListSkills, useAddSkill, useDeleteSkill } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Code, MessageCircle, Wrench, Languages, Star, Hexagon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const skillSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.enum(["technical", "soft", "tool", "language"]),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

export default function Skills() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: skills, isLoading } = useListSkills({ userId }, {
    query: { enabled: !!userId }
  });

  const addSkill = useAddSkill();
  const deleteSkill = useDeleteSkill();

  const form = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: { name: "", category: "technical", level: "intermediate" }
  });

  const onSubmit = (data: z.infer<typeof skillSchema>) => {
    addSkill.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
        setIsOpen(false);
        form.reset();
        toast({ title: "Habilidad añadida", description: "Tu perfil ahora es más fuerte" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Eliminar habilidad?")) {
      deleteSkill.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
          toast({ title: "Habilidad eliminada" });
        }
      });
    }
  };

  const categoryConfig = {
    technical: { label: "Técnicas", icon: Code, color: "text-blue-600 bg-blue-100", border: "border-blue-200" },
    soft: { label: "Blandas", icon: MessageCircle, color: "text-purple-600 bg-purple-100", border: "border-purple-200" },
    tool: { label: "Herramientas", icon: Wrench, color: "text-amber-600 bg-amber-100", border: "border-amber-200" },
    language: { label: "Idiomas", icon: Languages, color: "text-emerald-600 bg-emerald-100", border: "border-emerald-200" }
  };

  const levelLabels = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    expert: "Experto"
  };

  const groupedSkills = skills?.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Habilidades</h1>
          <p className="text-slate-500">Define tu stack tecnológico y habilidades personales.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full">
              <Plus className="w-4 h-4" /> Nueva Habilidad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Habilidad</DialogTitle>
              <DialogDescription>Sé honesto con tu nivel actual.</DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Habilidad</FormLabel>
                    <FormControl><Input placeholder="E.g. React, Python, Liderazgo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecciona categoría" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="technical">Técnica (Hard Skill)</SelectItem>
                        <SelectItem value="soft">Blanda (Soft Skill)</SelectItem>
                        <SelectItem value="tool">Herramienta / Software</SelectItem>
                        <SelectItem value="language">Idioma</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="level" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecciona nivel" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Principiante</SelectItem>
                        <SelectItem value="intermediate">Intermedio</SelectItem>
                        <SelectItem value="advanced">Avanzado</SelectItem>
                        <SelectItem value="expert">Experto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <Button type="submit" className="w-full" disabled={addSkill.isPending}>
                  {addSkill.isPending ? "Añadiendo..." : "Añadir Habilidad"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[200px] rounded-2xl" />
          <Skeleton className="h-[200px] rounded-2xl" />
        </div>
      ) : skills?.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Hexagon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Construye tu stack</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Añade las tecnologías, herramientas y habilidades blandas que dominas.</p>
          <Button onClick={() => setIsOpen(true)}>Empezar</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const catSkills = groupedSkills?.[key as keyof typeof groupedSkills] || [];
            if (catSkills.length === 0) return null;
            
            const Icon = config.icon;
            
            return (
              <Card key={key} className={`border ${config.border} shadow-sm`}>
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {config.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((skill) => (
                      <div key={skill.id} className="group relative">
                        <Badge variant="outline" className={`pl-3 pr-8 py-1.5 flex items-center gap-2 bg-white ${config.border}`}>
                          <span className="font-semibold">{skill.name}</span>
                          <span className="text-xs opacity-60 font-normal">· {levelLabels[skill.level]}</span>
                        </Badge>
                        <button 
                          onClick={() => handleDelete(skill.id)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
