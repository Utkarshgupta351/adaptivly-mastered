import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Binary, Cpu, Database, Network, Boxes, Wrench, Server, Globe, Brain,
  Search, ArrowRight, BookOpen, Sparkles, CheckCircle2, Play, Layers, FileCode, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, supabaseBrowser } from "@/hooks/use-auth";

export const Route = createFileRoute("/_app/subjects")({ component: Subjects });

interface SubjectModule {
  id: string;
  title: string;
  description: string;
  keyTopics: string[];
  problemId?: number;
}

interface SubjectDetail {
  name: string;
  icon: any;
  diff: "Easy" | "Medium" | "Hard";
  topicKey: string;
  color: string;
  bg: string;
  paths: string[];
  description: string;
  modules: SubjectModule[];
}

const ALL_SUBJECTS: SubjectDetail[] = [
  {
    name: "Data Structures & Algorithms",
    icon: Binary,
    diff: "Hard",
    topicKey: "Arrays",
    color: "text-primary",
    bg: "bg-primary/10",
    paths: ["FAANG Full Prep", "DSA Intensive"],
    description: "Master foundational and advanced data structures, algorithmic complexity, and problem-solving patterns.",
    modules: [
      { id: "dsa-1", title: "Arrays & Hashing", description: "Array traversal, hash tables, and frequency counts.", keyTopics: ["Two Sum", "Valid Anagram", "Contains Duplicate"], problemId: 1 },
      { id: "dsa-2", title: "Two Pointers & Sliding Window", description: "Optimizing space and time complexity using pointers.", keyTopics: ["Trapping Rain Water", "Container With Most Water"], problemId: 4 },
      { id: "dsa-3", title: "Linked Lists & Stacks", description: "Singly/doubly linked lists, stack operations, and recursion.", keyTopics: ["Merge Two Sorted Lists", "Valid Parentheses"], problemId: 7 },
      { id: "dsa-4", title: "Dynamic Programming", description: "Memoization, tabulation, and optimal substructure.", keyTopics: ["Climbing Stairs", "Maximum Subarray", "Coin Change"], problemId: 6 },
      { id: "dsa-5", title: "Trees & Graphs", description: "BFS, DFS, tree traversals, shortest path, and island connectivity.", keyTopics: ["Number of Islands", "Tree Traversal"], problemId: 10 },
    ],
  },
  {
    name: "Operating Systems",
    icon: Cpu,
    diff: "Medium",
    topicKey: "OS",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    paths: ["FAANG Full Prep"],
    description: "Understand process scheduling, concurrency, deadlocks, virtual memory, and system calls.",
    modules: [
      { id: "os-1", title: "Processes & Threads", description: "Process states, context switching, CPU scheduling algorithms.", keyTopics: ["Process State Transitions", "Round Robin Scheduling"] },
      { id: "os-2", title: "Concurrency & Synchronization", description: "Mutexes, semaphores, race conditions, and Producer-Consumer problem.", keyTopics: ["Producer-Consumer Problem", "Dining Philosophers"] },
      { id: "os-3", title: "Memory Management", description: "Paging, segmentation, TLB, page replacement algorithms.", keyTopics: ["LRU Cache Page Replacement", "Virtual Memory"] },
    ],
  },
  {
    name: "DBMS & Databases",
    icon: Database,
    diff: "Medium",
    topicKey: "Databases",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    paths: ["FAANG Full Prep", "System Design Pro", "Full Stack Dev"],
    description: "Learn relational database design, SQL optimization, ACID transactions, and indexing.",
    modules: [
      { id: "db-1", title: "SQL & Query Optimization", description: "Complex joins, aggregations, window functions, and indexing.", keyTopics: ["SQL Joins & Grouping", "B-Tree Indexing"] },
      { id: "db-2", title: "Transactions & ACID", description: "Isolation levels, locks, MVCC, and crash recovery.", keyTopics: ["ACID Guarantees", "Write-Ahead Logging"] },
      { id: "db-3", title: "NoSQL & Distributed DBs", description: "Document stores, Key-Value stores, CAP theorem, and sharding.", keyTopics: ["Sharding Strategies", "Consistent Hashing"] },
    ],
  },
  {
    name: "Computer Networks",
    icon: Network,
    diff: "Medium",
    topicKey: "Networks",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    paths: ["FAANG Full Prep"],
    description: "Explore TCP/IP stack, HTTP protocols, DNS resolution, sockets, and network security.",
    modules: [
      { id: "net-1", title: "OSI Model & TCP/IP", description: "Layer breakdown, packet encapsulation, and routing protocols.", keyTopics: ["3-Way Handshake", "TCP vs UDP"] },
      { id: "net-2", title: "Application Protocols (HTTP/DNS)", description: "HTTP/1.1 vs HTTP/2 vs HTTP/3, DNS lookup flow, TLS handshake.", keyTopics: ["HTTPS TLS Handshake", "DNS Hierarchy"] },
    ],
  },
  {
    name: "OOP & LLD",
    icon: Boxes,
    diff: "Easy",
    topicKey: "OOP",
    color: "text-emerald-brand",
    bg: "bg-emerald-brand/10",
    paths: ["FAANG Full Prep", "DSA Intensive"],
    description: "Master Object-Oriented Design principles (SOLID), Design Patterns, and Low Level Design.",
    modules: [
      { id: "oop-1", title: "SOLID Principles & Core OOP", description: "Abstraction, Encapsulation, Inheritance, Polymorphism.", keyTopics: ["SOLID Principles", "Class Diagrams"] },
      { id: "oop-2", title: "Design Patterns", description: "Singleton, Factory, Observer, Strategy, Decorator patterns.", keyTopics: ["Factory Pattern", "Observer Pattern"] },
    ],
  },
  {
    name: "Software Engineering",
    icon: Wrench,
    diff: "Easy",
    topicKey: "SE",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    paths: ["Full Stack Dev"],
    description: "Agile methodologies, CI/CD pipelines, Git workflows, testing strategies, and refactoring.",
    modules: [
      { id: "se-1", title: "Git & Version Control", description: "Branching strategies, merging, rebasing, git bisect.", keyTopics: ["Git Rebase vs Merge", "Conventional Commits"] },
      { id: "se-2", title: "Testing & CI/CD", description: "Unit testing, integration testing, GitHub Actions, automated builds.", keyTopics: ["TDD Practices", "Pipeline Configuration"] },
    ],
  },
  {
    name: "System Design & Architecture",
    icon: Server,
    diff: "Hard",
    topicKey: "System Design",
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    paths: ["FAANG Full Prep", "System Design Pro"],
    description: "Design high-scale, distributed systems including load balancers, caches, queues, and storage.",
    modules: [
      { id: "sd-1", title: "Scalability & Load Balancing", description: "Horizontal vs vertical scaling, round-robin, least connections, CDN.", keyTopics: ["Load Balancer Algorithms", "CDN Edge Caching"] },
      { id: "sd-2", title: "Caching & Message Queues", description: "Redis, Memcached, Kafka, RabbitMQ, cache invalidation.", keyTopics: ["Cache-Aside Pattern", "Pub/Sub Queues"] },
    ],
  },
  {
    name: "Full Stack Web Dev",
    icon: Globe,
    diff: "Medium",
    topicKey: "Web",
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    paths: ["Full Stack Dev"],
    description: "Modern web architecture, React, Node.js, RESTful APIs, state management, and SSR.",
    modules: [
      { id: "web-1", title: "Frontend Frameworks & State", description: "React Virtual DOM, hooks, state management, routing.", keyTopics: ["React 19 Hooks", "SSR & Hydration"] },
      { id: "web-2", title: "REST & GraphQL APIs", description: "API design, authentication (JWT/OAuth), CORS, rate limiting.", keyTopics: ["REST Best Practices", "JWT Auth Flow"] },
    ],
  },
  {
    name: "AI & Machine Learning",
    icon: Brain,
    diff: "Hard",
    topicKey: "ML",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    paths: ["AI/ML Engineer"],
    description: "Machine learning fundamentals, neural networks, LLM fine-tuning, and prompt engineering.",
    modules: [
      { id: "ml-1", title: "ML Foundations & Regression", description: "Supervised/unsupervised learning, gradient descent, evaluation metrics.", keyTopics: ["Gradient Descent", "Precision & Recall"] },
      { id: "ml-2", title: "Deep Learning & LLMs", description: "Transformers, attention mechanisms, embeddings, RAG pipeline.", keyTopics: ["Attention Mechanism", "RAG Systems"] },
    ],
  },
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
  const [selectedSubject, setSelectedSubject] = useState<SubjectDetail | null>(null);

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
              onClick={() => setSelectedSubject(s)}
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
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 mb-2">
                <span>{solved} solved</span>
                <span className={`font-black text-sm ${pct >= 70 ? "text-emerald-brand" : pct >= 40 ? "text-amber-500" : "text-muted-foreground"}`}>
                  {pct}%
                </span>
              </div>
              <Progress value={pct} className="h-2" />
              <Button
                className="mt-5 w-full rounded-xl gap-2 group-hover:bg-gradient-primary group-hover:text-primary-foreground group-hover:shadow-elegant transition-all"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSubject(s);
                }}
              >
                <BookOpen className="h-4 w-4" /> View Subject Syllabus
                <ArrowRight className="h-3.5 w-3.5 ml-auto transition-transform group-hover:translate-x-1" />
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Subject Detail Modal */}
      {selectedSubject && (
        <Dialog open={!!selectedSubject} onOpenChange={(open) => if (!open) setSelectedSubject(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border-border/40 p-6">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${selectedSubject.bg}`}>
                  <selectedSubject.icon className={`h-6 w-6 ${selectedSubject.color}`} />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">{selectedSubject.name}</DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`text-xs ${diffColors[selectedSubject.diff]}`}>
                      {selectedSubject.diff}
                    </Badge>
                    <span className="text-xs text-muted-foreground">• {selectedSubject.modules.length} Modules</span>
                  </div>
                </div>
              </div>
              <DialogDescription className="text-sm text-muted-foreground pt-2">
                {selectedSubject.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Curriculum & Chapters
                </h4>
                <Button asChild size="sm" className="rounded-xl gap-1.5 bg-gradient-primary font-bold">
                  <Link to="/practice" search={{ topic: selectedSubject.topicKey }}>
                    <Play className="h-3.5 w-3.5" /> Practice Topic
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {selectedSubject.modules.map((mod, idx) => (
                  <div key={mod.id} className="rounded-xl border border-border/40 p-4 bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Module {idx + 1}</span>
                      {mod.problemId && (
                        <Link
                          to="/practice"
                          search={{ id: mod.problemId }}
                          className="inline-flex items-center text-xs text-emerald-brand hover:underline font-semibold gap-1"
                        >
                          <FileCode className="h-3.5 w-3.5" /> Practice Problem
                        </Link>
                      )}
                    </div>
                    <h5 className="font-bold text-sm">{mod.title}</h5>
                    <p className="text-xs text-muted-foreground">{mod.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mod.keyTopics.map((kt) => (
                        <Badge key={kt} variant="secondary" className="text-[10px] rounded-lg">
                          {kt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
