import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Inbox, CheckCircle, XCircle, Eye, Trophy, Users, Code, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type ApplicationItem = {
  id: number;
  microprojectId: number;
  microprojectTitle: string;
  companyName: string;
  studentId: number;
  anonymousAlias: string;
  proposal: string;
  deliverableUrl: string | null;
  feedback: string | null;
  position: string | null;
  hikePointsAwarded: number | null;
  status: "pending" | "accepted" | "rejected";
  topSkills: string[];
  projectCount: number;
  sarCount: number;
  validationCount: number;
  studentName: string;
  createdAt: string;
};

function useRecruiterApplications() {
  return useQuery<ApplicationItem[]>({
    queryKey: ["/api/recruiter/applications"],
    queryFn: () => customFetch("/api/recruiter/applications"),
  });
}

function useReviewApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, position, feedback }: { id: number; status: string; position?: string; feedback?: string }) =>
      customFetch(`/api/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, position, feedback }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/recruiter/applications"] }),
  });
}

const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "bg-amber-50 text-amber-700 border-amber-200" },
  accepted: { label: "Aprobada", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rechazada", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function Applications() {
  const { data: applications, isLoading } = useRecruiterApplications();
  const reviewMutation = useReviewApplication();
  const { toast } = useToast();

  const [selected, setSelected] = useState<ApplicationItem | null>(null);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject" | null>(null);
  const [position, setPosition] = useState("participant");
  const [feedback, setFeedback] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const openDialog = (app: ApplicationItem, mode: "approve" | "reject") => {
    setSelected(app);
    setDialogMode(mode);
    setPosition("participant");
    setFeedback("");
  };

  const handleSubmit = () => {
    if (!selected || !dialogMode) return;
    reviewMutation.mutate(
      {
        id: selected.id,
        status: dialogMode === "approve" ? "accepted" : "rejected",
        position: dialogMode === "approve" ? position : undefined,
        feedback: feedback || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: dialogMode === "approve" ? "Postulación aprobada" : "Postulación rechazada",
            description: dialogMode === "approve"
              ? "Los HikePoints han sido acreditados al candidato."
              : "El candidato ha sido notificado.",
          });
          setSelected(null);
          setDialogMode(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    );
  }

  const pending = applications?.filter(a => a.status === "pending") ?? [];
  const reviewed = applications?.filter(a => a.status !== "pending") ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Postulaciones Recibidas</h1>
        <p className="text-slate-500">Revisa y evalúa las entregas a tus microproyectos.</p>
      </div>

      {applications?.length === 0 ? (
        <Card className="border-dashed bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Inbox className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Bandeja de entrada vacía</h2>
            <p className="text-slate-500 max-w-md">
              Aún no has recibido postulaciones. Cuando los estudiantes apliquen a tus microproyectos, aparecerán aquí de forma anónima.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Pendientes de revisión ({pending.length})
              </h2>
              {pending.map(app => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  expanded={expandedId === app.id}
                  onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  onApprove={() => openDialog(app, "approve")}
                  onReject={() => openDialog(app, "reject")}
                />
              ))}
            </div>
          )}

          {reviewed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                Ya revisadas ({reviewed.length})
              </h2>
              {reviewed.map(app => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  expanded={expandedId === app.id}
                  onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  onApprove={() => openDialog(app, "approve")}
                  onReject={() => openDialog(app, "reject")}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={!!selected && !!dialogMode} onOpenChange={() => { setSelected(null); setDialogMode(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "approve" ? "Aprobar postulación" : "Rechazar postulación"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <p className="font-semibold text-slate-800">{selected?.anonymousAlias}</p>
              <p className="text-slate-500">{selected?.microprojectTitle}</p>
            </div>

            {dialogMode === "approve" && (
              <div className="space-y-2">
                <Label className="font-semibold">Posición obtenida</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">🥇 1er lugar</SelectItem>
                    <SelectItem value="2">🥈 2do lugar</SelectItem>
                    <SelectItem value="3">🥉 3er lugar</SelectItem>
                    <SelectItem value="participant">Participante (1 HP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-semibold">
                Feedback {dialogMode === "reject" ? "(obligatorio)" : "(opcional)"}
              </Label>
              <Textarea
                placeholder={dialogMode === "reject"
                  ? "Explica al candidato por qué fue rechazado y cómo puede mejorar..."
                  : "Menciona qué destacó de su propuesta (opcional)..."}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setSelected(null); setDialogMode(null); }}>
                Cancelar
              </Button>
              <Button
                className={cn("flex-1", dialogMode === "reject" && "bg-rose-600 hover:bg-rose-700")}
                onClick={handleSubmit}
                disabled={reviewMutation.isPending || (dialogMode === "reject" && !feedback.trim())}
              >
                {reviewMutation.isPending
                  ? "Guardando..."
                  : dialogMode === "approve" ? "Aprobar y acreditar HP" : "Rechazar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationCard({
  app, expanded, onToggle, onApprove, onReject,
}: {
  app: ApplicationItem;
  expanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const statusCfg = STATUS_CONFIG[app.status];
  const isPending = app.status === "pending";

  return (
    <Card className={cn("transition-all", isPending && "border-amber-200 bg-amber-50/30")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-slate-900">{app.anonymousAlias}</span>
              <Badge variant="outline" className={cn("text-xs font-semibold border", statusCfg.color)}>
                {statusCfg.label}
              </Badge>
              {app.hikePointsAwarded && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs font-bold">
                  <Trophy className="w-3 h-3 mr-1" />{app.hikePointsAwarded} HP acreditados
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">{app.microprojectTitle}</p>
          </div>
          <button onClick={onToggle} className="text-slate-400 hover:text-slate-600 mt-1">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5" />{app.projectCount} proyectos</span>
          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{app.sarCount} SAR</span>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{app.validationCount} validaciones</span>
        </div>

        {app.topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {app.topSkills.map(s => (
              <Badge key={s} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border border-blue-100">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 pb-4">
          <div className="border-t pt-4 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 mb-2">Propuesta enviada</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-100">
                {app.proposal}
              </p>
            </div>

            {app.deliverableUrl && (
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Entregable</p>
                <a href={app.deliverableUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-primary underline hover:text-primary/80">
                  {app.deliverableUrl}
                </a>
              </div>
            )}

            {app.feedback && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Feedback enviado</p>
                <p className="text-sm text-slate-700">{app.feedback}</p>
              </div>
            )}

            {isPending && (
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={onReject}>
                  <XCircle className="w-4 h-4" /> Rechazar
                </Button>
                <Button className="flex-1 gap-2" onClick={onApprove}>
                  <CheckCircle className="w-4 h-4" /> Aprobar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
