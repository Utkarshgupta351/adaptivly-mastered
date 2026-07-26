/**
 * Achievements server functions — badge definitions, user progress, award logic.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Badge Definitions ────────────────────────────────────────────────────────
export const BADGES = [
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

// ─── Get Achievements ─────────────────────────────────────────────────────────
export const getAchievements = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const { data: earned } = await supabase
      .from("user_achievements")
      .select("badge_id, earned_at")
      .eq("user_id", userId);

    const earnedMap: Record<string, string> = {};
    for (const e of earned ?? []) earnedMap[e.badge_id] = e.earned_at;

    // Get progress data for locked badges
    const [profileRes, solvedRes, arrayRes, dpRes, graphRes, chatRes, mockPassRes, flashRes] = await Promise.all([
      supabase.from("profiles").select("streak, xp").eq("id", userId).single(),
      supabase.from("user_problem_status").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("solved", true),
      // Array problems solved
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "Accepted").eq("problems.topic" as never, "Arrays"),
      // DP problems solved
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "Accepted").eq("problems.topic" as never, "Dynamic Programming"),
      // Graph problems solved
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "Accepted").eq("problems.topic" as never, "Graphs"),
      
      supabase.from("ai_chat_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("mock_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("score", 80),
      supabase.from("flashcard_reviews").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    const streak = profileRes.data?.streak ?? 0;
    const solved = solvedRes.count ?? 0;
    const arrayCount = arrayRes.count ?? 0;
    const dpCount = dpRes.count ?? 0;
    const graphCount = graphRes.count ?? 0;
    const chats = chatRes.count ?? 0;
    const mockPassCount = mockPassRes.count ?? 0;
    const flashCount = flashRes.count ?? 0;

    const getProgress = (badgeId: string): { current: number; target: number } => {
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

    return BADGES.map((badge) => ({
      ...badge,
      earned: !!earnedMap[badge.id],
      earnedAt: earnedMap[badge.id] ?? null,
      progress: getProgress(badge.id),
      // Assign rarity based on XP reward
      rarity: badge.xpReward >= 1000 ? "Legendary" : badge.xpReward >= 400 ? "Epic" : badge.xpReward >= 150 ? "Rare" : "Common"
    }));
  });

// ─── Get Leaderboard ──────────────────────────────────────────────────────────
export const getLeaderboard = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    // Get top 10 users
    const { data: topUsers } = await supabase
      .from("profiles")
      .select("id, full_name, xp, streak")
      .order("xp", { ascending: false })
      .limit(10);

    // For number of problems solved per user in leaderboard, we can fetch all or just join it
    // Supabase JS doesn't easily let us group by for nested counts without RPC, so we fetch problems counts for these 10 users:
    const userIds = (topUsers ?? []).map(u => u.id);
    const { data: statusCounts } = await supabase
      .from("user_problem_status")
      .select("user_id")
      .in("user_id", userIds)
      .eq("solved", true);

    const problemsMap: Record<string, number> = {};
    for (const row of statusCounts ?? []) {
      problemsMap[row.user_id] = (problemsMap[row.user_id] || 0) + 1;
    }

    let rank = 1;
    return (topUsers ?? []).map((u) => ({
      rank: rank++,
      id: u.id,
      name: u.full_name || "Anonymous User",
      xp: u.xp,
      streak: u.streak,
      problems: problemsMap[u.id] || 0,
      self: u.id === userId
    }));
  });

// ─── Check and Award Badges ───────────────────────────────────────────────────
// Called internally after key events (submit, chat, etc.)
export const checkAndAwardBadges = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    // Get all achievements (reuse getAchievements logic)
    const achievements = await getAchievements({ data: { token: data.token } });
    const newlyEarned: string[] = [];

    for (const badge of achievements) {
      if (!badge.earned && badge.progress.current >= badge.progress.target) {
        const { error } = await supabase
          .from("user_achievements")
          .insert({ user_id: userId, badge_id: badge.id });
        if (!error) {
          newlyEarned.push(badge.id);
          // Award XP for badge
          await supabase.rpc("increment_profile_stats", {
            p_user_id: userId,
            p_xp: badge.xpReward,
            p_coins: Math.floor(badge.xpReward / 10),
          });
        }
      }
    }

    return { newlyEarned };
  });
