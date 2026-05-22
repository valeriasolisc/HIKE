import { Card, CardContent } from "@/components/ui/card";
import { Users, BookmarkX } from "lucide-react";

export default function SavedCandidates() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Candidatos Guardados</h1>
        <p className="text-slate-500">Tu shortlist de talento prometedor.</p>
      </div>

      <Card className="border-dashed bg-slate-50">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <BookmarkX className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">No hay candidatos guardados</h2>
          <p className="text-slate-500 max-w-md">Explora el buscador de talento y guarda los perfiles que te interesen para revisarlos más tarde o iniciar una conversación.</p>
        </CardContent>
      </Card>
    </div>
  );
}
