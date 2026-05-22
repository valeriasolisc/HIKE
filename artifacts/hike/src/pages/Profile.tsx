import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetProfile, useUpdateProfile, useListProjects, useListSkills, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Github, Linkedin, Link as LinkIcon, Briefcase, Pencil, Plus, Eye, EyeOff, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const editSchema = z.object({
  bio: z.string().max(500).optional(),
  headline: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  githubUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  linkedinUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  portfolioUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  avatarUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type EditValues = z.infer<typeof editSchema>;

export default function Profile() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  const [antibiasOn, setAntibiasOn] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useGetProfile(userId || 0, {
    query: { enabled: !!userId }
  });

  const { data: projects, isLoading: isProjectsLoading } = useListProjects({ userId }, {
    query: { enabled: !!userId }
  });

  const { data: skills, isLoading: isSkillsLoading } = useListSkills({ userId }, {
    query: { enabled: !!userId }
  });

  const updateProfile = useUpdateProfile();

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    values: {
      bio: profile?.bio ?? "",
      headline: profile?.headline ?? "",
      location: profile?.location ?? "",
      githubUrl: profile?.githubUrl ?? "",
      linkedinUrl: profile?.linkedinUrl ?? "",
      portfolioUrl: profile?.portfolioUrl ?? "",
      avatarUrl: profile?.avatarUrl ?? "",
    },
  });

  const onSubmit = (data: EditValues) => {
    if (!userId) return;
    const payload: Record<string, string> = {};
    (Object.keys(data) as (keyof EditValues)[]).forEach(k => {
      if (data[k] !== undefined && data[k] !== "") payload[k] = data[k] as string;
    });
    updateProfile.mutate(
      { userId, data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey(userId) });
          setEditOpen(false);
          toast({ title: "Perfil actualizado", description: "Los cambios se guardaron correctamente." });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
        }
      }
    );
  };

  if (isProfileLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const categoryColor: Record<string, string> = {
    technical: "bg-blue-100 text-blue-700 border-blue-200",
    soft: "bg-purple-100 text-purple-700 border-purple-200",
    tool: "bg-amber-100 text-amber-700 border-amber-200",
    language: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Cover & Header */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative group">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 cursor-pointer">
            <div className="flex items-center gap-2 text-white text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full">
              <Camera className="w-4 h-4" /> Cambiar portada
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 relative">
          <div className="absolute -top-14 left-8 flex items-end gap-3">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-3xl font-bold text-primary shadow-md overflow-hidden relative group cursor-pointer">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile?.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile?.name?.charAt(0) || "U"}</span>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="pt-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{profile?.name}</h1>
              </div>
              <p className="text-base text-slate-500 font-medium mt-0.5">
                {profile?.headline || <span className="italic text-slate-400">Sin titular — edita tu perfil</span>}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                {profile?.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.location}</span>
                )}
                {profile?.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {profile?.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {profile?.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                    <LinkIcon className="w-3.5 h-3.5" /> Portafolio
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl px-5 py-3 border border-blue-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">HikeScore</div>
                <div className="text-3xl font-extrabold text-primary leading-tight">{profile?.score || 0}</div>
                <div className="text-xs font-semibold text-primary/60">HikePoints</div>
              </div>

              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="w-3.5 h-3.5" /> Editar perfil
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar perfil</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField control={form.control} name="avatarUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de foto de perfil</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <p className="text-xs text-slate-400">Pega una URL pública de imagen (JPG, PNG, etc.)</p>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="headline" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titular profesional</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Backend Developer | Python | Buscando prácticas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobre mí</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Cuéntale a los reclutadores sobre ti, tus motivaciones y qué te hace único..."
                              className="h-28 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <div className="text-right text-xs text-slate-400">{(field.value || "").length}/500</div>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ubicación</FormLabel>
                          <FormControl>
                            <Input placeholder="Lima, Perú" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-1 gap-4">
                        <FormField control={form.control} name="githubUrl" render={({ field }) => (
                          <FormItem>
                            <FormLabel>GitHub</FormLabel>
                            <FormControl>
                              <Input placeholder="https://github.com/tunombre" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/in/tunombre" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="portfolioUrl" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portafolio / Sitio web</FormLabel>
                            <FormControl>
                              <Input placeholder="https://tupagina.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={updateProfile.isPending}>
                          {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Sobre mí</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500 h-8" onClick={() => setEditOpen(true)}>
                <Pencil className="w-3.5 h-3.5" /> Editar
              </Button>
            </CardHeader>
            <CardContent>
              {profile?.bio ? (
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{profile.bio}</p>
              ) : (
                <button
                  onClick={() => setEditOpen(true)}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 hover:border-primary/40 hover:text-primary transition-colors group"
                >
                  <Pencil className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Escribe una descripción personal</p>
                  <p className="text-xs mt-1">Cuéntale a las empresas sobre ti, tus motivaciones y proyectos</p>
                </button>
              )}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Proyectos Destacados</CardTitle>
                <Badge variant="secondary" className="text-xs">{projects?.length || 0}</Badge>
              </div>
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500 h-8" onClick={() => navigate("/proyectos")}>
                <Plus className="w-3.5 h-3.5" /> Añadir
              </Button>
            </CardHeader>
            <CardContent>
              {isProjectsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map(project => (
                    <div key={project.id} className="border rounded-xl p-4 hover:border-primary/40 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-900">{project.title}</h3>
                        <Badge variant="outline" className="text-xs font-normal shrink-0 ml-2">{project.role}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map(tech => (
                          <Badge key={tech} variant="secondary" className="text-xs bg-slate-100 text-slate-600">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/proyectos")}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 hover:border-primary/40 hover:text-primary transition-colors group"
                >
                  <Briefcase className="w-7 h-7 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Agrega tu primer proyecto</p>
                  <p className="text-xs mt-1">Muestra proyectos reales con impacto medible</p>
                </button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Skills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Habilidades</CardTitle>
                <Badge variant="secondary" className="text-xs">{skills?.length || 0}</Badge>
              </div>
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500 h-8" onClick={() => navigate("/habilidades")}>
                <Plus className="w-3.5 h-3.5" /> Añadir
              </Button>
            </CardHeader>
            <CardContent>
              {isSkillsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : skills && skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className={cn("px-2.5 py-1 font-medium text-xs", categoryColor[skill.category] || "bg-slate-100 text-slate-600")}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/habilidades")}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-5 text-center text-slate-400 hover:border-primary/40 hover:text-primary transition-colors text-sm group"
                >
                  <Plus className="w-5 h-5 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  Agrega tus habilidades
                </button>
              )}
            </CardContent>
          </Card>

          {/* Anti-bias preview */}
          <Card className={cn("border transition-all", antibiasOn ? "border-slate-200" : "bg-slate-900 border-slate-800 text-white")}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={cn("text-sm font-semibold", antibiasOn ? "text-slate-700" : "text-white")}>
                  Vista Anti-sesgo
                </CardTitle>
                <button
                  onClick={() => setAntibiasOn(!antibiasOn)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors",
                    antibiasOn
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  {antibiasOn ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {antibiasOn ? "Ver normal" : "Ver sin sesgo"}
                </button>
              </div>
              <p className={cn("text-xs leading-relaxed", antibiasOn ? "text-slate-500" : "text-slate-400")}>
                {antibiasOn
                  ? "Modo desactivado — los reclutadores ven tu nombre e institución"
                  : "Así te ven los reclutadores por defecto: solo mérito, sin datos personales"}
              </p>
            </CardHeader>
            <CardContent>
              {antibiasOn ? (
                <div className="bg-slate-50 rounded-lg p-4 border space-y-2">
                  <div className="flex items-center gap-3">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {profile?.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{profile?.name}</div>
                      <div className="text-xs text-slate-500">{profile?.headline}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 rounded-lg p-4 border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-300">A.</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">Candidato Anónimo</div>
                      <div className="text-xs text-primary font-bold">{profile?.score || 0} HikePoints</div>
                    </div>
                  </div>
                  {skills && skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 4).map(s => (
                        <span key={s.id} className="text-[10px] bg-white/15 text-white/80 px-2.5 py-0.5 rounded-full border border-white/10">
                          {s.name}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                          +{skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="text-center">
                      <div className="text-sm font-bold text-white">{profile?.projectCount || 0}</div>
                      <div className="text-[10px] text-slate-400">Proyectos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-white">{skills?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">Habilidades</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-white">{profile?.validationCount || 0}</div>
                      <div className="text-[10px] text-slate-400">Validaciones</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
