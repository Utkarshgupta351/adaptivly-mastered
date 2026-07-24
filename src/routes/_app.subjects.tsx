import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import {
  Binary, Cpu, Database, Network, Boxes, Wrench, Code, Server, Layers3, Globe, Brain,
  Search, SlidersHorizontal, ArrowRight, BookOpen,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/subjects")({ component: Subjects });

const subjects = [
  { name: "Data Structures & Algorithms", icon: Binary, diff: "Hard", pct: 68, solved: 234, total: 348, color: "text-primary", bg: "bg-primary/10" },
  { name: "Operating Systems", icon: Cpu, diff: "Medium", pct: 52, solved: 78, total: 150, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { name: "DBMS", icon: Database, diff: "Medium", pct: 74, solved: 92, total: 124, color: "text-purple-400", bg: "bg-purple-400/10" },
  { name: "Computer Networks", icon: Network, diff: "Medium", pct: 41, solved: 45, total: 110, color: "text-blue-400", bg: "bg-blue-400/10" },
  { name: "OOP Design", icon: Boxes, diff: "Easy", pct: 89, solved: 60, total: 68, color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
  { name: "Software Engineering", icon: Wrench, diff: "Easy", pct: 33, solved: 22, total: 66, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { name: "Compiler Design", icon: Code, diff: "Hard", pct: 18, solved: 12, total: 68, color: "text-red-400", bg: "bg-red-400/10" },
  { name: "Computer Architecture", icon: Layers3, diff: "Hard", pct: 24, solved: 15, total: 62, color: "text-orange-400", bg: "bg-orange-400/10" },
  { name: "System Design", icon: Server, diff: "Hard", pct: 45, solved: 28, total: 62, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { name: "Full Stack Dev", icon: Globe, diff: "Medium", pct: 62, solved: 108, total: 174, color: "text-teal-400", bg: "bg-teal-400/10" },
  { name: "AI & Machine Learning", icon: Brain, diff: "Hard", pct: 30, solved: 40, total: 134, color: "text-pink-400", bg: "bg-pink-400/10" },
];

const diffColors: Record<string, string> = {
  Easy: "border-emerald-brand/40 text-emerald-brand bg-emerald-brand/5",
  Medium: "border-amber-500/40 text-amber-600 bg-amber-500/5 dark:text-amber-400",
  Hard: "border-destructive/40 text-destructive bg-destructive/5",
};

function Subjects() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All" || s.diff === filter)
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Subjects" description="All CS fundamentals in one place. Pick a topic and start learning.">
        <Button variant="outline" className="rounded-xl gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filter
        </Button>
      </PageHeader>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            className="pl-9 rounded-xl border-border/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["All", "Easy", "Medium", "Hard"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={`rounded-xl text-xs ${filter === f ? "bg-gradient-primary shadow-elegant" : ""}`}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total solved</div>
          <div className="text-3xl font-black">{subjects.reduce((a, s) => a + s.solved, 0)}</div>
          <div className="text-xs text-muted-foreground mt-1">of {subjects.reduce((a, s) => a + s.total, 0)} problems</div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Strongest</div>
          <div className="text-xl font-black">OOP Design</div>
          <div className="text-xs text-emerald-brand mt-1">89% mastery</div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Needs focus</div>
          <div className="text-xl font-black">Compiler Design</div>
          <div className="text-xs text-destructive mt-1">18% mastery</div>
        </div>
      </div>

      {/* Subject grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <Card
            key={s.name}
            className="group relative overflow-hidden border-border/40 p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant hover:border-primary/30 cursor-pointer"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-all bg-gradient-primary" />
            <div className="relative flex items-start justify-between mb-4">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${s.bg} group-hover:scale-110 transition-transform`}>
                <s.icon className={`h-5.5 w-5.5 ${s.color}`} />
              </div>
              <Badge variant="outline" className={`text-xs ${diffColors[s.diff]}`}>{s.diff}</Badge>
            </div>
            <h3 className="font-bold leading-tight mb-1">{s.name}</h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 mb-2">
              <span>{s.solved} / {s.total} solved</span>
              <span className={`font-black text-sm ${s.pct >= 70 ? "text-emerald-brand" : s.pct >= 40 ? "text-amber-500" : "text-destructive"}`}>
                {s.pct}%
              </span>
            </div>
            <Progress value={s.pct} className="h-2" />
            <Button
              className="mt-5 w-full rounded-xl gap-2 group-hover:bg-gradient-primary group-hover:text-primary-foreground group-hover:shadow-elegant transition-all"
              variant="outline"
            >
              <BookOpen className="h-4 w-4" /> Study
              <ArrowRight className="h-3.5 w-3.5 ml-auto transition-transform group-hover:translate-x-1" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
