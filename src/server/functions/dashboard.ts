/**
 * Dashboard server functions — stats, heatmap, weak/strong areas, AI recommendation.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string() });

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const getDashboardStats = createServerFn({ method: "GET" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    // Update streak based on activity before fetching profile
    await supabase.rpc("update_streak", { p_user_id: userId });

    const [profileRes, submissionsRes, achievementsRes, studyTodayRes] = await Promise.all([
      supabase.from("profiles").select("xp, coins, streak, daily_goal").eq("id", userId).single(),
      supabase.from("user_problem_status").select("solved").eq("user_id", userId).eq("solved", true),
      supabase.from("user_achievements").select("id").eq("user_id", userId),
      supabase
        .from("study_sessions")
        .select("problems_solved, duration_minutes")
        .eq("user_id", userId)
        .eq("session_date", new Date().toISOString().split("T")[0])
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    const solvedCount = submissionsRes.data?.length ?? 0;
    const badgeCount = achievementsRes.data?.length ?? 0;
    const todayProblems = studyTodayRes.data?.problems_solved ?? 0;
    const todayMinutes = studyTodayRes.data?.duration_minutes ?? 0;
    const dailyGoal = profile?.daily_goal ?? 5;
    const goalPct = Math.min(100, Math.round((todayProblems / dailyGoal) * 100));

    return {
      xp: profile?.xp ?? 0,
      coins: profile?.coins ?? 0,
      streak: profile?.streak ?? 0,
      badgeCount,
      solvedCount,
      todayProblems,
      todayMinutes,
      dailyGoal,
      goalPct,
    };
  });

// ─── Heatmap Data (20 weeks) ──────────────────────────────────────────────────
export const getHeatmapData = createServerFn({ method: "GET" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const since = new Date();
    since.setDate(since.getDate() - 140);

    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("session_date, problems_solved")
      .eq("user_id", userId)
      .gte("session_date", since.toISOString().split("T")[0]);

    // Build a map: date -> problems_solved
    const map: Record<string, number> = {};
    for (const s of sessions ?? []) {
      map[s.session_date] = s.problems_solved;
    }

    // Return 140 values (20 weeks × 7 days) ending today
    const vals: number[] = [];
    for (let i = 139; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const count = map[key] ?? 0;
      vals.push(Math.min(4, count)); // cap at 4 for heatmap shading
    }
    return { vals };
  });

// ─── Weekly Chart Data ────────────────────────────────────────────────────────
export const getWeeklyActivity = createServerFn({ method: "GET" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const since = new Date();
    since.setDate(since.getDate() - 6);

    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("session_date, problems_solved")
      .eq("user_id", userId)
      .gte("session_date", since.toISOString().split("T")[0])
      .order("session_date");

    const map: Record<string, number> = {};
    for (const s of sessions ?? []) map[s.session_date] = s.problems_solved;

    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split("T")[0];
      return { day: days[d.getDay()], problems: map[key] ?? 0 };
    });
  });

// ─── Weak and Strong Areas ────────────────────────────────────────────────────
export const getTopicPerformance = createServerFn({ method: "GET" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const { data: subs } = await supabase
      .from("submissions")
      .select("status, problem_id, problems(topic)")
      .eq("user_id", userId);

    // Aggregate per topic: accepted / total
    const topicMap: Record<string, { total: number; accepted: number }> = {};
    for (const s of subs ?? []) {
      const topic = (s as unknown as { problems: { topic: string } }).problems?.topic ?? "Other";
      if (!topicMap[topic]) topicMap[topic] = { total: 0, accepted: 0 };
      topicMap[topic].total++;
      if (s.status === "Accepted") topicMap[topic].accepted++;
    }

    const topics = Object.entries(topicMap)
      .filter(([, v]) => v.total >= 2)
      .map(([name, v]) => ({ name, pct: Math.round((v.accepted / v.total) * 100) }))
      .sort((a, b) => a.pct - b.pct);

    return {
      weak: topics.filter((t) => t.pct < 70).slice(0, 3),
      strong: topics.filter((t) => t.pct >= 80).slice(-2),
    };
  });

// ─── AI Recommendation ────────────────────────────────────────────────────────
export const getAIRecommendation = createServerFn({ method: "GET" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    // Find the weakest topic that has unsolved problems
    const { data: subs } = await supabase
      .from("submissions")
      .select("status, problems(topic, difficulty)")
      .eq("user_id", userId);

    const topicMap: Record<string, { total: number; accepted: number }> = {};
    for (const s of subs ?? []) {
      const topic = (s as unknown as { problems: { topic: string } }).problems?.topic ?? "Other";
      if (!topicMap[topic]) topicMap[topic] = { total: 0, accepted: 0 };
      topicMap[topic].total++;
      if (s.status === "Accepted") topicMap[topic].accepted++;
    }

    const weakest = Object.entries(topicMap)
      .filter(([, v]) => v.total >= 1)
      .sort(([, a], [, b]) => a.accepted / a.total - b.accepted / b.total)[0];

    // Find an unsolved problem in that topic
    const { data: problems } = weakest
      ? await supabase
          .from("problems")
          .select("id, title, difficulty, xp_reward")
          .eq("topic", weakest[0])
          .limit(1)
      : { data: [] };

    const problem = problems?.[0];
    return {
      topic: weakest?.[0] ?? "Dynamic Programming",
      problem: problem ?? null,
    };
  });

// ─── Today's Tasks ────────────────────────────────────────────────────────────
export const getTodaysTasks = createServerFn({ method: "GET" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const today = new Date().toISOString().split("T")[0];
    const { data: tasks } = await supabase
      .from("planner_tasks")
      .select("id, title, tag, done")
      .eq("user_id", userId)
      .gte("scheduled_at", `${today}T00:00:00Z`)
      .lte("scheduled_at", `${today}T23:59:59Z`)
      .order("scheduled_at");

    return tasks ?? [];
  });
