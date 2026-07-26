import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Binary, Cpu, Database, Network, Boxes, Wrench, Code, Server, Layers3, Globe, Brain,
  Search, SlidersHorizontal, ArrowRight, BookOpen, Sparkles, Filter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, supabaseBrowser } from "@/hooks/use-auth";

export const Route = createFileRoute("/_app/subjects")({ component: Subjects });

const ALL_SUBJECTS = [
  { name: "Data Structures & Algorithms", icon: Binary, diff: "Hard", topicKey: "Arrays", color: "text-primary", bg: "bg-primary/10", paths: ["FAANG Full Prep", "DSA Intensive"] },
  { name: "Operating Systems", icon: Cpu, diff: "Medium", topicKey: "OS", color: "text-cyan-400", bg: "bg-cyan-400/10", paths: ["FAANG Full Prep"] },
  { name: "DBMS & Databases", icon: Database, diff: "Medium", topicKey: "Databases", color: "text-purple-400", bg: "bg-purple-400/10", paths: ["FAANG Full Prep", "System Design Pro", "Full Stack Dev"] },
  { name: "Computer Networks", icon: Network, diff: "Medium", topicKey: "Networks", color: "text-blue-400", bg: "bg-blue-400/10", paths: ["FAANG Full Prep"] },
  { name: "OOP & LLD", icon: Boxes, diff: "Easy", topicKey: "OOP", color: "text-emerald-brand", bg: "bg-emerald-brand/10", paths: ["FAANG Full Prep", "DSA Intensive"] },
  { name: "Software Engineering", icon: Wrench, diff: "Easy", topicKey: "SE", color: "text-yellow-400", bg: "bg-yellow-400/10", paths: ["Full Stack Dev"] },
  { name: "System Design & Architecture", icon: Server, diff: "Hard", topicKey: "System Design", color: "text-indigo-400", bg: "bg-indigo-400/10", paths: ["FAANG Full Prep", "System Design Pro"] },
  { name: "Full Stack Web Dev", icon: Globe, diff: "Medium", topicKey: "Web", color: "text-teal-400", bg: "bg-teal-400/10", paths: ["Full Stack Dev"] },
  { name: "AI & Machine Learning", icon: Brain, diff: "Hard", topicKey: "ML", color: "text-pink-400", bg: "bg-pink-400/10", paths: ["AI/ML Engineer"] },
];

const diffColors: Record<string, string> = {
  Easy: "border-emerald-brand/40 text-emerald-brand bg-emerald-brand/5",
  Medium: "border-amber-500/40 text-amber-600 bg-amber-500/5 dark:text-amber-400",
  Hard: "border-destructive/40 text-destructive bg-destructive/5",
};

function Subjects() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [learningPath, setLearningPath] = useState<string>("FAANG Full Prep");
  const [onlyPath, setOnlyPath] = useState<boolean>(true);
  const [solvedCounts, setSolvedCounts] = useState<Record<string, number>>({});
  const [totalCounts, setTotalCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;

    // Load user's profile path
    supabaseBrowser
      .from("profiles")
      .select("learning_path")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.learning_path) setLearningPath(data.learning_path);
      });

    // Load solved problem stats by topic
    Promise.all([
      supabaseBrowser.from("problems").select("topic"),
      supabaseBrowser.from("user_problem_status").select("problem_id, status").eq("user_id", user.id).eq("status", "solved"),
    ]).then(([problemsRes, statusRes]) => {
      const totals: Record<string, number> = {};
      (problemsRes.data ?? []).forEach((p: any) => {
        totals[p.topic] = (totals[p.topic] ?? 0) + 1;
      });
      setTotalCounts(totals);

      const solved: Record<string, number> = {};
      const solvedIds = new Set((statusRes.data ?? []).map((s: any) => s.problem_id));
      (problemsRes.data ?? []).forEach((p: any) => {
        if (solvedIds.has(p.id)) {
          solved[p.topic] = (solved[p.topic] ?? 0) + 1;
        }
      });
      setSolvedCounts(solved);
    });
  }, [user]);

  const filtered = ALL_SUBJECTS.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(query.toLowerCase());
    const matchesDiff = filter === "All" || s.diff === filter;
    const matchesPath = !onlyPath || s.paths.includes(learningPath);
    return matchesSearch && matchesDiff && matchesPath;
  });

  const totalSolvedAll = Object.values(solvedCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Subjects" description={`Tailored for your path: ${learningPath}.`}>
        <Button
          variant={onlyPath ? "default" : "outline"}
          className={`rounded-xl gap-2 ${onlyPath ? "bg-gradient-primary" : ""}`}
          onClick={() => setOnlyPath(!onlyPath)}
        >
          <Sparkles className="h-4 w-4" /> {onlyPath ? `Path: ${learningPath}` : "Showing All Subjects"}
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
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Solved</div>
          <div className="text-3xl font-black">{totalSolvedAll}</div>
          <div className="text-xs text-muted-foreground mt-1">problems completed across topics</div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Path</div>
          <div className="text-xl font-black">{learningPath}</div>
          <div className="text-xs text-emerald-brand mt-1">{filtered.length} subjects in path</div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subject Coverage</div>
          <div className="text-xl font-black">{filtered.length} / {ALL_SUBJECTS.length}</div>
          <div className="text-xs text-primary mt-1">topics in your roadmap</div>
        </div>
      </div>

      {/* Subject grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => {
          const solved = solvedCounts[s.topicKey] ?? 0;
          const total = totalCounts[s.topicKey] ?? 10;
          const pct = Math.min(Math.round((solved / Math.max(total, 1)) * 100), 100);

          return (
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
                <span>{solved} solved</span>
                <span className={`font-black text-sm ${pct >= 70 ? "text-emerald-brand" : pct >= 40 ? "text-amber-500" : "text-muted-foreground"}`}>
                  {pct}%
                </span>
              </div>
              <Progress value={pct} className="h-2" />
              <Button
                asChild
                className="mt-5 w-full rounded-xl gap-2 group-hover:bg-gradient-primary group-hover:text-primary-foreground group-hover:shadow-elegant transition-all"
                variant="outline"
              >
                <Link to="/practice">
                  <BookOpen className="h-4 w-4" /> Practice Topic
                  <ArrowRight className="h-3.5 w-3.5 ml-auto transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
