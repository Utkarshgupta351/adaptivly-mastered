import { PageHeader, StatCard } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame, Trophy, Award, Clock, Target, TrendingUp, TrendingDown,
  ArrowRight, Play, Code2, Bot, Youtube, Sparkles, CheckCircle2,
  Coins, Circle, Star, Zap,
} from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, AreaChart, Area, XAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Heatmap() {
  // Seeded data for consistency
  const vals = [0,2,4,3,1,0,2,4,3,2,1,3,4,2,0,3,4,1,2,3,4,2,1,0,3,4,2,3,1,2,4,3,0,2,4,3,1,2,0,3,4,2,1,3,4,2,0,3,4,1,2,3,4,2,1,0,3,4,2,3,1,2,4,3,0,2,4,3,1,2,0,3,4,2,1,3,4,2,0,3,4,1,2,3,4,2,1,0,3,4,2,3,1,2,4,3,0,2,4,3,1,2,0,3,4,2,1,3,4,2,0,3,4,1,2,3,4,2,1,0,3,4,2,3,1,2,4,3,0,2,4,3,1,2,0,3,4,2,1,3];
  const shades = [
    "bg-muted/40",
    "bg-primary/20",
    "bg-primary/40",
    "bg-primary/65",
    "bg-primary/90",
  ];
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1">
      {vals.map((v, i) => (
        <div
          key={i}
          title={`${v} problems`}
          className={`h-3 w-3 rounded-sm ${shades[v]} transition-transform hover:scale-125 cursor-pointer`}
        />
      ))}
    </div>
  );
}

const weekData = [
  { day: "M", problems: 4 },
  { day: "T", problems: 7 },
  { day: "W", problems: 3 },
  { day: "T", problems: 9 },
  { day: "F", problems: 6 },
  { day: "S", problems: 11 },
  { day: "S", problems: 5 },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Jane 👋"
        description="You're on a 42-day streak. Keep the momentum going."
      >
        <Button variant="outline" className="rounded-xl gap-2">
          <Clock className="h-4 w-4" /> 2h 14m today
        </Button>
        <Button className="bg-gradient-primary shadow-elegant rounded-xl gap-2">
          <Play className="h-4 w-4" /> Continue learning
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
              You're 78% to today's goal!
            </h2>
            <p className="mt-2 text-primary-foreground/80 text-sm">
              Solve 2 more problems to hit your daily target of 5.
            </p>
            <div className="mt-5 max-w-md">
              <div className="flex justify-between text-xs text-primary-foreground/70 mb-2">
                <span>3 / 5 problems</span>
                <span>78%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[78%] rounded-full bg-white transition-all" />
              </div>
            </div>
          </div>
          <div className="h-36 w-36 shrink-0">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="68%"
                outerRadius="100%"
                data={[{ v: 78 }]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="v" cornerRadius={20} fill="rgba(255,255,255,0.9)" background={{ fill: "rgba(255,255,255,0.15)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Flame} label="Streak" value="42 days" delta="+3 this week" color="text-amber-500" bg="bg-amber-500/10" trend="up" />
        <StatCard icon={Trophy} label="Total XP" value="12,480" delta="+340 today" color="text-primary" bg="bg-primary/10" trend="up" />
        <StatCard icon={Coins} label="Coins" value="1,245" color="text-yellow-500" bg="bg-yellow-500/10" />
        <StatCard icon={Award} label="Badges" value="18 / 42" color="text-emerald-brand" bg="bg-emerald-brand/10" trend="up" delta="3 new this month" />
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
              98 active days
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Heatmap />
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
            <Badge variant="outline">2 / 4</Badge>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Solve 5 DP problems", done: true, tag: "DSA" },
              { label: "Review OS notes", done: true, tag: "OS" },
              { label: "Mock system design", done: false, tag: "Mock" },
              { label: "Watch trees lecture", done: false, tag: "Video" },
            ].map((t) => (
              <div
                key={t.label}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${t.done ? "border-emerald-brand/20 bg-emerald-brand/5" : "border-border/40 hover:border-primary/30"}`}
              >
                <CheckCircle2
                  className={`h-4 w-4 shrink-0 ${t.done ? "text-emerald-brand" : "text-muted-foreground/30"}`}
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${t.done ? "text-muted-foreground line-through" : "font-medium"}`}>
                    {t.label}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{t.tag}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Weekly chart + Weak/Strong + Recommended */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/40 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">This week</h3>
            <span className="text-xs text-muted-foreground">Problems solved</span>
          </div>
          <div className="h-36">
            <ResponsiveContainer>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.19 268)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.68 0.19 268)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="problems" stroke="oklch(0.68 0.19 268)" fill="url(#weekGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-brand" />
            <span className="text-emerald-brand font-semibold">+28%</span>
            <span className="text-muted-foreground">vs last week</span>
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <h3 className="font-bold">Weak areas</h3>
          </div>
          <div className="space-y-4">
            {[
              { n: "Dynamic Programming", v: 42, color: "text-destructive" },
              { n: "Segment Trees", v: 28, color: "text-destructive" },
              { n: "System Design", v: 55, color: "text-amber-500" },
            ].map((w) => (
              <div key={w.n}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{w.n}</span>
                  <span className={`font-bold ${w.color}`}>{w.v}%</span>
                </div>
                <Progress value={w.v} className="h-1.5" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-brand" />
            <h3 className="font-bold text-sm">Strong areas</h3>
          </div>
          <div className="space-y-4">
            {[
              { n: "Arrays & Hashing", v: 94 },
              { n: "Two Pointers", v: 89 },
            ].map((w) => (
              <div key={w.n}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{w.n}</span>
                  <span className="font-bold text-emerald-brand">{w.v}%</span>
                </div>
                <Progress value={w.v} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden border-primary/30 p-6 shadow-elegant">
          <div className="absolute inset-0 -z-10 bg-gradient-primary opacity-5" />
          <Badge className="bg-gradient-primary gap-1.5 mb-3">
            <Sparkles className="h-3 w-3" /> AI Recommended
          </Badge>
          <h3 className="font-bold text-base mt-1">Dynamic Programming — Knapsack</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Based on your recent mistakes, this topic will unlock 6 new medium problems.
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~2h</span>
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" /> Medium</span>
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-primary" /> +150 XP</span>
          </div>
          <Button asChild className="mt-5 w-full bg-gradient-primary shadow-elegant rounded-xl gap-2">
            <Link to="/practice">
              Start topic <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="border-border/40 p-6 shadow-soft">
        <h3 className="font-bold mb-5">Quick actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Code2, label: "Solve a problem", desc: "Pick up where you left off", to: "/practice", color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
            { icon: Bot, label: "Ask AI Tutor", desc: "Get instant explanations", to: "/ai-tutor", color: "text-purple-400", bg: "bg-purple-400/10" },
            { icon: Youtube, label: "Summarize lecture", desc: "Turn YouTube into notes", to: "/youtube-summarizer", color: "text-red-400", bg: "bg-red-400/10" },
            { icon: Target, label: "Mock interview", desc: "Practice with real questions", to: "/mock-interviews", color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="group flex items-center gap-4 rounded-2xl border border-border/40 p-4 transition-all hover:border-primary/30 hover:shadow-soft hover:-translate-y-0.5"
            >
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${a.bg} group-hover:scale-110 transition-transform`}>
                <a.icon className={`h-5 w-5 ${a.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{a.label}</div>
                <div className="text-xs text-muted-foreground truncate">{a.desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
