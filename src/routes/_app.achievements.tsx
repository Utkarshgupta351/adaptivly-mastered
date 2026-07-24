import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { Flame, Trophy, Zap, Code2, Bot, Target, Award, Crown, Sparkles, Lock, TrendingUp, Star } from "lucide-react";

export const Route = createFileRoute("/_app/achievements")({ component: Achievements });

const badges = [
  { name: "First Problem", icon: Code2, earned: true, rarity: "Common", desc: "Solved your first problem" },
  { name: "Week Warrior", icon: Zap, earned: true, rarity: "Common", desc: "7-day study streak" },
  { name: "Streak Master", icon: Flame, earned: true, rarity: "Rare", desc: "30-day streak achieved" },
  { name: "AI Whisperer", icon: Bot, earned: true, rarity: "Rare", desc: "50+ AI tutor sessions" },
  { name: "Sharpshooter", icon: Target, earned: true, rarity: "Rare", desc: "90%+ accuracy in a session" },
  { name: "Century Club", icon: Trophy, earned: true, rarity: "Epic", desc: "100 problems solved" },
  { name: "DP Master", icon: Award, earned: false, rarity: "Epic", desc: "Complete DP track with 80%+ accuracy" },
  { name: "FAANG Ready", icon: Crown, earned: false, rarity: "Legendary", desc: "Pass 5 FAANG-level mock interviews" },
];

const leaderboard = [
  { rank: 1, name: "Alex Kim", xp: 45820, streak: 72, problems: 812 },
  { rank: 2, name: "Priya S.", xp: 38400, streak: 58, problems: 674 },
  { rank: 3, name: "James W.", xp: 31200, streak: 44, problems: 543 },
  { rank: 4, name: "You", xp: 12480, streak: 42, problems: 348, self: true },
  { rank: 5, name: "Marcus C.", xp: 11200, streak: 28, problems: 298 },
  { rank: 6, name: "Aisha P.", xp: 9800, streak: 21, problems: 254 },
];

const rarityConfig: Record<string, { color: string; glow: boolean; label: string }> = {
  Common: { color: "border-border/40 text-muted-foreground", glow: false, label: "" },
  Rare: { color: "border-blue-400/40 text-blue-400 bg-blue-400/5", glow: false, label: "🔵" },
  Epic: { color: "border-purple-500/40 text-purple-500 bg-purple-500/5", glow: false, label: "🟣" },
  Legendary: { color: "border-amber-500/40 text-amber-500 bg-amber-500/5", glow: true, label: "⭐" },
};

const milestones = [
  { label: "Next badge", name: "DP Master", progress: 68, left: "32% accuracy needed" },
  { label: "Level 15", name: "2,520 XP to go", progress: 83, left: "Level 14 → 15" },
  { label: "200 day streak", name: "Keep it up!", progress: 21, left: "158 more days" },
];

function Achievements() {
  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" description="Track your progress. Earn badges. Climb the leaderboard." />

      {/* Top stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border-0 p-0 shadow-elegant">
          <div className="absolute inset-0 bg-gradient-primary" />
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
          <div className="relative p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70 mb-2">Total XP</div>
            <div className="text-5xl font-black text-primary-foreground">12,480</div>
            <div className="mt-4 flex items-center justify-between text-xs text-primary-foreground/70">
              <span>Level 14</span>
              <span>2,520 to Level 15</span>
            </div>
            <Progress value={83} className="mt-2 h-2.5 bg-white/20 [&>div]:bg-white" />
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Current Streak</div>
          <div className="flex items-center gap-3">
            <Flame className="h-10 w-10 text-amber-500" />
            <div>
              <div className="text-4xl font-black">42</div>
              <div className="text-sm text-muted-foreground">days</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-brand" />
            <span className="text-muted-foreground">Personal best: <strong className="text-foreground">58 days</strong></span>
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-brand mb-2">Badges Earned</div>
          <div className="text-4xl font-black">18<span className="text-lg font-normal text-muted-foreground"> / 42</span></div>
          <div className="mt-4 flex gap-1 flex-wrap">
            {["🥇", "🥈", "🥉", "⭐", "🔵"].map((e, i) => (
              <span key={i} className="text-xl">{e}</span>
            ))}
            <span className="text-sm text-muted-foreground self-center ml-1">+13 more</span>
          </div>
        </Card>
      </div>

      {/* Milestones */}
      <Card className="border-border/40 p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-5">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-bold">Next milestones</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {milestones.map((m) => (
            <div key={m.label} className="rounded-2xl border border-border/40 p-4">
              <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
              <div className="font-bold text-sm">{m.name}</div>
              <Progress value={m.progress} className="mt-3 h-2" />
              <div className="mt-1.5 text-xs text-muted-foreground">{m.progress}% · {m.left}</div>
            </div>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="badges">
        <TabsList className="rounded-xl">
          <TabsTrigger value="badges" className="rounded-lg">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard" className="rounded-lg">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-4">
          <Card className="border-border/40 p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">All badges</h3>
              <Badge variant="outline">{badges.filter((b) => b.earned).length} / {badges.length} earned</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {badges.map((b) => {
                const r = rarityConfig[b.rarity];
                return (
                  <div
                    key={b.name}
                    className={`group relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all ${
                      b.earned
                        ? `${r.color} hover:-translate-y-1 hover:shadow-elegant cursor-pointer`
                        : "border-border/30 opacity-40"
                    }`}
                  >
                    {b.earned && b.rarity === "Legendary" && (
                      <div className="absolute inset-0 rounded-2xl animate-pulse-glow bg-amber-500/5" />
                    )}
                    <div
                      className={`relative grid h-16 w-16 place-items-center rounded-2xl mb-3 ${
                        b.earned ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {b.earned ? <b.icon className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                    </div>
                    <div className="text-sm font-bold leading-tight">{b.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{b.desc}</div>
                    <Badge variant="outline" className={`mt-3 text-[10px] ${r.color}`}>
                      {r.label} {b.rarity}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card className="border-border/40 p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold">Global leaderboard</h3>
              </div>
              <Badge variant="outline">Top 1,500 / 50,000</Badge>
            </div>
            <div className="space-y-2">
              {leaderboard.map((u) => (
                <div
                  key={u.rank}
                  className={`flex items-center gap-4 rounded-2xl p-4 transition-all ${
                    u.self ? "bg-primary/10 ring-1 ring-primary/30 shadow-soft" : "hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${
                      u.rank === 1 ? "bg-amber-500 text-white shadow-glow" :
                      u.rank === 2 ? "bg-slate-400 text-white" :
                      u.rank === 3 ? "bg-orange-500 text-white" :
                      u.self ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {u.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm ${u.self ? "text-primary" : ""}`}>
                      {u.name} {u.self && <span className="text-xs font-normal text-muted-foreground">(You)</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-amber-500" />{u.streak}d</span>
                      <span className="flex items-center gap-1"><Code2 className="h-3 w-3" />{u.problems}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-black text-sm ${u.rank === 1 ? "text-gradient" : ""}`}>
                      {u.xp.toLocaleString()} XP
                    </div>
                    {u.rank === 1 && <Sparkles className="ml-auto h-4 w-4 text-amber-500 mt-0.5" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
