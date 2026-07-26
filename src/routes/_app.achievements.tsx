import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { Flame, Trophy, Zap, Code2, Bot, Target, Award, Crown, Sparkles, Lock, TrendingUp } from "lucide-react";
import { useAuth, supabaseBrowser } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { BADGES } from "@/server/functions/achievements"; // Wait, I can't import this either! I need to duplicate the BADGES array.

export const Route = createFileRoute("/_app/achievements")({ component: Achievements });

const rarityConfig: Record<string, { color: string; glow: boolean; label: string }> = {
  Common: { color: "border-border/40 text-muted-foreground", glow: false, label: "" },
  Rare: { color: "border-blue-400/40 text-blue-400 bg-blue-400/5", glow: false, label: "🔵" },
  Epic: { color: "border-purple-500/40 text-purple-500 bg-purple-500/5", glow: false, label: "🟣" },
  Legendary: { color: "border-amber-500/40 text-amber-500 bg-amber-500/5", glow: true, label: "⭐" },
};

// Map icon strings from DB to Lucide components
const iconMap: Record<string, any> = {
  "🔥": Flame,
  "⚡": Zap,
  "🏆": Trophy,
  "💎": Crown,
  "🎯": Target,
  "🚀": Sparkles,
  "💀": Award,
  "🤖": Bot,
  "📺": Bot,
  "🃏": Award,
  "📝": Code2,
  "🎤": Bot,
  "⭐": Crown,
  "📊": Award,
  "🧠": Award,
  "🕸️": Award,
};

const BADGES_LIST = [
  // Practice - Problems Solved
  { id: "solved_1",    name: "First Problem",      desc: "Solved your first problem",   icon: "⚡", xpReward: 50,  category: "Practice" },
  { id: "solved_10",   name: "10 Problems",        desc: "Solved 10 problems",          icon: "🏆", xpReward: 150, category: "Practice" },
  { id: "solved_50",   name: "50 Problems",        desc: "Solved 50 problems",          icon: "💎", xpReward: 500, category: "Practice" },
  { id: "solved_100",  name: "100 Problems",       desc: "Solved 100 problems",         icon: "🎯", xpReward: 1500, category: "Practice" },

  // Practice - Mastery
  { id: "master_array",name: "Arrays Master",      desc: "Solved 5 Array problems",     icon: "📊", xpReward: 300, category: "Practice" },
  { id: "master_dp",   name: "DP Master",          desc: "Solved 5 DP problems",        icon: "🧠", xpReward: 500, category: "Practice" },
  { id: "master_graph",name: "Graph Master",       desc: "Solved 5 Graph problems",     icon: "🕸️", xpReward: 400, category: "Practice" },

  // Streaks
  { id: "streak_7",    name: "7 Day Streak",       desc: "Maintained a 7-day streak",   icon: "🔥", xpReward: 200, category: "Streak" },
  { id: "streak_30",   name: "30 Day Streak",      desc: "Maintained a 30-day streak",  icon: "🔥", xpReward: 1000, category: "Streak" },

  // Features
  { id: "ai_explorer", name: "AI Tutor Explorer",  desc: "Had your first AI Tutor chat",icon: "🤖", xpReward: 100, category: "AI" },
  { id: "mock_expert", name: "Mock Interview Expert", desc: "Passed a mock interview",  icon: "🎤", xpReward: 500, category: "Interviews" },
  { id: "flash_champ", name: "Flashcard Champion", desc: "Reviewed 50 flashcards",      icon: "🃏", xpReward: 300, category: "Flashcards" },
];

