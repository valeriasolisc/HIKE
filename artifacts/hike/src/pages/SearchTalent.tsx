import { useState } from "react";
import { useSearchTalent } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Shield, Zap, Eye, EyeOff, UserPlus, Code, Star, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function SearchTalent() {
  const [skillSearch, setSkillSearch] = useState("");
  const [antiBias, setAntiBias] = useState(true);
  const { toast } = useToast();

  const { data: candidates, isLoading } = useSearchTalent({ skill: skillSearch || undefined });

  const handleSave = () => {
    toast({ title: "Candidato Guardado", description: "Añadido a tu shortlist." });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Buscar Talento</h1>
          <p className="text-slate-500">Encuentra a los mejores candidatos basados en mérito real.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
          <Shield className={`w-5 h-5 ${antiBias ? 'text-primary' : 'text-slate-400'}`} />
          <div className="flex flex-col">
            <Label htmlFor="anti-bias" className="font-bold text-sm cursor-pointer">Modo Anti-sesgo</Label>
            <span className="text-xs text-slate-500">Ocultar identidad personal</span>
          </div>
          <Switch id="anti-bias" checked={antiBias} onCheckedChange={setAntiBias} className="ml-2" />
        </div>
      </div>

      <Card className="bg-slate-50 border-dashed">
        <CardContent className="p-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
              placeholder="Buscar por habilidad (ej. React, Python, Diseño UI)..." 
              className="pl-10 h-12 rounded-full text-lg shadow-sm"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] rounded-2xl" />
          ))
        ) : candidates?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-lg">No se encontraron candidatos con esa habilidad.</p>
          </div>
        ) : (
          candidates?.map((candidate, idx) => (
            <Card key={idx} className="flex flex-col hover:border-primary/50 transition-colors overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-purple-500"></div>
              <CardHeader className="pb-4 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden">
                  {antiBias ? (
                    <span className="text-2xl font-bold text-slate-400">?</span>
                  ) : (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.anonymousId}`} alt="Avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <CardTitle className="text-xl">
                  {antiBias ? `Candidato ${String.fromCharCode(65 + idx)}` : `Usuario ${candidate.anonymousId.substring(0, 4)}`}
                </CardTitle>
                <div className="flex justify-center mt-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold text-sm px-3 py-1">
                    <Zap className="w-3.5 h-3.5 mr-1" /> {candidate.score} HP
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-sm border-y py-3">
                    <div>
                      <div className="font-bold text-slate-900">{candidate.projectCount}</div>
                      <div className="text-xs text-slate-500">Proyectos</div>
                    </div>
                    <div className="border-x">
                      <div className="font-bold text-slate-900">{candidate.validationCount}</div>
                      <div className="text-xs text-slate-500">Validados</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{candidate.sarCount}</div>
                      <div className="text-xs text-slate-500">Casos SAR</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Habilidades Destacadas</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.topSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="bg-slate-50 text-slate-600 font-medium">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 p-4 border-t bg-slate-50/50 flex gap-2">
                <Button variant="outline" className="flex-1" disabled>
                  {antiBias ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  Ver Perfil
                </Button>
                <Button className="flex-1" onClick={handleSave}>
                  <UserPlus className="w-4 h-4 mr-2" /> Guardar
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
