import { PageHeader, StatCard } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis as RadarPolarAngleAxis,
} from "recharts";
import { TrendingUp, Code2, Clock, Trophy, Target, Award, Sparkles, MessageSquare, AlertTriangle } from "lucide-react";
import { useAuth, supabaseBrowser } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/analytics")({ component: Analytics });

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
};

function Analytics() {
  const { user } = useAuth();

  const analyticsQuery = useQuery({
    queryKey: ["analytics", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [subRes, upsRes, sessRes, profileRes, mockRes] = await Promise.all([
        supabaseBrowser.from("submissions").select("status, created_at, problems(id, difficulty, topic)").eq("user_id", user.id),
        supabaseBrowser.from("user_problem_status").select("problem_id, solved, problems(difficulty)").eq("user_id", user.id).eq("solved", true),
        supabaseBrowser.from("study_sessions").select("session_date, duration_minutes").eq("user_id", user.id),
        supabaseBrowser.from("profiles").select("xp, streak").eq("id", user.id).single(),
        supabaseBrowser.from("mock_sessions").select("messages, status").eq("user_id", user.id).eq("status", "completed"),
      ]);

      const submissions = subRes.data || [];
      const ups = upsRes.data || [];
      const sessions = sessRes.data || [];
      const profile = profileRes.data;
      const mockSessions = mockRes.data || [];

      // Extract Interview Stats
      let totalComm = 0, totalTech = 0, totalProb = 0, totalDepth = 0, reportCount = 0;
      const confidenceData: { name: string; Confidence: number }[] = [];
      let totalSeconds = 0, timeCount = 0;
      const weaknessMap: Record<string, number> = {};

      mockSessions.forEach((s, idx) => {
        const msgs = s.messages as any[];
        if (!msgs) return;
        
        let sessionConfidenceSum = 0;
        let sessionConfidenceCount = 0;

        msgs.forEach(m => {
           if (m.role === "assistant") {
              try {
                const parsed = JSON.parse(m.content);
                if (parsed.evaluation) {
                  if (parsed.evaluation.confidence) {
                    sessionConfidenceSum += parsed.evaluation.confidence;
                    sessionConfidenceCount++;
                  }
                  if (parsed.evaluation.timeTaken) {
                     const tStr = parsed.evaluation.timeTaken.toLowerCase();
                     let secs = 0;
                     if (tStr.includes("min")) secs = parseInt(tStr.replace(/[^0-9]/g, '')) * 60;
                     else if (tStr.includes("sec")) secs = parseInt(tStr.replace(/[^0-9]/g, ''));
                     else secs = parseInt(tStr.replace(/[^0-9]/g, '')) || 0;
                     if (secs > 0) {
                        totalSeconds += secs;
                        timeCount++;
                     }
                  }
                }
              } catch(e) {}
           }
        });
        
        if (sessionConfidenceCount > 0) {
           confidenceData.push({ 
             name: `Int ${idx + 1}`, 
             Confidence: Math.round(sessionConfidenceSum / sessionConfidenceCount) 
           });
        }

        const reportMsg = msgs.find(m => m.role === "report");
        if (reportMsg) {
          try {
            const r = JSON.parse(reportMsg.content);
            totalComm += r.communicationScore || 0;
            totalTech += r.technicalAccuracy || 0;
            totalProb += r.problemSolving || 0;
            totalDepth += r.depthOfKnowledge || 0;
            reportCount++;
            
            if (r.keyWeaknesses && Array.isArray(r.keyWeaknesses)) {
               r.keyWeaknesses.forEach((w: string) => {
                  weaknessMap[w] = (weaknessMap[w] || 0) + 1;
               });
            }
          } catch(e) {}
        }
      });
      
      const avgResponseSeconds = timeCount > 0 ? Math.round(totalSeconds / timeCount) : 0;
      const avgResponseFormat = avgResponseSeconds > 60 ? `${Math.round(avgResponseSeconds / 60)}m ${avgResponseSeconds % 60}s` : `${avgResponseSeconds}s`;
      
      const topWeaknesses = Object.entries(weaknessMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      const interviewRadar = reportCount > 0 ? [
        { subject: 'Communication', A: Math.round(totalComm / reportCount), fullMark: 100 },
        { subject: 'Technical', A: Math.round(totalTech / reportCount), fullMark: 100 },
        { subject: 'Problem Solving', A: Math.round(totalProb / reportCount), fullMark: 100 },
        { subject: 'Knowledge Depth', A: Math.round(totalDepth / reportCount), fullMark: 100 },
      ] : [
        { subject: 'Communication', A: 0, fullMark: 100 },
        { subject: 'Technical', A: 0, fullMark: 100 },
        { subject: 'Problem Solving', A: 0, fullMark: 100 },
        { subject: 'Knowledge Depth', A: 0, fullMark: 100 },
      ];

      // Global Rank
      const { count: rankCount } = await supabaseBrowser
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("xp", profile?.xp || 0);
      const globalRank = (rankCount || 0) + 1;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Stat Cards
      const totalSolved = ups.length;
      const acceptedThisMonth = new Set(
        submissions
          .filter((s) => s.status === "Accepted" && new Date(s.created_at) >= thirtyDaysAgo)
          .map((s) => (s.problems as any)?.id)
      ).size;

      const totalSubs = submissions.length;
      const acceptedSubs = submissions.filter((s) => s.status === "Accepted").length;
      const avgAccuracy = totalSubs > 0 ? Math.round((acceptedSubs / totalSubs) * 100) : 0;

      // Calculate accuracy from 30 days ago to see delta
      const subsBefore30 = submissions.filter((s) => new Date(s.created_at) < thirtyDaysAgo);
      const accBefore30 = subsBefore30.length > 0
        ? Math.round((subsBefore30.filter((s) => s.status === "Accepted").length / subsBefore30.length) * 100)
        : 0;
      const accuracyDelta = avgAccuracy - accBefore30;

      const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
      const totalStudyHours = Math.round(totalStudyMinutes / 60);

      // Study hours this month
      const studyMinsThisMonth = sessions
        .filter((s) => new Date(s.session_date) >= thirtyDaysAgo)
        .reduce((acc, s) => acc + s.duration_minutes, 0);
      const studyHoursDelta = Math.round(studyMinsThisMonth / 60);

      const stats = {
        solved: totalSolved,
        solvedDelta: acceptedThisMonth,
        accuracy: avgAccuracy,
        accuracyDelta,
        studyHours: totalStudyHours,
        studyHoursDelta,
        rank: globalRank,
      };

      // 12 Week Trend
      const trend = Array.from({ length: 12 }, (_, i) => {
        const weeksAgo = 11 - i;
        const start = new Date(now.getTime() - (weeksAgo + 1) * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000);

        const weekSubs = submissions.filter((s) => {
          const d = new Date(s.created_at);
          return d >= start && d < end;
        });
        const weekAcc = weekSubs.filter((s) => s.status === "Accepted");
        const uniqueSolved = new Set(weekAcc.map((s) => (s.problems as any)?.id)).size;
        const accuracy = weekSubs.length ? Math.round((weekAcc.length / weekSubs.length) * 100) : 0;

        return { w: `W${i + 1}`, solved: uniqueSolved, accuracy };
      });

      // Daily Study Time (Last 7 Days)
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const time = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split("T")[0];
        const sess = sessions.find((s) => s.session_date === dateStr);
        return {
          d: days[d.getDay()],
          hrs: sess ? Math.round((sess.duration_minutes / 60) * 10) / 10 : 0,
        };
      });

      // Difficulty Breakdown
      const easy = ups.filter((u) => (u.problems as any)?.difficulty === "Easy").length;
      const medium = ups.filter((u) => (u.problems as any)?.difficulty === "Medium").length;
      const hard = ups.filter((u) => (u.problems as any)?.difficulty === "Hard").length;
      const diff = [
        { name: "Easy", value: easy, color: "oklch(0.68 0.17 162)" },
        { name: "Medium", value: medium, color: "oklch(0.7 0.18 50)" },
        { name: "Hard", value: hard, color: "oklch(0.6 0.22 25)" },
      ].filter(d => d.value > 0);

      // If diff is empty (no problems solved), add empty placeholders
      if (diff.length === 0) {
        diff.push({ name: "Easy", value: 0, color: "oklch(0.68 0.17 162)" });
      }

      // Topic Mastery & Radar
      const topicStats: Record<string, { total: number; accepted: number }> = {};
      submissions.forEach((s) => {
        const t = (s.problems as any)?.topic;
        if (!t) return;
        if (!topicStats[t]) topicStats[t] = { total: 0, accepted: 0 };
        topicStats[t].total++;
        if (s.status === "Accepted") topicStats[t].accepted++;
      });

      const topics = Object.entries(topicStats)
        .map(([n, s]) => ({ n, v: Math.round((s.accepted / s.total) * 100) }))
        .sort((a, b) => b.v - a.v)
        .slice(0, 6);

      const dynamicSubjects = Object.keys(topicStats).length > 0 ? Object.keys(topicStats).slice(0, 12) : ["General Prep"];
      const radarData = dynamicSubjects.map((sub) => {
        const matchingTopics = Object.keys(topicStats).filter(
          (t) => t.toLowerCase().includes(sub.toLowerCase()) || sub.toLowerCase().includes(t.toLowerCase())
        );

        if (matchingTopics.length === 0) return { subject: sub, A: 0 };

        let t = 0, a = 0;
        matchingTopics.forEach((m) => {
          t += topicStats[m].total;
          a += topicStats[m].accepted;
        });
        return { subject: sub.length > 12 ? sub.substring(0, 10) + "..." : sub, A: t > 0 ? Math.round((a / t) * 100) : 0 };
      });

      return { stats, trend, time, diff, topics, radarData, interviewRadar, confidenceData, avgResponseFormat, topWeaknesses };
    },
    enabled: !!user,
  });

  if (analyticsQuery.isLoading || !analyticsQuery.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Deep insights into your interview prep journey." />
        <Skeleton className="w-full h-64 rounded-xl" />
      </div>
    );
  }

  const { stats, trend, time, diff, topics, radarData, interviewRadar, confidenceData, avgResponseFormat, topWeaknesses } = analyticsQuery.data;

  // Formatting helpers for deltas
  const formatDelta = (val: number, unit: string = "") => {
    if (val > 0) return `+${val}${unit}`;
    if (val < 0) return `${val}${unit}`;
    return `0${unit}`;
  };

  const solvedTrendColor = stats.solvedDelta > 0 ? "text-primary" : "text-muted-foreground";
  const accTrendColor = stats.accuracyDelta > 0 ? "text-emerald-brand" : stats.accuracyDelta < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Deep insights into your interview prep journey.">
        <Badge variant="outline">Live Data</Badge>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Code2} label="Problems solved" value={stats.solved.toString()} delta={`${formatDelta(stats.solvedDelta)} this month`} color="text-primary" bg="bg-primary/10" trend={stats.solvedDelta >= 0 ? "up" : "down"} />
        <StatCard icon={Target} label="Avg accuracy" value={`${stats.accuracy}%`} delta={`${formatDelta(stats.accuracyDelta, "%")}`} color="text-emerald-brand" bg="bg-emerald-brand/10" trend={stats.accuracyDelta >= 0 ? "up" : "down"} />
        <StatCard icon={Clock} label="Study hours" value={`${stats.studyHours}h`} delta={`${formatDelta(stats.studyHoursDelta, "h")}`} color="text-cyan-400" bg="bg-cyan-400/10" trend={stats.studyHoursDelta >= 0 ? "up" : "down"} />
        <StatCard icon={Trophy} label="Global rank" value={`#${stats.rank.toLocaleString()}`} delta="Current position" color="text-amber-500" bg="bg-amber-500/10" trend="up" />
        <StatCard icon={MessageSquare} label="Avg response" value={avgResponseFormat} delta="Interview speed" color="text-purple-400" bg="bg-purple-400/10" trend="up" />
        <StatCard icon={Sparkles} label="Confidence" value={`${confidenceData.length > 0 ? confidenceData[confidenceData.length-1].Confidence : 0}%`} delta="Latest interview" color="text-pink-500" bg="bg-pink-500/10" trend="up" />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/40 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold">Problems solved trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Weekly problem count over 12 weeks</p>
            </div>
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
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Accuracy"]} />
                <Line type="monotone" dataKey="accuracy" stroke="oklch(0.68 0.17 162)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold">Confidence trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Average AI confidence score per interview</p>
            </div>
          </div>
          <div className="h-56">
            {confidenceData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Confidence"]} />
                  <Line type="monotone" dataKey="Confidence" stroke="oklch(0.5 0.2 300)" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No confidence data yet
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
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
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={diff} innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270}>
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
                    <div className="h-full rounded-full" style={{ background: d.color, width: `${stats.solved > 0 ? (d.value / stats.solved) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-1 text-xs text-muted-foreground">{stats.solved} total</div>
            </div>
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <h3 className="font-bold mb-5">Topic Radar</h3>
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

        <Card className="border-border/40 p-6 shadow-soft">
          <h3 className="font-bold mb-5">Interview Radar</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <RadarChart data={interviewRadar}>
                <PolarGrid stroke="var(--border)" />
                <RadarPolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Radar dataKey="A" stroke="oklch(0.68 0.17 162)" fill="oklch(0.68 0.17 162)" fillOpacity={0.2} />
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
          <Badge variant="outline">{topics.length} topics</Badge>
        </div>
        
        {topics.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center border-2 border-dashed border-border/50 rounded-xl">
            Solve problems to see your topic mastery!
          </div>
        ) : (
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
        )}
      </Card>

      {/* Weak Topics */}
      <Card className="border-border/40 p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Needs Attention
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Key weaknesses identified in your mock interviews</p>
          </div>
          <Badge variant="outline">{topWeaknesses.length} areas</Badge>
        </div>
        
        {topWeaknesses.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center border-2 border-dashed border-border/50 rounded-xl">
            Complete mock interviews to identify your weak topics!
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {topWeaknesses.map((w) => (
              <div key={w.name} className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm">
                <span className="font-medium text-destructive">{w.name}</span>
                <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">
                  {w.count} {w.count === 1 ? 'mention' : 'mentions'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
