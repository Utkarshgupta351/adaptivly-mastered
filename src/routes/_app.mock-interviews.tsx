import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import {
  Code2, Users, Binary, Server, FileText, Play, CheckCircle2, XCircle, Sparkles,
  Clock, Star, ArrowRight, Mic, Video, MessageSquare,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/mock-interviews")({ component: Mock });

const types = [
  {
    name: "Technical",
    desc: "General coding + CS fundamentals",
    icon: Code2,
    time: "45 min",
    color: "text-primary",
    bg: "bg-primary/10",
    difficulty: "Medium",
    count: 12,
  },
  {
    name: "HR / Behavioral",
    desc: "STAR method & culture fit",
    icon: Users,
    time: "30 min",
    color: "text-emerald-brand",
    bg: "bg-emerald-brand/10",
    difficulty: "Easy",
    count: 6,
  },
  {
    name: "DSA",
    desc: "Algorithms & data structures",
    icon: Binary,
    time: "60 min",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    difficulty: "Hard",
    count: 18,
  },
  {
    name: "System Design",
    desc: "High-level architecture & scale",
    icon: Server,
    time: "60 min",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    difficulty: "Hard",
    count: 8,
  },
  {
    name: "Resume Review",
    desc: "AI-powered feedback & scoring",
    icon: FileText,
    time: "15 min",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    difficulty: "Easy",
    count: 3,
  },
];

const results = [
  {
    name: "System Design — Design Twitter",
    type: "System Design",
    when: "Yesterday · 58 min",
    score: 86,
    status: "Passed",
    strengths: ["Clear API design", "Great scale reasoning", "Good tradeoff analysis"],
    weaknesses: ["Missed cache invalidation", "Vague on sharding"],
    suggestion: "Review consistent hashing & multi-region replication before your next interview.",
  },
  {
    name: "DSA — Graph problems",
    type: "DSA",
    when: "3 days ago · 45 min",
    score: 62,
    status: "Needs work",
    strengths: ["Good problem approach", "Correct BFS implementation"],
    weaknesses: ["Slow optimization", "Missed Dijkstra's edge case"],
    suggestion: "Practice weighted graph traversal and Bellman-Ford for negative edges.",
  },
];

const diffColors: Record<string, string> = {
  Easy: "border-emerald-brand/40 text-emerald-brand bg-emerald-brand/5",
  Medium: "border-amber-500/40 text-amber-600 bg-amber-500/5",
  Hard: "border-destructive/40 text-destructive bg-destructive/5",
};

function Mock() {
  return (
    <div className="space-y-6">
      <PageHeader title="Mock Interviews" description="Practice with realistic AI-driven interviews and get actionable feedback." />

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Star, label: "Avg score", value: "78 / 100", color: "text-primary", bg: "bg-primary/10" },
          { icon: Play, label: "Completed", value: "18 sessions", color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
          { icon: Clock, label: "Total time", value: "14h 22m", color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: MessageSquare, label: "Pending review", value: "2 sessions", color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
              </div>
            </div>
            <div className="text-xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Interview type cards */}
      <div>
        <h2 className="font-bold text-lg mb-4">Start a new interview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {types.map((t) => (
            <Card
              key={t.name}
              className="group border-border/40 p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant hover:border-primary/30"
            >
              <div className="flex items-start justify-between">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${t.bg} group-hover:scale-110 transition-transform`}>
                  <t.icon className={`h-5.5 w-5.5 ${t.color}`} />
                </div>
                <Badge variant="outline" className={`text-xs ${diffColors[t.difficulty]}`}>
                  {t.difficulty}
                </Badge>
              </div>
              <h3 className="mt-4 font-bold text-base">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.time}</span>
                  <span className="flex items-center gap-1"><Play className="h-3 w-3" />{t.count} done</span>
                </div>
                <Button size="sm" className="bg-gradient-primary rounded-xl gap-1.5 shadow-elegant">
                  <Play className="h-3.5 w-3.5" /> Start
                </Button>
              </div>
            </Card>
          ))}

          {/* Custom interview CTA */}
          <Card className="group border-dashed border-2 border-border/40 p-6 shadow-soft flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm">Custom interview</div>
              <div className="text-xs text-muted-foreground mt-0.5">Choose topics, difficulty & duration</div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl mt-1">Configure →</Button>
          </Card>
        </div>
      </div>

      {/* Modes */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Mic, title: "Voice mode", desc: "Real-time speech-to-text for spoken answers.", badge: "Beta", color: "text-purple-400", bg: "bg-purple-400/10" },
          { icon: Video, title: "Video mode", desc: "Simulate a real video call interview with the AI.", badge: "Pro", color: "text-blue-400", bg: "bg-blue-400/10" },
          { icon: Code2, title: "Live coding", desc: "Shared editor where the AI can see your code.", badge: "Popular", color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
        ].map((m) => (
          <Card key={m.title} className="border-border/40 p-5 shadow-soft flex items-start gap-4">
            <div className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 ${m.bg}`}>
              <m.icon className={`h-5 w-5 ${m.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{m.title}</span>
                <Badge variant="outline" className="text-[10px]">{m.badge}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent results */}
      <div>
        <h2 className="font-bold text-lg mb-4">Recent results</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {results.map((r) => (
            <Card key={r.name} className="border-border/40 p-6 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge
                    className={r.status === "Passed" ? "bg-emerald-brand/10 text-emerald-brand border-emerald-brand/30" : "border-amber-500/40 text-amber-600 bg-amber-500/10"}
                  >
                    {r.status}
                  </Badge>
                  <h3 className="mt-2 font-bold text-base leading-tight">{r.name}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">{r.when}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-4xl font-black ${r.score >= 80 ? "text-gradient" : ""}`}>{r.score}</div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>
              </div>
              <Progress value={r.score} className="mt-4 h-2" />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-brand mb-2">Strengths</div>
                  <ul className="space-y-1.5">
                    {r.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-1.5 text-xs">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-brand" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-2">To improve</div>
                  <ul className="space-y-1.5">
                    {r.weaknesses.map((s) => (
                      <li key={s} className="flex items-start gap-1.5 text-xs">
                        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary mb-1">
                  <Sparkles className="h-3 w-3" /> AI SUGGESTION
                </div>
                <p className="text-xs text-muted-foreground">{r.suggestion}</p>
              </div>

              <Button variant="outline" className="mt-4 w-full rounded-xl gap-2 text-sm">
                View full report <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
