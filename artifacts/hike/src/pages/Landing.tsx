import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, Target, Users, User } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Landing() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 3) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const employabilityScore = selectedSkills.length * 33;
  
  const getLevelMessage = () => {
    if (employabilityScore === 0) return "Selecciona habilidades para descubrir tu nivel.";
    if (employabilityScore < 50) return "Nivel Junior. ¡Un buen comienzo! Sigue desarrollando estas habilidades.";
    if (employabilityScore < 90) return "Nivel Competitivo. Tienes un perfil atractivo para las empresas.";
    return "Top Talent. ¡Estás listo para destacar en cualquier proceso de selección!";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="HIKE Logo" className="h-8 w-8" />
            <span className="font-bold text-xl text-primary tracking-tight">HIKE</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild className="rounded-full shadow-md hover:shadow-lg transition-all">
              <Link href="/registro">Únete Gratis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              La nueva forma de mostrar tu talento
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Tu identidad <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">profesional</span>, validada.
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Sube de nivel, demuestra lo que sabes hacer y conecta con empresas que valoran el talento real por encima del currículum tradicional.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                <Link href="/registro">Soy Estudiante</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg h-14 px-8 rounded-full">
                <Link href="/registro?role=recruiter">Soy Reclutador</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-3xl blur-3xl -z-10 transform rotate-6 scale-105"></div>
            <img 
              src="/hero-illustration.png" 
              alt="Jóvenes profesionales escalando la montaña del éxito" 
              className="w-full h-auto rounded-2xl shadow-2xl object-cover border border-white/50"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">El mercado laboral está roto. Lo estamos arreglando.</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Conoce la realidad del talento joven en Perú y cómo HIKE cambia las reglas del juego.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: "72%", text: "Jóvenes sin empleo formal", desc: "Enfrentan barreras de entrada por falta de contactos." },
              { stat: "14.2", text: "Meses para primer empleo", desc: "El tiempo promedio de búsqueda tras egresar." },
              { stat: "78%", text: "Ofertas exigen experiencia", desc: "La paradoja: necesitas experiencia para ganar experiencia." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border text-center hover-elevate transition-all">
                <div className="text-5xl font-extrabold text-primary mb-2">{item.stat}</div>
                <h3 className="font-bold text-lg mb-2">{item.text}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tool */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl"></div>
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">Test de Empleabilidad</h2>
                <p className="text-slate-300 mb-8">Selecciona 3 habilidades que dominas y descubre tu nivel de empleabilidad en el mercado actual según el algoritmo de HIKE.</p>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  {["React", "Python", "Liderazgo", "Figma", "Inglés B2", "Resolución de Problemas", "Análisis de Datos", "SQL"].map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      disabled={selectedSkills.length >= 3 && !selectedSkills.includes(skill)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        selectedSkills.includes(skill) 
                          ? "bg-primary border-primary text-white" 
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
                <div className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {employabilityScore}%
                </div>
                <Progress value={employabilityScore} className="h-3 mb-6 bg-white/10" />
                <h3 className="text-xl font-bold mb-2">
                  {employabilityScore === 0 ? "Nivel por descubrir" : 
                   employabilityScore < 50 ? "Junior" : 
                   employabilityScore < 90 ? "Competitivo" : "Top Talent"}
                </h3>
                <p className="text-slate-300 text-sm min-h-[40px]">{getLevelMessage()}</p>
                
                <Button className="w-full mt-8 rounded-full bg-white text-slate-900 hover:bg-slate-100" asChild>
                  <Link href="/registro">Validar mi perfil real</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Cómo funciona HIKE</h2>
            <p className="text-slate-600 mt-4">Un camino claro desde tu primer proyecto hasta tu primer empleo.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-10"></div>
            
            {[
              { icon: User, title: "1. Crea tu perfil", desc: "Regístrate y destaca tus habilidades, proyectos y logros." },
              { icon: Target, title: "2. Resuelve Retos", desc: "Participa en microproyectos reales de empresas top." },
              { icon: TrendingUp, title: "3. Sube tu Score", desc: "Gana HikePoints (HP) y mejora tu nivel de empleabilidad." },
              { icon: ShieldCheck, title: "4. Consigue Ofertas", desc: "Sé descubierto en modo anti-sesgo por tu mérito real." }
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-md border mb-6 relative z-10 text-primary">
                  <step.icon size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="HIKE" className="h-8 w-8 brightness-0 invert" />
              <span className="font-bold text-xl text-white">HIKE</span>
            </div>
            <p className="text-sm max-w-sm">
              Plataforma de identidad profesional para jóvenes peruanos. Validamos el talento a través del mérito y la práctica.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/registro" className="hover:text-white transition-colors">Para Estudiantes</Link></li>
              <li><Link href="/registro?role=recruiter" className="hover:text-white transition-colors">Para Empresas</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Microproyectos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacidad</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          &copy; {new Date().getFullYear()} HIKE. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
