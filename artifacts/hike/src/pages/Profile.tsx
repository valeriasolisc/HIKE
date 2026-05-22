import { useAuth } from "@/hooks/use-auth";
import { useGetProfile, useListProjects, useListSkills } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Link as LinkIcon, Github, Linkedin, Briefcase } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: profile, isLoading: isProfileLoading } = useGetProfile(userId || 0, {
    query: { enabled: !!userId }
  });

  const { data: projects, isLoading: isProjectsLoading } = useListProjects({ userId }, {
    query: { enabled: !!userId }
  });

  const { data: skills, isLoading: isSkillsLoading } = useListSkills({ userId }, {
    query: { enabled: !!userId }
  });

  if (isProfileLoading) {
    return <div className="space-y-4"><Skeleton className="h-64 w-full rounded-2xl" /><Skeleton className="h-40 w-full" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Cover & Header */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-purple-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="absolute -top-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-4xl font-bold text-primary shadow-md overflow-hidden">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile?.name.charAt(0) || "U"
              )}
            </div>
          </div>
          
          <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{profile?.name}</h1>
              <p className="text-lg text-slate-600 font-medium mt-1">{profile?.headline || "Estudiante apasionado por la tecnología"}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">
                {profile?.location && (
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</div>
                )}
                {profile?.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><Github className="w-4 h-4" /> GitHub</a>
                )}
                {profile?.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><Linkedin className="w-4 h-4" /> LinkedIn</a>
                )}
                {profile?.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><LinkIcon className="w-4 h-4" /> Portafolio</a>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 text-center bg-slate-50 rounded-xl p-4 border">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">HikeScore</div>
              <div className="text-3xl font-extrabold text-primary">{profile?.score || 0} <span className="text-sm font-semibold">HP</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre mí</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {profile?.bio || "Aún no has escrito tu biografía. ¡Cuéntale a las empresas sobre ti!"}
              </p>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Proyectos Destacados</CardTitle>
              <Badge variant="secondary">{projects?.length || 0}</Badge>
            </CardHeader>
            <CardContent>
              {isProjectsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : projects && projects.length > 0 ? (
                <div className="space-y-6">
                  {projects.map(project => (
                    <div key={project.id} className="group border rounded-xl p-5 hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{project.title}</h3>
                        <Badge variant="outline" className="text-xs font-normal">{project.role}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map(tech => (
                          <Badge key={tech} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 border border-dashed rounded-xl">
                  <Briefcase className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  <p>Aún no has agregado proyectos a tu portafolio.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Habilidades</CardTitle>
            </CardHeader>
            <CardContent>
              {isSkillsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : skills && skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge 
                      key={skill.id} 
                      className={`px-3 py-1 font-medium ${
                        skill.category === 'technical' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                        skill.category === 'soft' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                        skill.category === 'tool' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                        'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4 border border-dashed rounded-lg">Sin habilidades registradas</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 text-white border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Modo Anti-sesgo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 mb-4">
                Así ven tu perfil los reclutadores al buscar talento (priorizando mérito sobre identidad).
              </p>
              <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                    <span className="text-xs font-bold">A.</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Candidato Anónimo</div>
                    <div className="text-xs text-primary font-bold">{profile?.score || 0} HP</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {skills?.slice(0, 3).map(s => (
                    <span key={s.id} className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{s.name}</span>
                  ))}
                  {skills && skills.length > 3 && (
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">+{skills.length - 3}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
