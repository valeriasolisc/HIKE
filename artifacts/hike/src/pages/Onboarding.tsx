import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Check, ChevronRight, Briefcase, GraduationCap, Target, Globe, RefreshCw,
  Building2, Users, Search, Zap, Star, TrendingUp, ShieldCheck, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── STUDENT DATA ─────────────────────────────────────────── */
const S_OBJECTIVES = [
  { id: "first_job",     icon: Briefcase,     label: "Busco mi primer empleo",            desc: "Quiero conseguir mi primer trabajo formal" },
  { id: "internship",    icon: GraduationCap, label: "Busco prácticas pre-profesionales", desc: "Necesito experiencia mientras estudio" },
  { id: "career_change", icon: RefreshCw,     label: "Quiero cambiar de carrera",          desc: "Me estoy reinventando profesionalmente" },
  { id: "remote",        icon: Globe,         label: "Trabajo remoto / freelance",         desc: "Busco oportunidades desde cualquier lugar" },
  { id: "promotion",     icon: Target,        label: "Quiero mejorar mi posición actual",  desc: "Ya trabajo y busco crecer" },
];

const S_AREAS = [
  "Tecnología / Software", "Diseño / UX", "Marketing Digital", "Finanzas / Contabilidad",
  "Datos / IA", "Salud / Biociencias", "Educación", "Negocios / Administración",
  "Derecho / Legal", "Ingeniería Civil / Industrial", "Comunicaciones", "Agronomía",
];

const S_SKILLS = [
  "React", "Python", "JavaScript", "TypeScript", "Node.js", "SQL", "PostgreSQL",
  "Figma", "Adobe XD", "UX Research", "Git", "Docker", "Machine Learning",
  "Excel Avanzado", "Power BI", "Tableau", "SEO / SEM", "Google Ads",
  "Liderazgo", "Comunicación efectiva", "Trabajo en equipo", "Resolución de problemas",
  "Pensamiento crítico", "Gestión del tiempo", "Inglés B2+", "Portugués",
];

/* ─── RECRUITER DATA ───────────────────────────────────────── */
const R_OBJECTIVES = [
  { id: "junior",       icon: Search,       label: "Busco talento junior con potencial",      desc: "Perfiles en formación que se destacan por habilidades y motivación" },
  { id: "practicante",  icon: GraduationCap, label: "Necesito practicantes o trainees",         desc: "Estudiantes universitarios en búsqueda de experiencia real" },
  { id: "retos",        icon: Zap,           label: "Quiero evaluar talento mediante retos",    desc: "Publicar microproyectos para ver cómo resuelven problemas reales" },
  { id: "cantera",      icon: Building2,     label: "Quiero construir una cantera de talento",  desc: "Identificar futuros líderes y mantener contacto con ellos" },
];

const R_INDUSTRIES = [
  "Fintech / Pagos digitales", "E-commerce / Retail", "Educación / EdTech",
  "Salud / HealthTech", "Logística / Supply Chain", "Marketing / Publicidad",
  "Banca / Seguros", "Consumo masivo", "Tecnología / SaaS", "Minería / Energía",
  "Consultoría", "Startup / Venture",
];

const R_SKILLS = [
  "React", "Python", "Node.js", "TypeScript", "SQL / PostgreSQL", "Machine Learning",
  "Figma / UX", "DevOps / Docker", "AWS / Cloud", "Data Analysis",
  "Power BI / Tableau", "SEO / SEM", "Product Management", "Ventas / CRM",
  "Comunicación efectiva", "Liderazgo", "Gestión de proyectos", "Inglés avanzado",
];

