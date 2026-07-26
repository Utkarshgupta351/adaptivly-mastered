import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Target, Clock, ChevronLeft, ChevronRight, Flame, Brain, Code2, BookOpen, Sparkles, Calendar, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, supabaseBrowser } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/planner")({ component: Planner });

interface TaskItem {
  id: string;
  title: string;
  tag: string;
  priority: "high" | "medium" | "low";
  done: boolean;
  scheduled_at: string;
}

const priorityColor: Record<string, string> = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-400",
  low: "bg-emerald-brand/20 text-emerald-brand border-emerald-brand/30",
};

function Planner() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("DSA");
  const [learningPath, setLearningPath] = useState("FAANG Full Prep");
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function loadPlannerData() {
      try {
        const todayStr = new Date().toISOString().split("T")[0];

        const [profileRes, tasksRes, statusRes] = await Promise.all([
          supabaseBrowser.from("profiles").select("learning_path").eq("id", user!.id).maybeSingle(),
          supabaseBrowser.from("planner_tasks").select("*").eq("user_id", user!.id).order("created_at", { ascending: true }),
          supabaseBrowser.from("user_problem_status").select("id", { count: "exact" }).eq("user_id", user!.id).eq("status", "solved"),
        ]);

        if (profileRes.data?.learning_path) {
          setLearningPath(profileRes.data.learning_path);
        }
        setSolvedCount(statusRes.count ?? 0);

        let existingTasks = (tasksRes.data ?? []).map((t: any) => ({
          id: t.id,
          title: t.title,
          tag: t.tag ?? "General",
          priority: (t.priority ?? "medium") as "high" | "medium" | "low",
          done: t.done,
          scheduled_at: t.scheduled_at,
        }));

        // If no tasks exist for user, seed initial tasks tailored to learning path
        if (existingTasks.length === 0) {
          const pathName = profileRes.data?.learning_path ?? "FAANG Full Prep";
          const defaultTasks = [
            { title: `Solve 3 ${pathName.includes("DSA") ? "Arrays & DP" : "relevant topic"} problems`, tag: "DSA", priority: "high", scheduled_at: todayStr },
            { title: `Review ${pathName} key concepts`, tag: "Study", priority: "medium", scheduled_at: todayStr },
            { title: "Complete 1 Mock Interview session", tag: "Mock", priority: "high", scheduled_at: todayStr },
            { title: "Review AI Tutor feedback on past code", tag: "Revision", priority: "low", scheduled_at: todayStr },
          ];

          const toInsert = defaultTasks.map(t => ({
            user_id: user!.id,
            title: t.title,
            tag: t.tag,
            priority: t.priority,
            scheduled_at: t.scheduled_at,
            done: false,
          }));

          const inserted = await supabaseBrowser.from("planner_tasks").insert(toInsert).select();
          if (inserted.data) {
            existingTasks = inserted.data.map((t: any) => ({
              id: t.id,
              title: t.title,
              tag: t.tag ?? "General",
              priority: t.priority as "high" | "medium" | "low",
              done: t.done,
              scheduled_at: t.scheduled_at,
            }));
          }
        }

        setTasks(existingTasks);
      } finally {
        setLoading(false);
      }
    }

    loadPlannerData();
  }, [user]);

  const toggleTask = async (id: string, currentDone: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !currentDone } : t));
    await supabaseBrowser.from("planner_tasks").update({ done: !currentDone }).eq("id", id);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const { data: created, error } = await supabaseBrowser
      .from("planner_tasks")
      .insert({
        user_id: user.id,
        title: newTaskTitle.trim(),
        tag: newTaskTag,
        priority: "medium",
        scheduled_at: todayStr,
        done: false,
      })
      .select()
      .single();

    if (created) {
      setTasks(prev => [...prev, {
        id: created.id,
        title: created.title,
        tag: created.tag ?? "General",
        priority: "medium",
        done: false,
        scheduled_at: created.scheduled_at,
      }]);
      setNewTaskTitle("");
      toast.success("Task added!");
    }
  };

  const doneTasks = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Planner" description={`Custom prep tasks for: ${learningPath}.`}>
        <Badge variant="outline" className="border-primary/40 text-primary font-bold">
          <Sparkles className="h-3.5 w-3.5 mr-1" /> {learningPath}
        </Badge>
      </PageHeader>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks Done</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Target className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black">{doneTasks} / {tasks.length}</div>
          <Progress value={pct} className="mt-3 h-2" />
        </div>

        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Problems Solved</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-brand/10 text-emerald-brand">
              <Code2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black">{solvedCount}</div>
          <div className="text-xs text-emerald-brand mt-1">total across all topics</div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completion Rate</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black">{pct}%</div>
          <div className="text-xs text-muted-foreground mt-1">of planned tasks finished</div>
        </div>
      </div>

      {/* Main Task List + Add Task */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/40 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-lg">Your Tasks</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{doneTasks} of {tasks.length} tasks completed</p>
            </div>
            <Badge variant="outline" className="font-bold">{pct}% Done</Badge>
          </div>

          <div className="space-y-2.5">
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id, t.done)}
                className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all cursor-pointer ${
                  t.done ? "border-border/20 bg-muted/20" : "border-border/40 hover:border-primary/30"
                }`}
              >
                <Checkbox
                  checked={t.done}
                  onCheckedChange={() => toggleTask(t.id, t.done)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>
                    {t.title}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="h-4 text-[10px]">{t.tag}</Badge>
                    <Badge variant="outline" className={`h-4 text-[10px] ${priorityColor[t.priority]}`}>
                      {t.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Add New Task Form */}
        <Card className="border-border/40 p-6 shadow-soft">
          <h3 className="font-bold text-lg mb-4">Add Custom Task</h3>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Task Description</label>
              <Input
                placeholder="e.g. Solve 2 Graph problems"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Category / Tag</label>
              <select
                value={newTaskTag}
                onChange={e => setNewTaskTag(e.target.value)}
                className="w-full mt-1.5 h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DSA">DSA</option>
                <option value="System Design">System Design</option>
                <option value="Mock">Mock Interview</option>
                <option value="Study">Study / Notes</option>
                <option value="Revision">Revision</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-gradient-primary rounded-xl font-bold gap-2">
              <Plus className="h-4 w-4" /> Add to Planner
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
