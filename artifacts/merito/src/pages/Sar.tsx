import { useAuth } from "@/hooks/use-auth";
import { useListSarExperiences } from "@workspace/api-client-react";
import { getListSarExperiencesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Target, Zap, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Sar() {
  const { user } = useAuth();
  
  const { data: sars, isLoading } = useListSarExperiences(
    { userId: user?.id },
    { query: { enabled: !!user, queryKey: getListSarExperiencesQueryKey({ userId: user?.id }) as any } }
  );

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SAR Experiences</h1>
          <p className="text-muted-foreground">Situation, Action, Result — evidence of your behavioral skills.</p>
        </div>
        <Link href="/sar/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-48 bg-muted/20" />
            </Card>
          ))}
        </div>
      ) : sars && sars.length > 0 ? (
        <div className="space-y-6">
          {sars.map(sar => (
            <Card key={sar.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <div className="border-b bg-muted/30 px-6 py-3 flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {sar.softSkills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-xs text-muted-foreground font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {format(new Date(sar.createdAt), "MMM d, yyyy")}
                </div>
              </div>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                  <div className="p-6 space-y-3">
                    <div className="flex items-center text-primary font-semibold gap-2">
                      <Target className="w-4 h-4" /> Situation
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{sar.situacion}</p>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center text-primary font-semibold gap-2">
                      <Zap className="w-4 h-4" /> Action
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{sar.accion}</p>
                  </div>
                  <div className="p-6 space-y-3 bg-primary/5">
                    <div className="flex items-center text-primary font-semibold gap-2">
                      <TrendingUp className="w-4 h-4" /> Result
                    </div>
                    <p className="text-sm font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{sar.resultado}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No SAR experiences yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Recruiters love behavioral evidence. Document a situation you faced, the actions you took, and the results you achieved.
          </p>
          <Link href="/sar/new">
            <Button>Add Your First SAR Experience</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
