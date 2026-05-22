import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Check, ChevronRight, Briefcase, GraduationCap, Target, Globe, Laptop, RefreshCw, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const OBJECTIVES = [
  { id: "first_job", icon: Briefcase, label: "Busco mi primer empleo", desc: "Quiero conseguir mi primer trabajo formal" },
  { id: "career_change", icon: RefreshCw, label: "Quiero cambiar de carrera", desc: "Me estoy reinventando profesionalmente" },
  { id: "internship", icon: GraduationCap, label: "Busco prácticas pre-profesionales", desc: "Necesito experiencia mientras estudio" },
  { id: "remote", icon: Globe, label: "Trabajo remoto / freelance", desc: "Busco oportunidades desde cualquier lugar" },
  { id: "promotion", icon: Target, label: "Quiero mejorar mi posición actual", desc: "Ya trabajo y busco crecer" },
];

const AREAS = [
  "Tecnología / Software", "Diseño / UX", "Marketing Digital", "Finanzas / Contabilidad",
  "Datos / IA", "Salud / Biociencias", "Educación", "Negocios / Administración",
  "Derecho / Legal", "Agronomía / Medio Ambiente", "Ingeniería Civil / Industrial", "Comunicaciones",
];

const SKILLS_LIST = [
  "React", "Python", "JavaScript", "TypeScript", "Node.js", "SQL", "PostgreSQL",
  "Figma", "Adobe XD", "UX Research", "Git", "Docker", "Machine Learning",
  "Excel Avanzado", "Power BI", "Tableau", "SEO / SEM", "Google Ads",
  "Liderazgo", "Comunicación efectiva", "Trabajo en equipo", "Resolución de problemas",
  "Pensamiento crítico", "Gestión del tiempo", "Inglés B2+", "Portugués",
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();

  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const toggleArea = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
      setCustomSkill("");
    }
  };

  const canProceed = () => {
    if (step === 1) return !!selectedObjective;
    if (step === 2) return selectedAreas.length > 0;
    if (step === 3) return selectedSkills.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setLocation("/inicio");
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-primary">Paso {step} de {totalSteps}</span>
          <span className="text-sm text-slate-500">{Math.round((step / totalSteps) * 100)}% completado</span>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-2" />

        <div className="flex gap-2 mt-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-1 rounded-full transition-colors duration-300",
                i + 1 <= step ? "bg-primary" : "bg-slate-200"
              )}
            />
          ))}
        </div>
      </div>

      <Card className="w-full max-w-2xl border-none shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />

        <CardHeader className="text-center pt-8 pb-2">
          <div className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1">
            {step === 1 && "Tu objetivo"}
            {step === 2 && "Áreas de interés"}
            {step === 3 && "Tus habilidades base"}
            {step === 4 && "Todo configurado"}
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {step === 1 && "¿Qué buscas principalmente?"}
            {step === 2 && "¿En qué áreas te desarrollas?"}
            {step === 3 && "¿Qué habilidades ya tienes?"}
            {step === 4 && "¡Tu perfil HIKE está listo!"}
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1 && "Selecciona una opción que mejor describa tu situación actual"}
            {step === 2 && "Puedes elegir varias áreas — se usarán para personalizar tus microproyectos"}
            {step === 3 && "Selecciona las que ya dominas. Podrás añadir más y certificar niveles después"}
            {step === 4 && "Hemos personalizado tu dashboard con microproyectos y recomendaciones para ti"}
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-4">
          {step === 1 && (
            <div className="grid gap-3">
              {OBJECTIVES.map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedObjective(id)}
                  className={cn(
                    "w-full text-left px-5 py-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-200",
                    selectedObjective === id
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/20"
                      : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    selectedObjective === id ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">{label}</div>
                    <div className="text-sm text-slate-500">{desc}</div>
                  </div>
                  {selectedObjective === id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={cn(
                      "px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-center",
                      selectedAreas.includes(area)
                        ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/20"
                        : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    {selectedAreas.includes(area) && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                    {area}
                  </button>
                ))}
              </div>
              {selectedAreas.length > 0 && (
                <p className="text-xs text-slate-500 text-center mt-4">
                  {selectedAreas.length} área{selectedAreas.length !== 1 ? "s" : ""} seleccionada{selectedAreas.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {SKILLS_LIST.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full border-2 text-sm font-medium transition-all duration-200",
                      selectedSkills.includes(skill)
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    {selectedSkills.includes(skill) && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Input
                  placeholder="Agregar otra habilidad..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addCustomSkill} disabled={!customSkill.trim()}>
                  Agregar
                </Button>
              </div>

              {selectedSkills.length > 0 && (
                <p className="text-xs text-primary font-semibold text-center">
                  {selectedSkills.length} habilidad{selectedSkills.length !== 1 ? "es" : ""} seleccionada{selectedSkills.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200">
                <Check className="w-12 h-12 text-white" />
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                  <div className="text-xl font-extrabold text-blue-600">{selectedSkills.length}</div>
                  <div className="text-xs text-blue-500 font-medium">Habilidades</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                  <div className="text-xl font-extrabold text-purple-600">{selectedAreas.length}</div>
                  <div className="text-xs text-purple-500 font-medium">Áreas</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                  <div className="text-xl font-extrabold text-green-600">0</div>
                  <div className="text-xs text-green-500 font-medium">HikePoints</div>
                </div>
              </div>

              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Completa tu portafolio con proyectos reales, documenta experiencias SAR y postula a microproyectos para subir tu HikeScore y destacar ante los reclutadores.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50 border-t p-5 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="text-slate-600"
          >
            Atrás
          </Button>
          <Button
            onClick={handleNext}
            size="lg"
            className="px-8 font-bold gap-2"
            disabled={!canProceed()}
          >
            {step === totalSteps ? "Ir a mi Panel" : "Siguiente"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
