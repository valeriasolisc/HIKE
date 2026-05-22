import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircleOff, Send, MessageSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Conversation = {
  otherUserId: number;
  otherUserName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
};

function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["/api/messages"],
    queryFn: () => customFetch("/api/messages"),
    refetchInterval: 10000,
  });
}

function useMessages(userId: number | null) {
  return useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", userId],
    queryFn: () => customFetch(`/api/messages/conversation/${userId}`),
    enabled: userId !== null,
    refetchInterval: 5000,
  });
}

function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: number; content: string }) =>
      customFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId, content }),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["/api/messages/conversation", vars.receiverId] });
      qc.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
}

export default function Messages() {
  const { user } = useAuth();
  const { data: conversations, isLoading: convLoading } = useConversations();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: msgLoading } = useMessages(activeConvId);
  const sendMutation = useSendMessage();

  const activeConversation = conversations?.find(c => c.otherUserId === activeConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeConvId) return;
    sendMutation.mutate({ receiverId: activeConvId, content: inputText.trim() });
    setInputText("");
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  };

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-120px)] flex flex-col gap-0">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mensajes</h1>
        <p className="text-slate-500">Comunícate directamente con los candidatos.</p>
      </div>

      <div className="flex flex-1 min-h-0 rounded-2xl border shadow-sm overflow-hidden bg-white">
        {/* Sidebar */}
        <div className={cn(
          "w-full md:w-72 border-r flex flex-col bg-slate-50",
          activeConvId && "hidden md:flex"
        )}>
          <div className="p-4 border-b bg-white">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Conversaciones
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircleOff className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">Sin conversaciones</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.otherUserId}
                  onClick={() => setActiveConvId(conv.otherUserId)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b hover:bg-white transition-colors",
                    activeConvId === conv.otherUserId && "bg-white border-l-2 border-l-primary"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-sm truncate">
                      {conv.otherUserName}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">{formatDate(conv.lastMessageAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && (
                      <Badge className="ml-2 h-5 min-w-5 text-xs shrink-0 bg-primary text-white">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Selecciona una conversación</h3>
              <p className="text-slate-400 text-sm max-w-xs">
                Elige una conversación del panel izquierdo para ver los mensajes.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b bg-white flex items-center gap-3">
                <button
                  className="md:hidden p-1 rounded hover:bg-slate-100"
                  onClick={() => setActiveConvId(null)}
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {activeConversation?.otherUserName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{activeConversation?.otherUserName ?? `Usuario ${activeConvId}`}</p>
                  <p className="text-xs text-slate-400">Conversación activa</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {msgLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                        <Skeleton className="h-12 w-48 rounded-2xl" />
                      </div>
                    ))}
                  </div>
                ) : !messages || messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm">No hay mensajes aún. ¡Inicia la conversación!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={cn("flex gap-2", isMe ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          isMe
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                        )}>
                          <p>{msg.content}</p>
                          <p className={cn("text-[10px] mt-1", isMe ? "text-primary-foreground/60" : "text-slate-400")}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t">
                <div className="flex gap-3">
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                    className="flex-1"
                    disabled={sendMutation.isPending}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!inputText.trim() || sendMutation.isPending}
                    className="shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
