import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getChatSessions, getChatMessages, createChatSession, sendMessage, renameChatSession, deleteChatSession } from "@/server-actions/ai-tutor";
import {
  Bot, Send, Sparkles, MessageSquare, Plus, User, Copy, ThumbsUp, ThumbsDown,
  Code2, RefreshCw, Lightbulb, BookOpen, Loader2, Trash2, Pencil, Check, X, Search
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/_app/ai-tutor")({ component: AITutor });

const suggested = [
  { text: "Explain dynamic programming with a real-world example", icon: Lightbulb },
  { text: "How does TCP three-way handshake work?", icon: BookOpen },
  { text: "Walk me through building an LRU cache in Python", icon: Code2 },
  { text: "What's the difference between B-tree and B+ tree?", icon: Sparkles },
];

function renderContent(text: string) {
  return text.split("\n").map((line, j) => (
    <p key={j} className={j > 0 ? "mt-2" : ""}>
      {line.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, k) => {
        if (part.startsWith("**")) return <strong key={k}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("`")) return (
          <code key={k} className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-xs border border-border/40">
            {part.slice(1, -1)}
          </code>
        );
        return part;
      })}
    </p>
  ));
}

function AITutor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [optimisticUserMsg, setOptimisticUserMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastMessageSent, setLastMessageSent] = useState<string | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["ai_chat_sessions"],
    queryFn: async () => {
      if (!token) return [];
      return getChatSessions({ data: { token } });
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId && !sessionsLoading && !hasAutoSelected) {
      setActiveSessionId(sessions[0].id);
      setHasAutoSelected(true);
    }
  }, [sessions, activeSessionId, sessionsLoading, hasAutoSelected]);

  const { data: serverMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["ai_chat_messages", activeSessionId],
    queryFn: async () => {
      if (!activeSessionId || !token) return [];
      return getChatMessages({ data: { token, sessionId: activeSessionId } });
    },
    enabled: !!activeSessionId && !!token,
  });

  // Combine server messages with optimistic message if sending
  const messages = optimisticUserMsg 
    ? [...serverMessages, { role: "user", content: optimisticUserMsg }]
    : serverMessages;

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("No token");
      return createChatSession({ data: { token } });
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ["ai_chat_sessions"] });
      setActiveSessionId(newSession.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: string }) => {
      if (!token) throw new Error("No token");
      return sendMessage({ data: { token, sessionId, message } });
    },
    onSuccess: (data, variables) => {
      setOptimisticUserMsg(null);
      queryClient.invalidateQueries({ queryKey: ["ai_chat_messages", variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ["ai_chat_sessions"] });
    },
    onError: () => {
      setOptimisticUserMsg(null);
      setChatError("AI is temporarily unavailable. Connection lost.");
    }
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!token) throw new Error("No token");
      return deleteChatSession({ data: { token, sessionId } });
    },
    onSuccess: (data, deletedSessionId) => {
      queryClient.invalidateQueries({ queryKey: ["ai_chat_sessions"] });
      if (activeSessionId === deletedSessionId) {
        setActiveSessionId(null);
      }
    },
  });

  const renameSessionMutation = useMutation({
    mutationFn: async ({ sessionId, title }: { sessionId: string; title: string }) => {
      if (!token) throw new Error("No token");
      return renameChatSession({ data: { token, sessionId, title } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_chat_sessions"] });
      setEditingSessionId(null);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessageMutation.isPending]);

  // Focus input box on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async (textOverride?: string) => {
    const userMsg = (textOverride || input).trim();
    if (!userMsg || sendMessageMutation.isPending || createSessionMutation.isPending) return;
    
    setInput("");
    setOptimisticUserMsg(userMsg);
    setLastMessageSent(userMsg);
    setChatError(null);
    
    try {
      let targetSessionId = activeSessionId;
      if (!targetSessionId) {
        const newSession = await createSessionMutation.mutateAsync();
        targetSessionId = newSession.id;
        setActiveSessionId(targetSessionId);
      }
      
      sendMessageMutation.mutate({ sessionId: targetSessionId as string, message: userMsg });
    } catch (err: any) {
      setOptimisticUserMsg(null);
      setChatError("AI is temporarily unavailable. Connection lost.");
    }
  };

  const handleRetry = () => {
    if (lastMessageSent) {
      send(lastMessageSent);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setHasAutoSelected(true);
    setInput("");
    setOptimisticUserMsg(null);
    setChatError(null);
    setLastMessageSent(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Filter sessions by search query
  const filteredSessions = sessions.filter((s: any) => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <Card className="hidden overflow-hidden border-border/40 p-0 shadow-soft lg:flex lg:flex-col">
        <div className="p-3 border-b border-border/40 space-y-2">
          <Button onClick={startNewChat} className="w-full bg-gradient-primary shadow-elegant rounded-xl gap-2" size="sm">
            <Plus className="h-4 w-4" /> New chat
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs rounded-lg border-border/40 bg-muted/30 focus:bg-background"
            />
          </div>
        </div>
        <div className="p-3 overflow-y-auto flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-2 mb-2">Recent</div>
          <div className="space-y-1">
            {filteredSessions.map((h: any) => (
              <div
                key={h.id}
                className={`group relative flex items-center gap-2 rounded-xl p-2.5 transition-all ${
                  activeSessionId === h.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50"
                }`}
              >
                {editingSessionId === h.id ? (
                  <div className="flex w-full items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editTitleValue}
                      onChange={(e) => setEditTitleValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          renameSessionMutation.mutate({ sessionId: h.id, title: editTitleValue });
                        } else if (e.key === "Escape") {
                          setEditingSessionId(null);
                        }
                      }}
                      className="h-7 text-xs px-1.5 focus-visible:ring-1 focus-visible:ring-primary rounded"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded shrink-0 hover:bg-emerald-brand/10 hover:text-emerald-brand"
                      onClick={() => renameSessionMutation.mutate({ sessionId: h.id, title: editTitleValue })}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setEditingSessionId(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveSessionId(h.id)}
                      className="flex-1 min-w-0 text-left flex items-start gap-2"
                    >
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs">{h.title}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">
                          {new Date(h.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(h.id);
                          setEditTitleValue(h.title);
                        }}
                      >
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSessionMutation.mutate(h.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {filteredSessions.length === 0 && !sessionsLoading && (
              <div className="text-center text-xs text-muted-foreground py-4">No chats found.</div>
            )}
          </div>
        </div>
        <div className="mt-auto p-3 border-t border-border/40">
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
            <div className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3 w-3" /> Mentor Active
            </div>
            <p className="text-[11px] text-muted-foreground">Using your profile context to adapt.</p>
          </div>
        </div>
      </Card>

      {/* Chat area */}
      <Card className="flex flex-col overflow-hidden border-border/40 p-0 shadow-soft">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/40 p-4 shrink-0">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold">Adaptivly AI Tutor</div>
            <div className="text-xs text-emerald-brand flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-brand inline-block animate-pulse" />
              Online · Context Aware
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex gap-1.5 border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="h-3 w-3" /> {sessions.length} chats
            </Badge>
            <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Refresh" onClick={() => queryClient.invalidateQueries({ queryKey: ["ai_chat_sessions"] })}>
              <RefreshCw className={`h-4 w-4 ${sessionsLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((m: any, i: number) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {(m.role === "assistant" || m.role === "model") && (
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow self-start">
                  <Bot className="h-4.5 w-4.5" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                    : "bg-muted/50 border border-border/40"
                }`}
              >
                {renderContent(m.content)}
              </div>
              {m.role === "user" && (
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted border border-border/40 self-start">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {(sendMessageMutation.isPending || createSessionMutation.isPending || messagesLoading) && (
            <div className="flex gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="rounded-2xl bg-muted/50 border border-border/40 px-5 py-4 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="border-t border-border/40 p-4 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">
              Suggested prompts
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggested.map((s) => (
                <button
                  key={s.text}
                  onClick={() => send(s.text)}
                  className="flex items-start gap-2.5 rounded-xl border border-border/40 p-3 text-left text-xs transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <s.icon className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Handling */}
        {chatError && (
          <div className="mx-5 my-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
            <span>{chatError}</span>
            <Button size="sm" variant="outline" className="h-7 text-xs border-destructive/30 hover:bg-destructive/20 bg-background text-destructive" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/40 p-4 shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask anything about DSA, system design, concepts..."
              className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background"
            />
            <Button
              onClick={() => send()}
              disabled={!input.trim() || sendMessageMutation.isPending || createSessionMutation.isPending}
              className="h-12 w-12 rounded-xl bg-gradient-primary shadow-elegant p-0 shrink-0"
              aria-label="Send"
            >
              <Send className="h-4.5 w-4.5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
            AI responses are for learning purposes. Verify important information.
          </p>
        </div>
      </Card>
    </div>
  );
}
