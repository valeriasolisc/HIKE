import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Briefcase, GraduationCap, Target } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setLocation("/inicio"); // Assume student for now for demo purposes
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-primary">Paso {step} de 4</span>
          <span className="text-sm text-slate-500">{step * 25}% Completado</span>
        </div>
        <Progress value={step * 25} className="h-2" />
      </div>

      <Card className="w-full max-w-2xl border-none shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-2 bg-gradient-to-r from-primary to-purple-500"></div>
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl font-bold">
            {step === 1 && "¿Cuál es tu objetivo principal?"}
            {step === 2 && "¿En qué área te desarrollas?"}
            {step === 3 && "Selecciona tus habilidades base"}
            {step === 4 && "¡Todo listo para brillar!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {step === 1 && (
            <div className="grid gap-4">
              <Button variant="outline" className="h-24 justify-start px-6 text-lg hover:border-primary hover:bg-primary/5">
                <Briefcase className="w-8 h-8 mr-4 text-primary" />
                Busco mi primer empleo
              </Button>
              <Button variant="outline" className="h-24 justify-start px-6 text-lg hover:border-primary hover:bg-primary/5">
                <Target className="w-8 h-8 mr-4 text-primary" />
                Quiero cambiar de carrera
              </Button>
              <Button variant="outline" className="h-24 justify-start px-6 text-lg hover:border-primary hover:bg-primary/5">
                <GraduationCap className="w-8 h-8 mr-4 text-primary" />
                Busco prácticas pre-profesionales
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              {["Tecnología / Software", "Diseño / UX", "Marketing Digital", "Finanzas / Conta", "Datos / IA", "Salud / Bio", "Educación", "Negocios"].map((area) => (
                <Button key={area} variant="outline" className="h-16 hover:border-primary hover:bg-primary/5">
                  {area}
                </Button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {["React", "Python", "JavaScript", "SQL", "Liderazgo", "Comunicación", "Figma", "Inglés B2", "Node.js", "Git", "Resolución de Problemas"].map((skill) => (
                <Button key={skill} variant="outline" className="rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors">
                  {skill}
                </Button>
              ))}
              <div className="w-full text-center mt-6 text-sm text-slate-500">
                Podrás añadir más detalles y certificar tu nivel después.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-lg text-slate-600 max-w-md mx-auto">
                Tu perfil está configurado. Es hora de completar tu portafolio, añadir experiencias y subir tu HikeScore para destacar ante los reclutadores.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-6 flex justify-between">
          <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            Atrás
          </Button>
          <Button onClick={handleNext} size="lg" className="px-8 font-bold">
            {step === 4 ? "Ir a mi Panel" : "Siguiente"} <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
