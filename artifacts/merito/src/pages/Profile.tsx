import { useParams } from "wouter";
import { useGetProfile, useListProjects, useListSarExperiences, useListValidations } from "@workspace/api-client-react";
import { getGetProfileQueryKey, getListProjectsQueryKey, getListSarExperiencesQueryKey, getListValidationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Link as LinkIcon, Github, ExternalLink, Briefcase, Award, Star } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Profile() {
  const params = useParams();
  const userId = parseInt(params.userId || "0");

  const { data: profile, isLoading: isLoadingProfile } = useGetProfile(userId, {
    query: { enabled: !!userId, queryKey: getGetProfileQueryKey(userId) as any }
  });

  const { data: projects, isLoading: isLoadingProjects } = useListProjects(
    { userId },
    { query: { enabled: !!userId, queryKey: getListProjectsQueryKey({ userId }) as any } }
  );

  const { data: sars, isLoading: isLoadingSar } = useListSarExperiences(
    { userId },
    { query: { enabled: !!userId, queryKey: getListSarExperiencesQueryKey({ userId }) as any } }
  );

  const { data: validations, isLoading: isLoadingValidations } = useListValidations(
    { userId },
    { query: { enabled: !!userId, queryKey: getListValidationsQueryKey({ userId }) as any } }
  );

  if (isLoadingProfile) return <div className="p-8 text-center animate-pulse">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-muted-foreground">Profile not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header / Basic Info */}
      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm relative">
        <div className="h-32 md:h-48 bg-gradient-to-r from-primary/80 to-primary/40 w-full" />
        <div className="px-6 md:px-10 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20 mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-card bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary shrink-0 overflow-hidden bg-background shadow-md">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 space-y-2 pb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{profile.name}</h1>
              {profile.headline && <p className="text-xl text-muted-foreground font-medium">{profile.headline}</p>}
              <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground pt-2">
                {profile.location && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location}</div>}
                {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors"><Github className="w-4 h-4" /> GitHub</a>}
                {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors"><ExternalLink className="w-4 h-4" /> LinkedIn</a>}
                {profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors"><LinkIcon className="w-4 h-4" /> Portfolio</a>}
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end pb-2">
              <div className="text-5xl font-black text-primary tracking-tighter">{profile.score}</div>
              <div className="text-sm font-bold tracking-widest text-muted-foreground uppercase">MÉRITO Score</div>
            </div>
          </div>

          {profile.bio && (
            <div className="prose prose-blue max-w-none text-muted-foreground mt-4">
              <p className="text-lg leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Projects */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Evidence Portfolio</h2>
            </div>
            {isLoadingProjects ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl" />)}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {projects.map(p => (
                  <Link key={p.id} href={`/projects/${p.id}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                      {p.imageUrl ? (
                        <div className="h-32 w-full bg-muted">
                          <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-2 bg-primary/20" />
                      )}
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg line-clamp-1">{p.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {p.technologies.slice(0, 3).map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-semibold">{t}</span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No projects added yet.</p>
            )}
          </section>

          {/* SAR Experiences */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Behavioral Evidence (SAR)</h2>
            </div>
            {isLoadingSar ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-xl" />)}
              </div>
            ) : sars && sars.length > 0 ? (
              <div className="space-y-4">
                {sars.map(sar => (
                  <Card key={sar.id}>
                    <CardContent className="p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {sar.softSkills.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                      <p className="text-sm font-medium mb-1"><span className="text-primary mr-1">Result:</span> {sar.resultado}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No behavioral experiences documented.</p>
            )}
          </section>
        </div>

        <div className="space-y-8">
          {/* Validations */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Validations</h2>
            </div>
            <Card>
              <CardContent className="p-0 divide-y">
                {isLoadingValidations ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
                ) : validations && validations.length > 0 ? (
                  validations.map(val => (
                    <div key={val.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm">{val.skillName}</span>
                        {val.rating && (
                          <div className="flex items-center text-yellow-500 text-xs font-bold">
                            <Star className="w-3 h-3 fill-current mr-1" /> {val.rating}/5
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug italic">"{val.message}"</p>
                      <p className="text-xs font-medium text-foreground/60 text-right">- {val.validatorName || "Anonymous"}, {format(new Date(val.createdAt), "MMM yyyy")}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground italic">No validations received yet.</div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
