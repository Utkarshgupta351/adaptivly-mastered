import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Lock, Clock, Sparkles, ArrowRight, Zap, BookOpen, Code2, Server, Brain } from "lucide-react";

export const Route = createFileRoute("/_app/learning-paths")({ component: LearningPaths });

const paths = [
  { name: "FAANG Full Prep", desc: "12-week adaptive DSA + System Design + Behavioral", weeks: 12, progress: 37, active: true },
  { name: "DSA Intensive", desc: "6-week deep dive on algorithms and data structures", weeks: 6, progress: 0 },
  { name: "System Design Pro", desc: "8-week program covering distributed systems", weeks: 8, progress: 0 },
];

const topics = [
  { name: "Arrays & Hashing", status: "done", diff: "Easy", time: "8h", problems: 25, icon: Code2 },
  { name: "Two Pointers", status: "done", diff: "Easy", time: "6h", problems: 18, icon: Code2 },
  { name: "Sliding Window", status: "done", diff: "Medium", time: "10h", problems: 20, icon: Code2 },
  { name: "Stack & Queues", status: "current", diff: "Medium", time: "12h", problems: 22, progress: 65, icon: Code2 },
  { name: "Binary Search", status: "next", diff: "Medium", time: "10h", problems: 20, icon: Code2 },
  { name: "Linked Lists", status: "next", diff: "Medium", time: "8h", problems: 15, icon: Code2 },
  { name: "Trees & BST", status: "locked", diff: "Hard", time: "16h", problems: 30, icon: Brain },
  { name: "Graphs", status: "locked", diff: "Hard", time: "20h", problems: 35, icon: Brain },
  { name: "Dynamic Programming", status: "locked", diff: "Hard", time: "24h", problems: 42, icon: Brain },
  { name: "System Design", status: "locked", diff: "Expert", time: "20h", problems: 15, icon: Server },
];

const diffColors: Record<string, string> = {
  Easy: "border-emerald-brand/40 text-emerald-brand",
  Medium: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  Hard: "border-destructive/40 text-destructive",
  Expert: "border-purple-500/40 text-purple-500",
};

function LearningPaths() {
  return (
    <div className="space-y-6">
      <PageHeader title="Learning Paths" description="Your adaptive roadmap to becoming interview-ready.">
        <Button variant="outline" className="rounded-xl">Switch path</Button>
        <Button className="bg-gradient-primary shadow-elegant rounded-xl gap-2">
          <Zap className="h-4 w-4" /> Continue
        </Button>
      </PageHeader>

      {/* Path selector */}
      <div className="grid gap-4 md:grid-cols-3">
        {paths.map((p) => (
          <Card
            key={p.name}
            className={`relative overflow-hidden border p-5 shadow-soft transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-elegant ${p.active ? "border-primary/50 bg-primary/5" : "border-border/40"}`}
          >
            {p.active && (
              <Badge className="absolute top-3 right-3 bg-gradient-primary text-[10px]">Active</Badge>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.weeks} weeks</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.desc}</p>
            {p.progress > 0 && (
              <>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-primary">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-1.5" />
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Active path overview */}
      <Card className="relative overflow-hidden border-0 p-0 shadow-elegant">
        <div className="absolute inset-0 bg-gradient-hero opacity-60" />
        <div className="relative p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="bg-gradient-primary gap-1.5 mb-3">
                <Sparkles className="h-3 w-3" /> Current Path
              </Badge>
              <h2 className="text-2xl font-black md:text-3xl">FAANG Software Engineer — Full Prep</h2>
              <p className="mt-2 text-muted-foreground text-sm">
                A 12-week adaptive program covering DSA, System Design, and behavioral rounds.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
                <div><span className="text-muted-foreground">Progress</span> <span className="ml-1 font-bold text-primary">37%</span></div>
                <div><span className="text-muted-foreground">Est. completion</span> <span className="ml-1 font-bold">Mar 24</span></div>
                <div><span className="text-muted-foreground">Level</span> <span className="ml-1 font-bold">Intermediate</span></div>
                <div><span className="text-muted-foreground">Topics done</span> <span className="ml-1 font-bold">3 / 10</span></div>
              </div>
            </div>
          </div>
          <Progress value={37} className="mt-6 h-2.5" />
        </div>
      </Card>

      {/* AI Recommendation */}
      <Card className="border-primary/30 bg-primary/5 p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-primary">Adaptive insight</div>
            <p className="text-sm text-muted-foreground mt-0.5">
              You're moving fast through arrays! We've unlocked a bonus track on advanced hashmaps.
              Your pace puts you 3 days ahead of schedule.
            </p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl shrink-0">Explore</Button>
        </div>
      </Card>

      {/* Topic list */}
      <div className="space-y-3">
        <h2 className="font-bold text-lg">Topics</h2>
        {topics.map((t, i) => {
          const isLocked = t.status === "locked";
          const isDone = t.status === "done";
          const isCurrent = t.status === "current";
          const isNext = t.status === "next";
          return (
            <Card
              key={t.name}
              className={`group border p-5 shadow-soft transition-all ${
                !isLocked && "hover:shadow-elegant hover:-translate-y-0.5"
              } ${isCurrent ? "border-primary/40 bg-primary/5" : "border-border/40"} ${
                isLocked ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-black ${
                      isDone
                        ? "bg-emerald-brand/15 text-emerald-brand"
                        : isCurrent
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : isLocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isLocked ? (
                      <Lock className="h-4.5 w-4.5" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{t.name}</div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline" className={`h-5 ${diffColors[t.diff]}`}>{t.diff}</Badge>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.time}</span>
                      <span className="flex items-center gap-1"><Code2 className="h-3 w-3" />{t.problems} problems</span>
                    </div>
                    {isCurrent && t.progress && (
                      <div className="mt-3 max-w-xs">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">In progress</span>
                          <span className="font-semibold text-primary">{t.progress}%</span>
                        </div>
                        <Progress value={t.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  disabled={isLocked}
                  className={`rounded-xl gap-1.5 shrink-0 ${isCurrent ? "bg-gradient-primary shadow-elegant" : ""}`}
                >
                  {isDone ? "Review" : isCurrent ? "Continue" : isLocked ? "Locked" : "Start"}
                  {!isLocked && <ArrowRight className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
