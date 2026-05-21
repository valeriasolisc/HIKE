import { useGetProject } from "@workspace/api-client-react";
import { getGetProjectQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github, ExternalLink, Calendar, Code, UserCircle } from "lucide-react";
import { format } from "date-fns";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = parseInt(params.id || "0");

  const { data: project, isLoading } = useGetProject(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) as any }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 animate-pulse">Loading project details...</div>;
  }

  if (!project) {
    return <div className="text-center py-20">Project not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <Link href="/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 w-4 h-4" /> Back to projects
      </Link>

      {project.imageUrl && (
        <div className="w-full h-[40vh] min-h-[300px] rounded-2xl overflow-hidden mb-8 bg-muted border">
          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {project.technologies.map((tech, i) => (
            <span key={i} className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
              {tech}
            </span>
          ))}
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">{project.title}</h1>
        <p className="text-xl text-muted-foreground">{project.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
          <UserCircle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">My Role</p>
            <p className="font-medium">{project.role}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
          <Calendar className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Published</p>
            <p className="font-medium">{format(new Date(project.createdAt), "MMM d, yyyy")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card border justify-center md:justify-start">
          {project.githubUrl && (
            <Button variant="outline" size="sm" className="w-full gap-2" asChild>
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                <Github className="w-4 h-4" /> Repo
              </a>
            </Button>
          )}
          {project.demoUrl && (
            <Button size="sm" className="w-full gap-2" asChild>
              <a href={project.demoUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" /> Live Demo
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold border-b pb-2 mb-6">The Problem</h2>
          <div className="prose prose-blue max-w-none dark:prose-invert">
            <p className="text-lg leading-relaxed whitespace-pre-line">{project.problem}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold border-b pb-2 mb-6">The Solution</h2>
          <div className="prose prose-blue max-w-none dark:prose-invert">
            <p className="text-lg leading-relaxed whitespace-pre-line">{project.solution}</p>
          </div>
        </section>

        <section>
          <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-2xl font-bold mb-4 text-primary">The Impact</h2>
            <div className="prose prose-blue max-w-none dark:prose-invert">
              <p className="text-lg font-medium leading-relaxed whitespace-pre-line text-foreground/90">{project.impact}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
