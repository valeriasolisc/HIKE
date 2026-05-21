import { useListMicroprojects } from "@workspace/api-client-react";
import { getListMicroprojectsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building, Clock, Coins, Search, Users } from "lucide-react";

export default function Microprojects() {
  const { data: microprojects, isLoading } = useListMicroprojects(
    {},
    { query: { queryKey: getListMicroprojectsQueryKey() as any } }
  );

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Microprojects</h1>
        <p className="text-muted-foreground">Solve real company challenges. Prove your skills. Get hired.</p>
      </div>

      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-bold text-primary">Why Microprojects?</h2>
          <p className="text-sm text-muted-foreground">Companies post short, specific challenges instead of generic job postings. Successfully completing a microproject adds massive weight to your competence score and often leads directly to job offers.</p>
        </div>
        <div className="w-full md:w-auto shrink-0 flex gap-4">
          <div className="text-center px-4">
            <div className="text-2xl font-bold text-primary">500+</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Active</div>
          </div>
          <div className="text-center px-4 border-l">
            <div className="text-2xl font-bold text-primary">85%</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Hire Rate</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by skill or company..." 
            className="w-full h-10 pl-9 pr-4 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-64 bg-muted/20" />
          ))}
        </div>
      ) : microprojects && microprojects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {microprojects.map(mp => (
            <Card key={mp.id} className="flex flex-col hover:border-primary/50 hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Building className="w-4 h-4" />
                    {mp.companyName}
                  </div>
                  <Badge variant={mp.difficulty === 'hard' ? 'destructive' : mp.difficulty === 'medium' ? 'default' : 'secondary'} className="capitalize">
                    {mp.difficulty}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 leading-snug">{mp.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {mp.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mp.requiredSkills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="inline-flex items-center rounded-md bg-secondary text-secondary-foreground px-2 py-0.5 text-[10px] font-semibold">
                      {skill}
                    </span>
                  ))}
                  {mp.requiredSkills.length > 4 && (
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      +{mp.requiredSkills.length - 4}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {mp.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Coins className="w-3.5 h-3.5 text-yellow-500" /> {mp.rewardPoints} points
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Users className="w-3.5 h-3.5" /> {mp.applicantCount} applicants
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/10">
                <Link href={`/microprojects/${mp.id}`} className="w-full">
                  <Button className="w-full" variant="outline">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No active microprojects</h3>
          <p className="text-muted-foreground">Check back later for new company challenges.</p>
        </div>
      )}
    </div>
  );
}
