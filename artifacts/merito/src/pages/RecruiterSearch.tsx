import { useState } from "react";
import { useSearchTalent } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, SlidersHorizontal, UserCircle2 } from "lucide-react";
import { getSearchTalentQueryKey } from "@workspace/api-client-react";

export default function RecruiterSearch() {
  const [skill, setSkill] = useState("");
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const { data: profiles, isLoading } = useSearchTalent(
    { skill: skill || undefined, minScore }, 
    { 
      query: { 
        enabled: searchTrigger > 0,
        queryKey: getSearchTalentQueryKey({ skill: skill || undefined, minScore }) as any
      } 
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blind Talent Search</h1>
        <p className="text-muted-foreground">Find talent based on evidence and competence, free from bias.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-medium">Required Skill</label>
              <Input 
                placeholder="e.g. React, Python, Data Analysis" 
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label className="text-sm font-medium">Min. Score</label>
              <Input 
                type="number" 
                placeholder="0 - 1000" 
                min="0" max="1000"
                value={minScore || ""}
                onChange={(e) => setMinScore(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            <Button type="submit" className="w-full md:w-auto h-10 px-8">
              <Search className="w-4 h-4 mr-2" /> Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchTrigger > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-32 bg-muted/20"></CardContent>
                </Card>
              ))}
            </div>
          ) : profiles && profiles.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {profiles.map(profile => (
                <Card key={profile.anonymousId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <UserCircle2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg truncate">Candidate {profile.anonymousId.substring(0, 8)}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{profile.projectCount} Projects</span>
                            <span>•</span>
                            <span>{profile.validationCount} Validations</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-bold text-primary">{profile.score}</span>
                          <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">Score</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile.topSkills.map((s, i) => (
                          <span key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border">
              <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No candidates found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
