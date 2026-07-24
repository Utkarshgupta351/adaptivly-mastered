import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Target, Clock, ChevronLeft, ChevronRight, Flame, Brain, Code2, BookOpen, Sparkles, Calendar } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/planner")({ component: Planner });

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DATES = Array.from({ length: 35 }, (_, i) => i - 3);
const HAS_TASK_DATES = [3, 8, 12, 15, 18, 22, 25, 28];

const taskData = [
  { title: "Solve 3 tree problems", tag: "DSA", done: true, time: "9:00 AM", icon: Code2, priority: "high" },
  { title: "Read OS scheduling chapter", tag: "OS", done: true, time: "11:00 AM", icon: BookOpen, priority: "medium" },
  { title: "Mock interview — System Design", tag: "Mock", done: false, time: "3:00 PM", icon: Brain, priority: "high" },
  { title: "Review flashcards (DBMS)", tag: "Revision", done: false, time: "6:30 PM", icon: BookOpen, priority: "low" },
];

const upcomingWeek = [
  { day: "Mon", date: 17, tasks: 3, hours: 2 },
  { day: "Tue", date: 18, tasks: 4, hours: 3 },
  { day: "Wed", date: 19, tasks: 2, hours: 1.5 },
  { day: "Thu", date: 20, tasks: 5, hours: 4, today: true },
  { day: "Fri", date: 21, tasks: 3, hours: 2 },
  { day: "Sat", date: 22, tasks: 1, hours: 1 },
  { day: "Sun", date: 23, tasks: 0, hours: 0 },
];

const priorityColor: Record<string, string> = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-400",
  low: "bg-emerald-brand/20 text-emerald-brand border-emerald-brand/30",
};

function Planner() {
  const [selected, setSelected] = useState(20);
  const [tasks, setTasks] = useState(taskData);

  const toggleTask = (idx: number) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, done: !t.done } : t))
    );
  };

  const doneTasks = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Planner" description="Plan your prep. Stay on track. Hit every goal.">
        <Button className="bg-gradient-primary shadow-elegant rounded-xl gap-2">
          <Plus className="h-4 w-4" /> New task
        </Button>
      </PageHeader>

      {/* Weekly summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Target, label: "Tasks today", value: `${doneTasks} / ${tasks.length}`, color: "text-primary", bg: "bg-primary/10" },
          { icon: Clock, label: "Study hours", value: "2h 14m", color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
          { icon: Flame, label: "Streak", value: "42 days", color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: Sparkles, label: "Weekly XP", value: "+840", color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
              </div>
            </div>
            <div className="text-2xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="week" className="space-y-6">
        <TabsList className="rounded-xl">
          <TabsTrigger value="day" className="rounded-lg">Day</TabsTrigger>
          <TabsTrigger value="week" className="rounded-lg">Week</TabsTrigger>
          <TabsTrigger value="month" className="rounded-lg">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-6">
          {/* Week at a glance */}
          <Card className="border-border/40 p-6 shadow-soft">
            <h3 className="font-bold mb-4">Week at a glance</h3>
            <div className="grid grid-cols-7 gap-2">
              {upcomingWeek.map((d) => (
                <div
                  key={d.day}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-3 transition-all cursor-pointer ${
                    d.today
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "bg-muted/30 hover:bg-muted/60"
                  }`}
                >
                  <div className={`text-xs font-semibold ${d.today ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {d.day}
                  </div>
                  <div className={`text-lg font-black ${d.today ? "text-primary-foreground" : ""}`}>{d.date}</div>
                  {d.tasks > 0 ? (
                    <div className={`text-[10px] font-medium ${d.today ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {d.tasks} tasks
                    </div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground/40">–</div>
                  )}
                  {d.tasks > 0 && (
                    <div className={`h-1 w-8 rounded-full ${d.today ? "bg-white/40" : "bg-primary/30"}`}>
                      <div
                        className={`h-full rounded-full ${d.today ? "bg-white" : "bg-primary"}`}
                        style={{ width: `${(d.hours / 4) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            {/* Calendar */}
            <Card className="border-border/40 p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">March 2026</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Click a date to view tasks</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                {DAYS.map((d, i) => (
                  <div key={i} className="p-2 font-bold">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {DATES.map((d) => {
                  const isValid = d > 0 && d <= 31;
                  const isActive = d === selected;
                  const hasTask = HAS_TASK_DATES.includes(d);
                  const isToday = d === 20;
                  return (
                    <button
                      key={d}
                      onClick={() => isValid && setSelected(d)}
                      className={`relative aspect-square rounded-xl text-sm transition-all ${
                        !isValid
                          ? "text-muted-foreground/20 cursor-default"
                          : isActive
                          ? "bg-gradient-primary text-primary-foreground font-bold shadow-glow"
                          : isToday
                          ? "ring-2 ring-primary font-bold"
                          : "hover:bg-muted/60 hover:scale-105"
                      }`}
                    >
                      {isValid ? d : ""}
                      {hasTask && !isActive && isValid && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Task list */}
            <Card className="border-border/40 p-6 shadow-soft">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">March {selected}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {doneTasks} of {tasks.length} tasks completed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">{Math.round((doneTasks / tasks.length) * 100)}%</div>
                  <div className="h-8 w-8">
                    <svg viewBox="0 0 32 32" className="rotate-[-90deg]">
                      <circle cx="16" cy="16" r="12" fill="none" stroke="var(--muted)" strokeWidth="4" />
                      <circle
                        cx="16" cy="16" r="12" fill="none"
                        stroke="oklch(0.68 0.19 268)"
                        strokeWidth="4"
                        strokeDasharray={`${(doneTasks / tasks.length) * 75.4} 75.4`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                {tasks.map((t, i) => (
                  <div
                    key={t.title}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
                      t.done ? "border-border/20 bg-muted/20" : "border-border/40 hover:border-primary/30"
                    }`}
                  >
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={() => toggleTask(i)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>
                        {t.title}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.time}</span>
                        <Badge variant="outline" className="h-4 text-[10px]">{t.tag}</Badge>
                        <Badge variant="outline" className={`h-4 text-[10px] ${priorityColor[t.priority]}`}>
                          {t.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full bg-gradient-primary rounded-xl gap-2" size="sm">
                <Plus className="h-4 w-4" /> Add task
              </Button>
            </Card>
          </div>

          {/* Weekly goal tracker */}
          <Card className="border-border/40 p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-5">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Weekly goal tracker</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { n: "Problems solved", v: 24, t: 35, color: "text-primary" },
                { n: "Study hours", v: 12, t: 20, color: "text-emerald-brand" },
                { n: "Mock interviews", v: 2, t: 3, color: "text-amber-500" },
              ].map((g) => (
                <div key={g.n} className="rounded-2xl border border-border/40 p-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">{g.n}</span>
                    <span className={`text-xl font-black ${g.color}`}>
                      {g.v}<span className="text-sm font-normal text-muted-foreground"> / {g.t}</span>
                    </span>
                  </div>
                  <Progress value={(g.v / g.t) * 100} className="mt-3 h-2" />
                  <div className="mt-2 text-xs text-muted-foreground">{Math.round((g.v / g.t) * 100)}% complete</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <Card className="border-border/40 p-8 shadow-soft text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold">Day view coming soon</h3>
            <p className="text-sm text-muted-foreground mt-1">Detailed hourly timeline will be available here.</p>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          <Card className="border-border/40 p-8 shadow-soft text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold">Month view coming soon</h3>
            <p className="text-sm text-muted-foreground mt-1">Full month calendar view will be available here.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