const R_GOALS = [
  { id: "bias",    icon: ShieldCheck, label: "Eliminar sesgos en selección",      desc: "Evaluar talento solo por mérito y skills" },
  { id: "speed",   icon: Zap,         label: "Reducir tiempo de contratación",    desc: "El proceso actual es demasiado lento" },
  { id: "reach",   icon: Search,      label: "Ampliar el alcance de búsqueda",    desc: "No llego a los perfiles que realmente necesito" },
  { id: "quality", icon: Trophy,      label: "Mejorar calidad de candidatos",     desc: "Quiero ver habilidades validadas, no solo CVs" },
  { id: "brand",   icon: Building2,   label: "Fortalecer employer branding",      desc: "Atraer talento con nuestra cultura y proyectos" },
];

/* ─── SHARED COMPONENTS ─────────────────────────────────────── */
function StepIndicator({ step, total, accent }: { step: number; total: number; accent?: string }) {
  return (
    <div className="w-full max-w-2xl mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className={cn("text-sm font-bold", accent || "text-primary")}>Paso {step} de {total}</span>
        <span className="text-sm text-slate-500">{Math.round((step / total) * 100)}% completado</span>
      </div>
      <Progress value={(step / total) * 100} className="h-2" />
      <div className="flex gap-2 mt-3">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={cn(
            "flex-1 h-1 rounded-full transition-colors duration-300",
            i + 1 <= step ? (accent ? "bg-indigo-500" : "bg-primary") : "bg-slate-200"
          )} />
        ))}
      </div>
    </div>
  );
}

