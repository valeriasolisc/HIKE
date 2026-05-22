import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListSarExperiences, useCreateSarExperience, useDeleteSarExperience } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Target, Zap, Trophy, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sarSchema = z.object({
  situacion: z.string().min(10, "Describe la situación (min 10 caracteres)"),
  accion: z.string().min(10, "Describe tu acción (min 10 caracteres)"),
  resultado: z.string().min(10, "Describe el resultado (min 10 caracteres)"),
  softSkills: z.string().min(2, "Ingresa al menos una habilidad blanda"),
});

export default function SarExperiences() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: experiences, isLoading } = useListSarExperiences({ userId }, {
    query: { enabled: !!userId }
  });

  const createSar = useCreateSarExperience();
  const deleteSar = useDeleteSarExperience();

  const form = useForm<z.infer<typeof sarSchema>>({
    resolver: zodResolver(sarSchema),
    defaultValues: { situacion: "", accion: "", resultado: "", softSkills: "" }
  });

  const onSubmit = (data: z.infer<typeof sarSchema>) => {
    createSar.mutate({
      data: {
        ...data,
        softSkills: data.softSkills.split(",").map(s => s.trim()).filter(Boolean)
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/sar-experiences"] });
        setIsOpen(false);
        form.reset();
        toast({ title: "Experiencia SAR guardada", description: "Has ganado +50 HP" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Eliminar experiencia?")) {
      deleteSar.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/sar-experiences"] });
          toast({ title: "Experiencia eliminada" });
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Experiencias SAR</h1>
          <p className="text-slate-500 text-sm mt-1">Situación, Acción, Resultado. El método estrella que usan los reclutadores para evaluar habilidades blandas en entrevistas reales.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full">
              <Plus className="w-4 h-4" /> Agregar SAR
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Nueva Experiencia SAR</DialogTitle>
              <DialogDescription>Muestra cómo actúas bajo presión o en equipo.</DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="situacion" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Target className="w-4 h-4 text-blue-500"/> Situación</FormLabel>
                    <FormControl><Textarea placeholder="Contexto del problema o reto que enfrentaste..." className="resize-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="accion" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/> Acción</FormLabel>
                    <FormControl><Textarea placeholder="¿Qué hiciste tú específicamente para resolverlo?" className="resize-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="resultado" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Trophy className="w-4 h-4 text-emerald-500"/> Resultado</FormLabel>
                    <FormControl><Textarea placeholder="¿Cuál fue el impacto de tu acción? (Usa números si es posible)" className="resize-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="softSkills" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habilidades Blandas Demostradas</FormLabel>
                    <FormControl><Input placeholder="Liderazgo, Comunicación asertiva, Empatía..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <Button type="submit" className="w-full" disabled={createSar.isPending}>
                  {createSar.isPending ? "Guardando..." : "Guardar Experiencia (+50 HP)"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[250px] w-full rounded-2xl" />
          <Skeleton className="h-[250px] w-full rounded-2xl" />
        </div>
      ) : experiences?.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-purple-500">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Prepárate para entrevistas</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Documentar tus experiencias en formato SAR te da una ventaja competitiva brutal frente a otros candidatos.</p>
          <Button onClick={() => setIsOpen(true)}>Crear Primera Historia</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences?.map((sar) => (
            <Card key={sar.id} className="relative group overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 h-8 w-8 text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(sar.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider mb-2">
                      <Target className="w-4 h-4" /> Situación
                    </div>
                    <p className="text-sm text-slate-600">{sar.situacion}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider mb-2">
                      <Zap className="w-4 h-4" /> Acción
                    </div>
                    <p className="text-sm text-slate-600">{sar.accion}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider mb-2">
                      <Trophy className="w-4 h-4" /> Resultado
                    </div>
                    <p className="text-sm text-slate-600">{sar.resultado}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase mr-2">Skills Demostradas:</span>
                  {sar.softSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
