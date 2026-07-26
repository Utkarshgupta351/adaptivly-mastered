import { PageHeader, StatCard } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAdaptiveRecommendations } from "@/server-actions/adaptive-dashboard";
import {
  Flame, Trophy, Award, Clock, Target, CheckCircle2,
  ArrowRight, Play, Code2, Bot, Sparkles, Coins, Zap, BookOpen, Layers, Activity, FileQuestion, Video, HelpCircle, ChevronRight, Loader2
} from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { useAuth, supabaseBrowser } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface ProfileData {
  full_name: string;
  streak: number;
  xp: number;
  coins: number;
  daily_goal: number;
  learning_path: string;
  onboarding_done: boolean;
}

interface DashboardData {
  profile: ProfileData | null;
  badgeCount: number;
  todaySolved: number;
  totalSolved: number;
  todayTasks: Array<{ id: string; title: string; tag: string; done: boolean }>;
  weekData: Array<{ day: string; problems: number }>;
}

/* ─── Heatmap ─────────────────────────────────────────────────────────────── */
function Heatmap({ data }: { data: number[] }) {
  const shades = [
    "bg-muted/40",
    "bg-primary/20",
    "bg-primary/40",
    "bg-primary/65",
    "bg-primary/90",
  ];
  const vals = data.length >= 140 ? data.slice(-140) : [...Array(140 - data.length).fill(0), ...data];
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1">
      {vals.map((v, i) => (
        <div
          key={i}
          title={`${v} problems`}
          className={`h-3 w-3 rounded-sm ${shades[Math.min(v, 4)]} transition-transform hover:scale-125 cursor-pointer`}
        />
      ))}
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────── */
function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const { data: recs, isLoading: recsLoading } = useQuery({
    queryKey: ["adaptive_recommendations"],
    queryFn: async () => {
      if (!token) return null;
      return getAdaptiveRecommendations({ data: { token } });
    },
    enabled: !!token,
  });

  const [data, setData] = useState<DashboardData>({
    profile: null,
    badgeCount: 0,
    todaySolved: 0,
    totalSolved: 0,
    todayTasks: [],
    weekData: ["M", "T", "W", "T", "F", "S", "S"].map(day => ({ day, problems: 0 })),
  });
  const [heatmap, setHeatmap] = useState<number[]>(Array(140).fill(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const tenWeeksAgo = new Date(Date.now() - 70 * 86400000).toISOString();

        const [profileRes, badgesRes, todaySubsRes, totalSubsRes, tasksRes, weekSubsRes] =
          await Promise.all([
            supabaseBrowser.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
            supabaseBrowser.from("user_achievements").select("id", { count: "exact" }).eq("user_id", user!.id),
            supabaseBrowser.from("submissions").select("id", { count: "exact" })
              .eq("user_id", user!.id).gte("submitted_at", today),
            supabaseBrowser.from("user_problem_status").select("id", { count: "exact" })
              .eq("user_id", user!.id).eq("status", "solved"),
            supabaseBrowser.from("planner_tasks").select("*")
              .eq("user_id", user!.id).gte("scheduled_at", today).lte("scheduled_at", today + "T23:59:59"),
            supabaseBrowser.from("submissions").select("submitted_at")
              .eq("user_id", user!.id).gte("submitted_at", weekAgo),
          ]);

        // Build week data
        const days = ["S", "M", "T", "W", "T", "F", "S"];
        const weekMap: Record<string, number> = {};
        (weekSubsRes.data ?? []).forEach((s: any) => {
          const d = new Date(s.submitted_at).getDay();
          weekMap[d] = (weekMap[d] ?? 0) + 1;
        });
        const weekData = Array.from({ length: 7 }, (_, i) => {
          const dayIdx = (new Date().getDay() - 6 + i + 7) % 7;
          return { day: days[dayIdx], problems: weekMap[dayIdx] ?? 0 };
        });

        // Build simple heatmap from total submissions (show 0-4 per day)
        const heatData = Array(140).fill(0);
        const heatRes = await supabaseBrowser.from("submissions")
          .select("submitted_at").eq("user_id", user!.id).gte("submitted_at", tenWeeksAgo);
        (heatRes.data ?? []).forEach((s: any) => {
          const diff = Math.floor((Date.now() - new Date(s.submitted_at).getTime()) / 86400000);
          if (diff < 140) heatData[139 - diff] = Math.min((heatData[139 - diff] ?? 0) + 1, 4);
        });
        setHeatmap(heatData);

        setData({
          profile: profileRes.data as ProfileData | null,
          badgeCount: badgesRes.count ?? 0,
          todaySolved: todaySubsRes.count ?? 0,
          totalSolved: totalSubsRes.count ?? 0,
          todayTasks: (tasksRes.data ?? []).map((t: any) => ({
            id: t.id, title: t.title, tag: t.tag ?? "Task", done: t.done,
          })),
          weekData,
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const { profile, badgeCount, todaySolved, totalSolved, todayTasks, weekData } = data;
  const dailyGoal = profile?.daily_goal ?? 5;
  const goalPct = Math.min(Math.round((todaySolved / dailyGoal) * 100), 100);
  const firstName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const xpDisplay = profile ? (profile.xp >= 1000 ? `${(profile.xp / 1000).toFixed(1)}K` : String(profile.xp)) : "0";

  const toggleTask = async (id: string, done: boolean) => {
    await supabaseBrowser.from("planner_tasks").update({ done: !done }).eq("id", id);
    setData(prev => ({
      ...prev,
      todayTasks: prev.todayTasks.map(t => t.id === id ? { ...t, done: !t.done } : t),
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName} 👋`}
        description={
          profile?.streak
            ? `You're on a ${profile.streak}-day streak. Keep the momentum going.`
            : "Start your journey today — solve your first problem!"
        }
      >
        <Button className="bg-gradient-primary shadow-elegant rounded-xl gap-2" asChild>
          <Link to="/practice"><Play className="h-4 w-4" /> Continue learning</Link>
        </Button>
      </PageHeader>

      {/* Goal banner */}
      <Card className="relative overflow-hidden border-0 p-0 shadow-elegant">
        <div className="absolute inset-0 bg-gradient-primary" />
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="relative grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="text-primary-foreground">
            <Badge className="mb-3 border-white/20 bg-white/15 text-primary-foreground backdrop-blur gap-1.5">
              <Sparkles className="h-3 w-3" /> Daily Goal
            </Badge>
            <h2 className="text-2xl font-black md:text-3xl">
              {goalPct >= 100 ? "🎉 Daily goal complete!" : `You're ${goalPct}% to today's goal!`}
            </h2>
            <p className="mt-2 text-primary-foreground/80 text-sm">
              {goalPct >= 100
                ? `You solved ${todaySolved} problems today. Amazing work!`
                : `Solve ${Math.max(dailyGoal - todaySolved, 0)} more problem${dailyGoal - todaySolved !== 1 ? "s" : ""} to hit your daily target of ${dailyGoal}.`}
            </p>
            <div className="mt-5 max-w-md">
              <div className="flex justify-between text-xs text-primary-foreground/70 mb-2">
                <span>{todaySolved} / {dailyGoal} problems</span>
                <span>{goalPct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${goalPct}%` }} />
              </div>
            </div>
          </div>
          <div className="h-36 w-36 shrink-0">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="68%" outerRadius="100%" data={[{ v: goalPct }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="v" cornerRadius={20} fill="rgba(255,255,255,0.9)" background={{ fill: "rgba(255,255,255,0.15)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Adaptive Learning Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Your Adaptive Path</h3>
            <p className="text-xs text-muted-foreground">Tailored daily roadmap powered by your Diagnostic Assessment.</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            <Activity className="h-3 w-3 mr-1 animate-pulse" /> Evolving Live
          </Badge>
        </div>

        {recsLoading ? (
          <Card className="p-8 border-border/40 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </Card>
        ) : recs ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Today's Learning */}
            <Card className="p-5 border-border/40 shadow-soft flex flex-col justify-between hover:shadow-elegant transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <BookOpen className="h-4 w-4 text-primary" /> Today's Learning
                </div>
                <h4 className="text-base font-extrabold">{recs.todaysLearning.topic}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {recs.todaysLearning.description}
                </p>
              </div>
              <Button size="sm" className="mt-4 w-full rounded-xl bg-gradient-primary" asChild>
                <Link to={recs.todaysLearning.path}>{recs.todaysLearning.actionLabel}</Link>
              </Button>
            </Card>

            {/* Today's Revision */}
            <Card className="p-5 border-border/40 shadow-soft flex flex-col justify-between hover:shadow-elegant transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Layers className="h-4 w-4 text-emerald-brand" /> Today's Revision
                </div>
                <h4 className="text-base font-extrabold">{recs.todaysRevision.topic} Revision</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You haven't reviewed this topic in {recs.todaysRevision.daysSinceReview} days. Retain your mastery with dynamic revision cards.
                </p>
              </div>
              <Button size="sm" variant="outline" className="mt-4 w-full rounded-xl" asChild>
                <Link to={recs.todaysRevision.path}>{recs.todaysRevision.actionLabel}</Link>
              </Button>
            </Card>

            {/* Today's Flashcards & Quiz */}
            <Card className="p-5 border-border/40 shadow-soft space-y-4 hover:shadow-elegant transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <FileQuestion className="h-4 w-4 text-amber-500" /> Today's Flashcards &amp; Quiz
              </div>
              <div className="space-y-2">
                <Link to={recs.todaysFlashcards.path} className="flex items-center justify-between p-2.5 rounded-xl border border-border/30 hover:bg-muted/40 transition-colors text-xs font-medium">
                  <span>🗂️ {recs.todaysFlashcards.deckName} ({recs.todaysFlashcards.cardCount} cards)</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link to={recs.todaysQuiz.path} className="flex items-center justify-between p-2.5 rounded-xl border border-border/30 hover:bg-muted/40 transition-colors text-xs font-medium">
                  <span>📝 {recs.todaysQuiz.topic} Custom Quiz ({recs.todaysQuiz.questionCount} Qs)</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>

            {/* Weak Topics */}
            <Card className="p-5 border-border/40 shadow-soft hover:shadow-elegant transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                <Award className="h-4 w-4 text-destructive" /> Weak Topics (&lt;60%)
              </div>
              <div className="space-y-2.5">
                {recs.weakTopics.map(wt => (
                  <div key={wt.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{wt.name}</span>
                      <span className="text-destructive font-bold">{wt.score}%</span>
                    </div>
                    <Progress value={wt.score} className="h-1 rounded-full" />
                  </div>
                ))}
                {recs.weakTopics.length === 0 && (
                  <div className="text-xs text-muted-foreground py-2">Awesome! You have no weak topics.</div>
                )}
              </div>
            </Card>

            {/* Suggested Videos */}
            <Card className="p-5 border-border/40 shadow-soft hover:shadow-elegant transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                <Video className="h-4 w-4 text-red-500" /> Suggested Videos
              </div>
              <div className="space-y-2">
                {recs.suggestedVideos.map((vid, idx) => (
                  <a key={idx} href={vid.url} target="_blank" rel="noreferrer" className="block p-2 rounded-lg border border-border/30 hover:bg-muted/40 transition-all">
                    <div className="text-xs font-bold truncate">{vid.title}</div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>{vid.channel}</span>
                      <span>{vid.duration}</span>
                    </div>
                  </a>
                ))}
              </div>
            </Card>

            {/* Recommended Sessions */}
            <Card className="p-5 border-border/40 shadow-soft space-y-3.5 hover:shadow-elegant transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Bot className="h-4 w-4 text-purple-500" /> AI Recommendations
              </div>
              <div className="space-y-2">
                <Link to="/ai-tutor" className="block w-full p-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-xs font-semibold text-purple-600 dark:text-purple-400">
                  🤖 {recs.recommendedTutorSession.actionLabel}
                </Link>
                <Link to="/mock-interviews" className="block w-full p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  🎯 {recs.recommendedMockInterview.actionLabel}
                </Link>
              </div>
            </Card>
          </div>
        ) : null}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Flame} label="Streak" value={`${profile?.streak ?? 0} days`} color="text-amber-500" bg="bg-amber-500/10" trend="up" />
        <StatCard icon={Trophy} label="Total XP" value={xpDisplay} color="text-primary" bg="bg-primary/10" trend="up" />
        <StatCard icon={Coins} label="Coins" value={String(profile?.coins ?? 0)} color="text-yellow-500" bg="bg-yellow-500/10" />
        <StatCard icon={Award} label="Badges" value={`${badgeCount} earned`} color="text-emerald-brand" bg="bg-emerald-brand/10" />
      </div>

      {/* Heatmap + Tasks */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/40 p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold">Learning heatmap</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Your activity over the last 20 weeks</p>
            </div>
            <Badge variant="outline" className="border-emerald-brand/30 text-emerald-brand">
              {totalSolved} solved total
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Heatmap data={heatmap} />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            {["bg-muted/40", "bg-primary/20", "bg-primary/40", "bg-primary/65", "bg-primary/90"].map((c, i) => (
              <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
            ))}
            <span>More</span>
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Today's tasks</h3>
            <Badge variant="outline">
              {todayTasks.filter(t => t.done).length} / {todayTasks.length}
            </Badge>
          </div>
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No tasks planned for today</p>
              <Button size="sm" variant="outline" className="rounded-xl" asChild>
                <Link to="/planner">Add tasks →</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTask(t.id, t.done)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 transition-colors text-left ${
                    t.done ? "border-emerald-brand/20 bg-emerald-brand/5" : "border-border/40 hover:border-primary/30"
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 shrink-0 ${t.done ? "text-emerald-brand" : "text-muted-foreground/30"}`} />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${t.done ? "text-muted-foreground line-through" : "font-medium"}`}>{t.title}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{t.tag}</Badge>
                </button>
              ))}
            </div>
          )}
          <Button size="sm" className="mt-4 w-full rounded-xl bg-gradient-primary" asChild>
            <Link to="/planner">View planner →</Link>
          </Button>
        </Card>
      </div>

      {/* Weekly chart + Quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/40 p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold">This week</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Problems solved per day</p>
            </div>
            <Badge variant="outline">
              {weekData.reduce((s, d) => s + d.problems, 0)} this week
            </Badge>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="problems" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#areaGrad)" dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <h3 className="font-bold mb-4">Quick actions</h3>
          <div className="space-y-2.5">
            {[
              { label: "Practice problems", icon: Code2, to: "/practice", color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
              { label: "Ask AI tutor", icon: Bot, to: "/ai-tutor", color: "text-purple-400", bg: "bg-purple-400/10" },
              { label: "View learning path", icon: Zap, to: "/learning-paths", color: "text-primary", bg: "bg-primary/10" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 rounded-xl border border-border/40 p-3 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-xl ${a.bg}`}>
                  <a.icon className={`h-4 w-4 ${a.color}`} />
                </div>
                <span className="text-sm font-medium flex-1">{a.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-border/40 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Learning path:</span>{" "}
              {profile?.learning_path ?? "Not set"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