function Achievements() {
  const { user } = useAuth();

  const dataQuery = useQuery({
    queryKey: ["achievements-page", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // 1. Fetch Achievements
      const { data: earned } = await supabaseBrowser
        .from("user_achievements")
        .select("badge_id, earned_at")
        .eq("user_id", user.id);

      const earnedMap: Record<string, string> = {};
      for (const e of earned ?? []) earnedMap[e.badge_id] = e.earned_at;

      const [profileRes, solvedRes, arrayRes, dpRes, graphRes, chatRes, mockPassRes, flashRes] = await Promise.all([
        supabaseBrowser.from("profiles").select("streak, xp").eq("id", user.id).single(),
        supabaseBrowser.from("user_problem_status").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("solved", true),
        supabaseBrowser.from("submissions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "Accepted").eq("problems.topic" as never, "Arrays"),
        supabaseBrowser.from("submissions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "Accepted").eq("problems.topic" as never, "Dynamic Programming"),
        supabaseBrowser.from("submissions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "Accepted").eq("problems.topic" as never, "Graphs"),
        supabaseBrowser.from("ai_chat_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabaseBrowser.from("mock_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("score", 80),
        supabaseBrowser.from("flashcard_reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      const streak = profileRes.data?.streak ?? 0;
      const solved = solvedRes.count ?? 0;
      const arrayCount = arrayRes.count ?? 0;
      const dpCount = dpRes.count ?? 0;
      const graphCount = graphRes.count ?? 0;
      const chats = chatRes.count ?? 0;
      const mockPassCount = mockPassRes.count ?? 0;
      const flashCount = flashRes.count ?? 0;

      const getProgress = (badgeId: string) => {
        const map: Record<string, { current: number; target: number }> = {
          solved_1: { current: solved, target: 1 },
          solved_10: { current: solved, target: 10 },
          solved_50: { current: solved, target: 50 },
          solved_100: { current: solved, target: 100 },
          master_array: { current: arrayCount, target: 5 },
          master_dp: { current: dpCount, target: 5 },
          master_graph: { current: graphCount, target: 5 },
          streak_7: { current: streak, target: 7 },
          streak_30: { current: streak, target: 30 },
          ai_explorer: { current: chats, target: 1 },
          mock_expert: { current: mockPassCount, target: 1 },
          flash_champ: { current: flashCount, target: 50 },
        };
        return map[badgeId] ?? { current: 0, target: 1 };
      };

      const achievements = BADGES_LIST.map((badge) => ({
        ...badge,
        earned: !!earnedMap[badge.id],
        earnedAt: earnedMap[badge.id] ?? null,
        progress: getProgress(badge.id),
        rarity: badge.xpReward >= 1000 ? "Legendary" : badge.xpReward >= 400 ? "Epic" : badge.xpReward >= 150 ? "Rare" : "Common"
      }));

      // 2. Fetch Leaderboard
      const { data: topUsers } = await supabaseBrowser
        .from("profiles")
        .select("id, full_name, xp, streak")
        .order("xp", { ascending: false })
        .limit(10);

      const userIds = (topUsers ?? []).map(u => u.id);
      const { data: statusCounts } = await supabaseBrowser
        .from("user_problem_status")
        .select("user_id")
        .in("user_id", userIds)
        .eq("solved", true);

      const problemsMap: Record<string, number> = {};
      for (const row of statusCounts ?? []) {
        problemsMap[row.user_id] = (problemsMap[row.user_id] || 0) + 1;
      }

      let rank = 1;
      const leaderboard = (topUsers ?? []).map((u) => ({
        rank: rank++,
        id: u.id,
        name: u.full_name || "Anonymous User",
        xp: u.xp,
        streak: u.streak,
        problems: problemsMap[u.id] || 0,
        self: u.id === user.id
      }));

      // 3. Stats (just use profileRes data and achievements length)
      const stats = {
        xp: profileRes.data?.xp ?? 0,
        streak: profileRes.data?.streak ?? 0,
        badgeCount: Object.keys(earnedMap).length
      };

      return { achievements, leaderboard, stats };
    },
    enabled: !!user,
  });

  if (dataQuery.isLoading || !dataQuery.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Achievements" description="Track your progress. Earn badges. Climb the leaderboard." />
        <Skeleton className="w-full h-64 rounded-xl" />
      </div>
    );
  }

  const { achievements: badges, leaderboard, stats } = dataQuery.data;

  const earnedBadges = badges.filter((b) => b.earned);
  
  // Calculate Level (Level 1 is 0 XP, Level 2 is 100 XP, Level 3 is 400 XP... Level = floor(0.1 * sqrt(XP)) + 1)
  const currentLevel = Math.floor(0.1 * Math.sqrt(stats.xp)) + 1;
  const nextLevelXP = Math.pow((currentLevel) / 0.1, 2);
  const currentLevelXP = Math.pow((currentLevel - 1) / 0.1, 2);
  const xpIntoLevel = stats.xp - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const levelProgress = Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForLevel) * 100));

  // Compute milestones (next 3 badges closest to completion)
  const lockedBadges = badges.filter((b) => !b.earned);
  const milestones = lockedBadges
    .map((b) => {
      const pct = Math.min(100, Math.round((b.progress.current / b.progress.target) * 100));
      return {
        label: b.category,
        name: b.name,
        progress: pct,
        left: `${b.progress.target - b.progress.current} more needed`,
        pctValue: pct
      };
    })
    .sort((a, b) => b.pctValue - a.pctValue)
    .slice(0, 3);

  // Pad milestones with placeholders if we don't have enough
  if (milestones.length < 3) {
    const defaultMilestones = [
      { label: "Level Up", name: `Reach Level ${currentLevel + 1}`, progress: Math.round(levelProgress), left: `${Math.round(nextLevelXP - stats.xp)} XP needed`, pctValue: 0 },
      { label: "Maintain Streak", name: "Keep it up!", progress: 100, left: "Log in tomorrow", pctValue: 0 }
    ];
    while (milestones.length < 3) {
      milestones.push(defaultMilestones.shift() ?? { label: "Completed", name: "All Milestones Done!", progress: 100, left: "Great job!", pctValue: 100 });
    }
  }

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
            <div className="text-5xl font-black text-primary-foreground">{stats.xp.toLocaleString()}</div>
            <div className="mt-4 flex items-center justify-between text-xs text-primary-foreground/70">
              <span>Level {currentLevel}</span>
              <span>{Math.round(nextLevelXP - stats.xp).toLocaleString()} to Level {currentLevel + 1}</span>
            </div>
            <Progress value={levelProgress} className="mt-2 h-2.5 bg-white/20 [&>div]:bg-white" />
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Current Streak</div>
          <div className="flex items-center gap-3">
            <Flame className="h-10 w-10 text-amber-500" />
            <div>
              <div className="text-4xl font-black">{stats.streak}</div>
              <div className="text-sm text-muted-foreground">days</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-brand" />
            <span className="text-muted-foreground">Keep it up!</span>
          </div>
        </Card>

        <Card className="border-border/40 p-6 shadow-soft">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-brand mb-2">Badges Earned</div>
          <div className="text-4xl font-black">{earnedBadges.length}<span className="text-lg font-normal text-muted-foreground"> / {badges.length}</span></div>
          <div className="mt-4 flex gap-1 flex-wrap">
            {earnedBadges.slice(0, 5).map((e, i) => (
              <span key={i} className="text-xl">{e.icon}</span>
            ))}
            {earnedBadges.length > 5 && (
              <span className="text-sm text-muted-foreground self-center ml-1">+{earnedBadges.length - 5} more</span>
            )}
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
            <div key={m.label + m.name} className="rounded-2xl border border-border/40 p-4">
              <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
              <div className="font-bold text-sm truncate">{m.name}</div>
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
              <Badge variant="outline">{earnedBadges.length} / {badges.length} earned</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {badges.map((b) => {
                const r = rarityConfig[b.rarity] || rarityConfig.Common;
                const IconComponent = iconMap[b.icon] || Award;
                return (
                  <div
                    key={b.id}
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
                      {b.earned ? <IconComponent className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                    </div>
                    <div className="text-sm font-bold leading-tight">{b.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{b.desc}</div>
                    {!b.earned && b.progress.target > 1 && (
                      <div className="mt-2 w-full">
                        <Progress value={(b.progress.current / b.progress.target) * 100} className="h-1.5" />
                        <div className="text-[9px] text-muted-foreground mt-1">{b.progress.current} / {b.progress.target}</div>
                      </div>
                    )}
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
              <Badge variant="outline">Top 10</Badge>
            </div>
            <div className="space-y-2">
              {leaderboard.map((u) => (
                <div
                  key={u.id}
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
