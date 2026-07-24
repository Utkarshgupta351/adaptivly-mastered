import { PageHeader, StatCard } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis as RadarPolarAngleAxis,
} from "recharts";
import { TrendingUp, Code2, Clock, Trophy, Target, Award } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({ component: Analytics });

const trend = Array.from({ length: 12 }, (_, i) => ({
  w: `W${i + 1}`,
  solved: [8,12,10,18,14,22,19,25,21,28,24,32][i],
  accuracy: [62,65,70,68,74,72,78,75,80,82,79,85][i],
}));

const time = [
  { d: "Mon", hrs: 2.5 }, { d: "Tue", hrs: 4 }, { d: "Wed", hrs: 1.5 },
  { d: "Thu", hrs: 5 }, { d: "Fri", hrs: 3 }, { d: "Sat", hrs: 6 }, { d: "Sun", hrs: 2 },
];

const diff = [
  { name: "Easy", value: 145, color: "oklch(0.68 0.17 162)" },
  { name: "Medium", value: 176, color: "oklch(0.7 0.18 50)" },
  { name: "Hard", value: 42, color: "oklch(0.6 0.22 25)" },
];

const topics = [
  { n: "Arrays", v: 92 }, { n: "Trees", v: 74 }, { n: "Graphs", v: 58 },
  { n: "DP", v: 42 }, { n: "System Design", v: 55 }, { n: "OS", v: 68 },
];

const radarData = [
  { subject: "DSA", A: 80 }, { subject: "System Design", A: 55 },
  { subject: "OS/DBMS", A: 70 }, { subject: "Behavioral", A: 90 },
  { subject: "Networking", A: 45 }, { subject: "Math/Stats", A: 60 },
];

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
};

function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Deep insights into your interview prep journey.">
        <Badge variant="outline">Last 90 days</Badge>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Code2} label="Problems solved" value="363" delta="+42 this month" color="text-primary" bg="bg-primary/10" trend="up" />
        <StatCard icon={Target} label="Avg accuracy" value="78%" delta="+4%" color="text-emerald-brand" bg="bg-emerald-brand/10" trend="up" />
        <StatCard icon={Clock} label="Study hours" value="156h" delta="+18h" color="text-cyan-400" bg="bg-cyan-400/10" trend="up" />
        <StatCard icon={Trophy} label="Global rank" value="#1,247" delta="▲ 82 places" color="text-amber-500" bg="bg-amber-500/10" trend="up" />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/40 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold">Problems solved trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Weekly problem count over 12 weeks</p>
            </div>
            <Badge variant="outline" className="text-emerald-brand border-emerald-brand/30">↑ 32%</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.19 268)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.68 0.19 268)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="solved" stroke="oklch(0.68 0.19 268)" fill="url(#g1)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold">Accuracy trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Correct submissions percentage</p>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30">+23pts</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Accuracy"]} />
                <Line type="monotone" dataKey="accuracy" stroke="oklch(0.68 0.17 162)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/40 p-6 shadow-soft lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold">Daily study time</h3>
            <span className="text-xs text-muted-foreground">This week</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={time} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}h`, "Hours"]} />
                <Bar dataKey="hrs" fill="oklch(0.68 0.19 268)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <h3 className="font-bold mb-5">Difficulty breakdown</h3>
          <div className="flex items-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={diff} innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270}>
                    {diff.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              {diff.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                    <span className="font-medium w-16">{d.name}</span>
                    <span className="font-bold ml-auto">{d.value}</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ background: d.color, width: `${(d.value / 363) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-1 text-xs text-muted-foreground">363 total</div>
            </div>
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <h3 className="font-bold mb-5">Skill radar</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <RadarPolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Radar dataKey="A" stroke="oklch(0.68 0.19 268)" fill="oklch(0.68 0.19 268)" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Topic mastery */}
      <Card className="border-border/40 p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold">Topic mastery</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Percentage of problems solved correctly per topic</p>
          </div>
          <Badge variant="outline">6 topics</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <div key={t.n} className="rounded-xl border border-border/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{t.n}</span>
                <span className={`text-sm font-black ${t.v >= 80 ? "text-emerald-brand" : t.v >= 60 ? "text-amber-500" : "text-destructive"}`}>
                  {t.v}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${t.v}%`,
                    background: t.v >= 80 ? "oklch(0.68 0.17 162)" : t.v >= 60 ? "oklch(0.7 0.18 50)" : "oklch(0.6 0.22 25)",
                  }}
                />
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                {t.v >= 80 ? "🟢 Strong" : t.v >= 60 ? "🟡 Good" : "🔴 Needs work"}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
