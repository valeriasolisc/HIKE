import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, MessageCircleOff } from "lucide-react";

export default function Messages() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-120px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mensajes</h1>
        <p className="text-slate-500">Comunícate con los candidatos de tu interés.</p>
      </div>

      <Card className="flex-1 border-dashed bg-slate-50 flex items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center text-center p-0">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <MessageCircleOff className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Bandeja vacía</h2>
          <p className="text-slate-500 max-w-md">Las conversaciones iniciadas aparecerán aquí.</p>
        </CardContent>
      </Card>
    </div>
  );
}
