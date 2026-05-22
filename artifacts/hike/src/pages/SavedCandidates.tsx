import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BookmarkX, Trash2, Zap, Code, FileText, Users, MessageSquare } from "lucide-react";

type SavedCandidate = {
  savedId: number;
  candidateId: number;
  anonymousAlias: string;
  name: string;
  score: number;
  level: string;
  topSkills: string[];
  projectCount: number;
  validationCount: number;
  sarCount: number;
  savedAt: string;
};

const levelLabels: Record<string, string> = {
  emerging: "Junior",
  developing: "Competitivo",
  proficient: "Destacado",
  expert: "Top Talent",
};

const levelColors: Record<string, string> = {
  emerging: "bg-slate-100 text-slate-600",
  developing: "bg-blue-100 text-blue-700",
  proficient: "bg-purple-100 text-purple-700",
  expert: "bg-amber-100 text-amber-700",
};

function useSavedCandidates() {
  return useQuery<SavedCandidate[]>({
    queryKey: ["/api/saved-candidates"],
    queryFn: () => customFetch("/api/saved-candidates"),
  });
}

function useRemoveCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: number) =>
      customFetch(`/api/saved-candidates/${candidateId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/saved-candidates"] }),
  });
}

export default function SavedCandidates() {
  const { data: candidates, isLoading } = useSavedCandidates();
  const removeMutation = useRemoveCandidate();
  const { toast } = useToast();

  const handleRemove = (candidate: SavedCandidate) => {
    removeMutation.mutate(candidate.candidateId, {
      onSuccess: () =>
        toast({ title: "Candidato eliminado", description: "Removido de tu shortlist." }),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Candidatos Guardados</h1>
        <p className="text-slate-500">Tu shortlist de talento prometedor.</p>
      </div>

      {!candidates || candidates.length === 0 ? (
        <Card className="border-dashed bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <BookmarkX className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">No hay candidatos guardados</h2>
            <p className="text-slate-500 max-w-md">
              Explora el buscador de talento y guarda los perfiles que te interesen para revisarlos más tarde.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map(candidate => (
            <Card key={candidate.savedId} className="flex flex-col hover:shadow-md transition-all overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary to-purple-500" />

              <CardHeader className="pb-3 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-3 border-2 border-white shadow-sm">
                  <span className="text-2xl font-black text-primary/70">
                    {candidate.anonymousAlias.charAt(candidate.anonymousAlias.length - 1)}
                  </span>
                </div>
                <CardTitle className="text-lg">{candidate.anonymousAlias}</CardTitle>

                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                  <Badge className="bg-primary/10 text-primary font-bold text-xs px-3 py-1">
                    <Zap className="w-3 h-3 mr-1" />{candidate.score} HP
                  </Badge>
                  <Badge className={`text-xs font-semibold px-2 py-1 ${levelColors[candidate.level] || "bg-slate-100 text-slate-600"}`}>
                    {levelLabels[candidate.level] || candidate.level}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-3 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-sm border-y py-3">
                  <div>
                    <div className="font-bold text-slate-900">{candidate.projectCount}</div>
                    <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                      <Code className="w-3 h-3" />Proyectos
                    </div>
                  </div>
                  <div className="border-x">
                    <div className="font-bold text-slate-900">{candidate.sarCount}</div>
                    <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                      <FileText className="w-3 h-3" />SAR
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{candidate.validationCount}</div>
                    <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" />Validados
                    </div>
                  </div>
                </div>

                {candidate.topSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2">Habilidades destacadas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.topSkills.map(skill => (
                        <Badge key={skill} variant="outline" className="bg-slate-50 text-slate-600 text-xs font-medium">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-3 border-t bg-slate-50/50 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => handleRemove(candidate)}
                  disabled={removeMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </Button>
                <Button size="sm" className="flex-1 gap-2" onClick={() =>
                  toast({ title: "Mensajes", description: "Ve a la sección de Mensajes para iniciar una conversación." })
                }>
                  <MessageSquare className="w-4 h-4" /> Mensaje
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
