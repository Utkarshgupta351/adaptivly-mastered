import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bot, Send, Sparkles, MessageSquare, Plus, User, Copy, ThumbsUp, ThumbsDown,
  Code2, RefreshCw, Lightbulb, BookOpen,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/_app/ai-tutor")({ component: AITutor });

const suggested = [
  { text: "Explain dynamic programming with a real-world example", icon: Lightbulb },
  { text: "How does TCP three-way handshake work?", icon: BookOpen },
  { text: "Walk me through building an LRU cache in Python", icon: Code2 },
  { text: "What's the difference between B-tree and B+ tree?", icon: Sparkles },
];

const history = [
  { title: "Explain Dijkstra's algorithm", when: "2h ago" },
  { title: "Difference between OS threads and processes", when: "Yesterday" },
  { title: "How to design a URL shortener", when: "2 days ago" },
  { title: "Kadane's algorithm walkthrough", when: "3 days ago" },
  { title: "ACID properties explained", when: "5 days ago" },
];

const INIT_MESSAGES = [
  { role: "user", content: "Explain dynamic programming in simple terms" },
  {
    role: "assistant",
    content: "Dynamic programming is like solving a big puzzle by first solving smaller versions of it, then reusing those answers.\n\n**Two key ideas:**\n\n1. **Overlapping subproblems** — the same smaller puzzle shows up multiple times\n2. **Optimal substructure** — the best answer to the big puzzle is built from the best answers to the small ones\n\nA classic example is computing Fibonacci numbers. Instead of recomputing `fib(5)` every time you need it, you compute it once and store the result — this is called **memoization**.",
  },
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
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeHistory, setActiveHistory] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Great question! Let me break that down step by step...\n\nThis is a fundamental concept that comes up frequently in technical interviews. Here's a clear explanation:\n\n**Key insight:** Always start by identifying the pattern, then apply the approach systematically.",
        },
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <Card className="hidden overflow-hidden border-border/40 p-0 shadow-soft lg:flex lg:flex-col">
        <div className="p-3 border-b border-border/40">
          <Button className="w-full bg-gradient-primary shadow-elegant rounded-xl gap-2" size="sm">
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-2 mb-2">Recent</div>
          <div className="space-y-0.5">
            {history.map((h, i) => (
              <button
                key={h.title}
                onClick={() => setActiveHistory(i)}
                className={`flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-all ${
                  activeHistory === i ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                }`}
              >
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{h.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{h.when}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-auto p-3 border-t border-border/40">
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
            <div className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3 w-3" /> Pro Model Active
            </div>
            <p className="text-[11px] text-muted-foreground">Using GPT-4 Turbo for deeper explanations.</p>
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
              Online · GPT-4 Turbo
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex gap-1.5 border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="h-3 w-3" /> 248 chats
            </Badge>
            <Button variant="ghost" size="icon" className="rounded-xl" aria-label="New chat">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
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
                {m.role === "assistant" && (
                  <div className="mt-4 flex gap-1 pt-2 border-t border-border/30">
                    <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-emerald-brand">
                      <ThumbsUp className="h-3 w-3" /> Good
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive">
                      <ThumbsDown className="h-3 w-3" /> Bad
                    </Button>
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted border border-border/40 self-start">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
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
        {messages.length <= 2 && (
          <div className="border-t border-border/40 p-4 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">
              Suggested prompts
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggested.map((s) => (
                <button
                  key={s.text}
                  onClick={() => setInput(s.text)}
                  className="flex items-start gap-2.5 rounded-xl border border-border/40 p-3 text-left text-xs transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <s.icon className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/40 p-4 shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask anything about DSA, system design, concepts..."
              className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background"
            />
            <Button
              onClick={send}
              disabled={!input.trim() || loading}
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