function SelectableCard({ selected, onClick, icon: Icon, label, desc }: {
  selected: boolean; onClick: () => void; icon: React.ElementType; label: string; desc: string;
}) {
  return (
    <button type="button" onClick={onClick} className={cn(
      "w-full text-left px-5 py-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-200",
      selected
        ? "border-primary bg-primary/5 shadow-sm shadow-primary/20"
        : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
        selected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900">{label}</div>
        <div className="text-sm text-slate-500">{desc}</div>
      </div>
      {selected && (
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
}

function TogglePill({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={cn(
      "px-3.5 py-1.5 rounded-full border-2 text-sm font-medium transition-all duration-200",
      selected
        ? "border-primary bg-primary text-white shadow-sm"
        : "border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:text-primary"
    )}>
      {selected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
      {children}
    </button>
  );
}

function ToggleChip({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={cn(
      "px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-center",
      selected
        ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10"
        : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50 text-slate-700"
    )}>
      {selected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
      {children}
    </button>
  );
}

/* ─── STUDENT ONBOARDING ────────────────────────────────────── */
function StudentOnboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const [objective, setObjective] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const TOTAL = 4;

  const toggleArea = (a: string) =>
    setAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const toggleSkill = (s: string) =>
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const addCustom = () => {
    const t = customSkill.trim();
    if (t && !skills.includes(t)) { setSkills(p => [...p, t]); setCustomSkill(""); }
  };

  const canProceed = () => {
    if (step === 1) return !!objective;
    if (step === 2) return areas.length > 0;
    if (step === 3) return skills.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center justify-center p-4">
      <StepIndicator step={step} total={TOTAL} />

      <Card className="w-full max-w-2xl border-none shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-primary to-purple-500" />

        <CardHeader className="text-center pt-8 pb-2">
          <div className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1">
            {["Tu objetivo", "Áreas de interés", "Tus habilidades base", "Todo configurado"][step - 1]}
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {step === 1 && "¿Qué buscas principalmente?"}
            {step === 2 && "¿En qué áreas te desarrollas?"}
            {step === 3 && "¿Qué habilidades ya tienes?"}
            {step === 4 && "¡Tu perfil HIKE está listo!"}
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1 && "Selecciona la opción que mejor describe tu situación actual"}
            {step === 2 && "Puedes elegir varias — se usarán para personalizar tus microproyectos"}
            {step === 3 && "Selecciona las que ya dominas. Podrás añadir más y certificar niveles después"}
            {step === 4 && "Hemos configurado tu dashboard con microproyectos y recomendaciones para ti"}
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-4">
          {step === 1 && (
            <div className="grid gap-3">
              {S_OBJECTIVES.map(o => (
                <SelectableCard key={o.id} selected={objective === o.id}
                  onClick={() => setObjective(o.id)} icon={o.icon} label={o.label} desc={o.desc} />
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {S_AREAS.map(a => (
                  <ToggleChip key={a} selected={areas.includes(a)} onClick={() => toggleArea(a)}>{a}</ToggleChip>
                ))}
              </div>
              {areas.length > 0 && (
                <p className="text-xs text-slate-500 text-center mt-4">
                  {areas.length} área{areas.length !== 1 ? "s" : ""} seleccionada{areas.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {S_SKILLS.map(s => (
                  <TogglePill key={s} selected={skills.includes(s)} onClick={() => toggleSkill(s)}>{s}</TogglePill>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Input placeholder="Agregar otra habilidad..." value={customSkill}
                  onChange={e => setCustomSkill(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())}
                  className="flex-1" />
                <Button type="button" variant="outline" onClick={addCustom} disabled={!customSkill.trim()}>
                  Agregar
                </Button>
              </div>
              {skills.length > 0 && (
                <p className="text-xs text-primary font-semibold text-center">
                  {skills.length} habilidad{skills.length !== 1 ? "es" : ""} seleccionada{skills.length !== 1 ? "s" : ""}
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
                  <div className="text-xl font-extrabold text-blue-600">{skills.length}</div>
                  <div className="text-xs text-blue-500 font-medium">Habilidades</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                  <div className="text-xl font-extrabold text-purple-600">{areas.length}</div>
                  <div className="text-xs text-purple-500 font-medium">Áreas</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                  <div className="text-xl font-extrabold text-green-600">0</div>
                  <div className="text-xs text-green-500 font-medium">HikePoints</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Completa tu portafolio, documenta experiencias SAR y postula a microproyectos para subir tu HikeScore y destacar ante los reclutadores.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50 border-t p-5 flex justify-between">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="text-slate-600">
            Atrás
          </Button>
          <Button onClick={() => step < TOTAL ? setStep(s => s + 1) : setLocation("/inicio")}
            size="lg" className="px-8 font-bold gap-2" disabled={!canProceed()}>
            {step === TOTAL ? "Ir a mi Panel" : "Siguiente"} <ChevronRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ─── RECRUITER ONBOARDING ──────────────────────────────────── */
function RecruiterOnboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const [objective, setObjective] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([]);
  const [goal, setGoal] = useState<string | null>(null);
  const TOTAL = 5;

  const toggleIndustry = (i: string) =>
    setIndustries(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  const toggleSkill = (s: string) =>
    setSkillsNeeded(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const canProceed = () => {
    if (step === 1) return !!objective;
    if (step === 2) return !!companyName.trim();
    if (step === 3) return industries.length > 0;
    if (step === 4) return skillsNeeded.length > 0 && !!goal;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex flex-col items-center justify-center p-4">
      <StepIndicator step={step} total={TOTAL} accent="text-indigo-600" />

      <Card className="w-full max-w-2xl border-none shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <CardHeader className="text-center pt-8 pb-2">
          <div className="text-xs font-bold text-indigo-500/70 uppercase tracking-widest mb-1">
            {["Tu objetivo", "Tu empresa", "Sectores", "Habilidades y objetivo", "Todo listo"][step - 1]}
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {step === 1 && "¿Cuál es tu objetivo de contratación?"}
            {step === 2 && "¿A qué empresa representas?"}
            {step === 3 && "¿En qué sectores opera tu empresa?"}
            {step === 4 && "¿Qué priorizas al evaluar talento?"}
            {step === 5 && "¡Tu cuenta HIKE está lista!"}
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1 && "Selecciona el objetivo que mejor describe lo que buscas como reclutador"}
            {step === 2 && "Esta información aparecerá en tus microproyectos y búsquedas de talento"}
            {step === 3 && "Te mostraremos talento especializado en tu industria"}
            {step === 4 && "Configura tus filtros de búsqueda y define tu objetivo principal en HIKE"}
            {step === 5 && "Tu panel está configurado con el modo anti-sesgo activo por defecto"}
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-4">
          {step === 1 && (
            <div className="grid gap-3">
              {R_OBJECTIVES.map(o => (
                <SelectableCard key={o.id} selected={objective === o.id}
                  onClick={() => setObjective(o.id)} icon={o.icon} label={o.label} desc={o.desc} />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Nombre de la empresa <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="Ej: Culqi, Platzi, Yape, Rappi..."
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="text-base h-12"
                  autoFocus
                />
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3">
                <Building2 className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-indigo-800">
                  <p className="font-semibold mb-1.5">¿Por qué HIKE para reclutadores?</p>
                  <ul className="space-y-1 text-indigo-700 list-disc list-inside text-xs leading-relaxed">
                    <li>Evalúa talento por <strong>mérito real</strong>, no por universidad ni apellido</li>
                    <li>Publica microproyectos y mira cómo los candidatos <strong>resuelven problemas reales</strong></li>
                    <li>Modo anti-sesgo activo: los perfiles son anónimos hasta que tú decidas revelarlos</li>
                    <li>Accede a talento joven peruano con habilidades verificadas y HikeScore objetivo</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {R_INDUSTRIES.map(i => (
                  <ToggleChip key={i} selected={industries.includes(i)} onClick={() => toggleIndustry(i)}>{i}</ToggleChip>
                ))}
              </div>
              {industries.length > 0 && (
                <p className="text-xs text-slate-500 text-center mt-4">
                  {industries.length} sector{industries.length !== 1 ? "es" : ""} seleccionado{industries.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Habilidades que más valoras en un candidato
                </p>
                <div className="flex flex-wrap gap-2">
                  {R_SKILLS.map(s => (
                    <TogglePill key={s} selected={skillsNeeded.includes(s)} onClick={() => toggleSkill(s)}>{s}</TogglePill>
                  ))}
                </div>
                {skillsNeeded.length > 0 && (
                  <p className="text-xs text-indigo-600 font-semibold mt-3">
                    {skillsNeeded.length} habilidad{skillsNeeded.length !== 1 ? "es" : ""} seleccionada{skillsNeeded.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  ¿Cuál es tu objetivo principal al usar HIKE?
                </p>
                <div className="grid gap-2">
                  {R_GOALS.map(g => (
                    <SelectableCard key={g.id} selected={goal === g.id}
                      onClick={() => setGoal(g.id)} icon={g.icon} label={g.label} desc={g.desc} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
                <Check className="w-12 h-12 text-white" />
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-left space-y-3 max-w-sm mx-auto">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Resumen de tu configuración</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-slate-800">{companyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-600">
                      Objetivo: <strong>{R_OBJECTIVES.find(o => o.id === objective)?.label}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-600">
                      {industries.length} sector{industries.length !== 1 ? "es" : ""} · {skillsNeeded.length} habilidades clave
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-600">Modo anti-sesgo <strong>activado</strong> por defecto</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Publica microproyectos, busca talento anónimo y contrata por mérito. El talento peruano te está esperando.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50 border-t p-5 flex justify-between">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="text-slate-600">
            Atrás
          </Button>
          <Button
            onClick={() => step < TOTAL ? setStep(s => s + 1) : setLocation("/panel")}
            size="lg"
            className="px-8 font-bold gap-2 bg-indigo-600 hover:bg-indigo-700"
            disabled={!canProceed()}
          >
            {step === TOTAL ? "Ir a mi Panel" : "Siguiente"} <ChevronRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ─── ROOT EXPORT ───────────────────────────────────────────── */
export default function Onboarding() {
  const { user } = useAuth();
  const isRecruiter = user?.role === "recruiter";
  return isRecruiter ? <RecruiterOnboarding /> : <StudentOnboarding />;
}
