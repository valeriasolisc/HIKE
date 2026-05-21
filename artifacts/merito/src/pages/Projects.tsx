import { useAuth } from "@/hooks/use-auth";
import { useListProjects } from "@workspace/api-client-react";
import { getListProjectsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ExternalLink, Github, ArrowRight } from "lucide-react";

export default function Projects() {
  const { user } = useAuth();
  
  const { data: projects, isLoading } = useListProjects(
    { userId: user?.id },
    { query: { enabled: !!user, queryKey: getListProjectsQueryKey({ userId: user?.id }) as any } }
  );

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">Manage your portfolio and showcase your work.</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted/50 rounded-t-xl" />
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-muted/50 rounded w-2/3" />
                <div className="h-4 bg-muted/50 rounded w-full" />
                <div className="h-4 bg-muted/50 rounded w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              {project.imageUrl ? (
                <div className="h-48 w-full relative overflow-hidden bg-muted">
                  <img src={project.imageUrl} alt={project.title} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="h-48 w-full bg-primary/5 flex items-center justify-center border-b">
                  <span className="text-primary/20 font-bold text-4xl">{project.title.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span key={i} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
                <div className="flex gap-2">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
                <Link href={`/projects/${project.id}`} className="text-sm font-medium flex items-center text-primary hover:underline">
                  Details <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Your portfolio is empty. Add your first project to start building your dynamic identity and increase your competence score.
          </p>
          <Link href="/projects/new">
            <Button>Add Your First Project</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
