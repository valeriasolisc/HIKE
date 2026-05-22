import { Card, CardContent } from "@/components/ui/card";
import { FileText, Inbox } from "lucide-react";

export default function Applications() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Postulaciones Recibidas</h1>
        <p className="text-slate-500">Revisa las entregas a tus microproyectos.</p>
      </div>

      <Card className="border-dashed bg-slate-50">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Inbox className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Bandeja de entrada vacía</h2>
          <p className="text-slate-500 max-w-md">Aún no has recibido postulaciones a tus microproyectos. Cuando los estudiantes apliquen, aparecerán aquí de forma anónima para una evaluación justa.</p>
        </CardContent>
      </Card>
    </div>
  );
}
