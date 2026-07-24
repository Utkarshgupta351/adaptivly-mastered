/**
 * Achievements server functions — badge definitions, user progress, award logic.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Badge Definitions ────────────────────────────────────────────────────────
export const BADGES = [
  // Streak badges
  { id: "streak_3",    name: "Getting Started",   desc: "3-day streak",          icon: "🔥", xpReward: 50,  category: "Streak" },
  { id: "streak_7",    name: "Week Warrior",       desc: "7-day streak",          icon: "🔥", xpReward: 100, category: "Streak" },
  { id: "streak_30",   name: "Month Master",       desc: "30-day streak",         icon: "🔥", xpReward: 500, category: "Streak" },
  { id: "streak_100",  name: "Century Grind",      desc: "100-day streak",        icon: "🔥", xpReward: 2000, category: "Streak" },

  // Problems solved
  { id: "solved_1",    name: "First Blood",        desc: "Solved first problem",  icon: "⚡", xpReward: 25,  category: "Practice" },
  { id: "solved_10",   name: "Problem Solver",     desc: "Solved 10 problems",    icon: "🏆", xpReward: 100, category: "Practice" },
  { id: "solved_50",   name: "Grinder",            desc: "Solved 50 problems",    icon: "💎", xpReward: 300, category: "Practice" },
  { id: "solved_100",  name: "Century Club",       desc: "Solved 100 problems",   icon: "🎯", xpReward: 1000, category: "Practice" },
  { id: "solved_250",  name: "Elite Coder",        desc: "Solved 250 problems",   icon: "🚀", xpReward: 2500, category: "Practice" },

  // Difficulty badges
  { id: "hard_1",      name: "Brave Heart",        desc: "Solved first Hard problem", icon: "💀", xpReward: 200, category: "Practice" },
  { id: "hard_10",     name: "Hard Hitter",        desc: "Solved 10 Hard problems",   icon: "💀", xpReward: 500, category: "Practice" },

  // AI features
  { id: "ai_first",    name: "AI Apprentice",      desc: "First AI tutor chat",   icon: "🤖", xpReward: 50,  category: "AI" },
  { id: "yt_first",    name: "Lecture Ninja",      desc: "First YouTube summary", icon: "📺", xpReward: 50,  category: "AI" },

  // Flashcards
  { id: "flash_50",    name: "Card Shark",         desc: "Reviewed 50 flashcards", icon: "🃏", xpReward: 100, category: "Flashcards" },

  // Notes
  { id: "notes_10",    name: "Note Taker",         desc: "Created 10 notes",      icon: "📝", xpReward: 100, category: "Notes" },

  // Mock interviews
  { id: "mock_first",  name: "Interview Ready",    desc: "Completed first mock interview", icon: "🎤", xpReward: 150, category: "Interviews" },
  { id: "mock_pass",   name: "Top Candidate",      desc: "Scored 80+ in mock interview",   icon: "⭐", xpReward: 300, category: "Interviews" },
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
    const [profileRes, solvedRes, hardSolvedRes, chatRes, ytRes, notesRes, mockRes, mockPassRes] = await Promise.all([
      supabase.from("profiles").select("streak, xp").eq("id", userId).single(),
      supabase.from("user_problem_status").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("solved", true),
      supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "Accepted")
        .eq("problems.difficulty" as never, "Hard"),
      supabase.from("ai_chat_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("yt_summaries").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("mock_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
      supabase.from("mock_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("score", 80),
    ]);

    const streak = profileRes.data?.streak ?? 0;
    const solved = solvedRes.count ?? 0;
    const hardSolved = hardSolvedRes.count ?? 0;
    const chats = chatRes.count ?? 0;
    const ytCount = ytRes.count ?? 0;
    const notesCount = notesRes.count ?? 0;
    const mockCount = mockRes.count ?? 0;
    const mockPassCount = mockPassRes.count ?? 0;

    const getProgress = (badgeId: string): { current: number; target: number } => {
      const map: Record<string, { current: number; target: number }> = {
        streak_3: { current: streak, target: 3 },
        streak_7: { current: streak, target: 7 },
        streak_30: { current: streak, target: 30 },
        streak_100: { current: streak, target: 100 },
        solved_1: { current: solved, target: 1 },
        solved_10: { current: solved, target: 10 },
        solved_50: { current: solved, target: 50 },
        solved_100: { current: solved, target: 100 },
        solved_250: { current: solved, target: 250 },
        hard_1: { current: hardSolved, target: 1 },
        hard_10: { current: hardSolved, target: 10 },
        ai_first: { current: chats, target: 1 },
        yt_first: { current: ytCount, target: 1 },
        flash_50: { current: 0, target: 50 },
        notes_10: { current: notesCount, target: 10 },
        mock_first: { current: mockCount, target: 1 },
        mock_pass: { current: mockPassCount, target: 1 },
      };
      return map[badgeId] ?? { current: 0, target: 1 };
    };

    return BADGES.map((badge) => ({
      ...badge,
      earned: !!earnedMap[badge.id],
      earnedAt: earnedMap[badge.id] ?? null,
      progress: getProgress(badge.id),
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
