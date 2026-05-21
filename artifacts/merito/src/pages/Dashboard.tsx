import { useAuth } from "@/hooks/use-auth";
import { useGetStudentDashboard, useGetScoreBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Star, Award, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: dashboard, isLoading: isLoadingDash } = useGetStudentDashboard(user?.id ?? 0, { 
    query: { enabled: !!user, queryKey: ["dashboard", user?.id] as any } 
  });
  
  const { data: scoreBreakdown, isLoading: isLoadingScore } = useGetScoreBreakdown(user?.id ?? 0, {
    query: { enabled: !!user, queryKey: ["scoreBreakdown", user?.id] as any }
  });

  if (isLoadingDash || isLoadingScore) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  if (!dashboard || !scoreBreakdown) {
    return <div>Failed to load dashboard data.</div>;
  }

  const scorePercentage = (dashboard.score / 1000) * 100;

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}. Here's your dynamic professional identity.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Competence Score</CardTitle>
            <CardDescription>Based on evidence from projects, skills, and validations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${scorePercentage * 2.51} 251.2`}
                    className="text-primary transition-all duration-1000 ease-in-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{dashboard.score}</span>
                  <span className="text-sm font-medium text-muted-foreground capitalize">{scoreBreakdown.level}</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Projects</span>
                    <span className="font-medium">{scoreBreakdown.projectsScore}</span>
                  </div>
                  <Progress value={(scoreBreakdown.projectsScore / 400) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Skills</span>
                    <span className="font-medium">{scoreBreakdown.skillsScore}</span>
                  </div>
                  <Progress value={(scoreBreakdown.skillsScore / 200) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">SAR Experiences</span>
                    <span className="font-medium">{scoreBreakdown.sarScore}</span>
                  </div>
                  <Progress value={(scoreBreakdown.sarScore / 200) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Validations</span>
                    <span className="font-medium">{scoreBreakdown.validationsScore}</span>
                  </div>
                  <Progress value={(scoreBreakdown.validationsScore / 200) * 100} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-rows-3 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4 h-full">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{dashboard.projectCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4 h-full">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skills</p>
                <p className="text-2xl font-bold">{dashboard.skillCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4 h-full">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Validations</p>
                <p className="text-2xl font-bold">{dashboard.validationCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your latest portfolio additions</CardDescription>
            </div>
            <Link href="/projects" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            {dashboard.recentProjects.length > 0 ? (
              <div className="space-y-4 mt-4">
                {dashboard.recentProjects.map(project => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                    <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                      <h4 className="font-semibold group-hover:text-primary transition-colors">{project.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't added any projects yet.</p>
                <Link href="/projects/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                  Add your first project
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Top Skills</CardTitle>
              <CardDescription>Skills with the most validations</CardDescription>
            </div>
            <Link href="/skills" className="text-sm font-medium text-primary hover:underline">Manage</Link>
          </CardHeader>
          <CardContent>
            {dashboard.topSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-4">
                {dashboard.topSkills.map(skill => (
                  <div key={skill.id} className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold transition-colors bg-secondary text-secondary-foreground">
                    {skill.name}
                    <span className="ml-2 text-xs bg-background/50 px-1.5 py-0.5 rounded-sm">{skill.level}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No skills added yet.</p>
                <Link href="/skills" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                  Add skills
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
