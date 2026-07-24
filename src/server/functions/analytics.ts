/**
 * Analytics server functions — all chart data for the analytics page.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string() });

// ─── Full Analytics (all charts in one call) ──────────────────────────────────
export const getAnalytics = createServerFn({ method: "GET" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const since90 = new Date();
    since90.setDate(since90.getDate() - 89);
    const since90Str = since90.toISOString().split("T")[0];

    const [profileRes, sessionsRes, submissionsRes, achievementsRes] = await Promise.all([
      supabase.from("profiles").select("xp, streak").eq("id", userId).single(),
      supabase
        .from("study_sessions")
        .select("session_date, problems_solved, duration_minutes")
        .eq("user_id", userId)
        .gte("session_date", since90Str)
        .order("session_date"),
      supabase
        .from("submissions")
        .select("status, created_at, problems(topic, difficulty)")
        .eq("user_id", userId)
        .gte("created_at", `${since90Str}T00:00:00Z`),
      supabase.from("user_achievements").select("id").eq("user_id", userId),
    ]);

    const sessions = sessionsRes.data ?? [];
    const submissions = submissionsRes.data ?? [];

    // ── Weekly solved trend (12 weeks) ───────────────────────────────────────
    const weekMap: Record<string, { solved: number; accepted: number }> = {};
    for (const s of sessions) {
      const d = new Date(s.session_date);
      const wk = getWeekLabel(d);
      if (!weekMap[wk]) weekMap[wk] = { solved: 0, accepted: 0 };
      weekMap[wk].solved += s.problems_solved;
    }
    for (const s of submissions) {
      const d = new Date(s.created_at);
      const wk = getWeekLabel(d);
      if (!weekMap[wk]) weekMap[wk] = { solved: 0, accepted: 0 };
      if (s.status === "Accepted") weekMap[wk].accepted++;
    }
    const trend = Object.entries(weekMap)
      .slice(-12)
      .map(([w, v]) => ({
        w,
        solved: v.solved,
        accuracy: v.solved > 0 ? Math.round((v.accepted / v.solved) * 100) : 0,
      }));

    // ── Daily study time (this week) ─────────────────────────────────────────
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const timeMap: Record<string, number> = {};
    for (const s of sessions.slice(-7)) timeMap[s.session_date] = s.duration_minutes / 60;
    const timeData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split("T")[0];
      return { d: days[d.getDay() === 0 ? 6 : d.getDay() - 1], hrs: timeMap[key] ?? 0 };
    });

    // ── Difficulty breakdown ──────────────────────────────────────────────────
    const diffCounts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    for (const s of submissions) {
      if (s.status === "Accepted") {
        const diff = (s as unknown as { problems: { difficulty: string } }).problems?.difficulty;
        if (diff && diffCounts[diff] !== undefined) diffCounts[diff]++;
      }
    }
    const diffData = [
      { name: "Easy", value: diffCounts["Easy"], color: "oklch(0.68 0.17 162)" },
      { name: "Medium", value: diffCounts["Medium"], color: "oklch(0.7 0.18 50)" },
      { name: "Hard", value: diffCounts["Hard"], color: "oklch(0.6 0.22 25)" },
    ];

    // ── Topic mastery ─────────────────────────────────────────────────────────
    const topicMap: Record<string, { total: number; accepted: number }> = {};
    for (const s of submissions) {
      const topic = (s as unknown as { problems: { topic: string } }).problems?.topic ?? "Other";
      if (!topicMap[topic]) topicMap[topic] = { total: 0, accepted: 0 };
      topicMap[topic].total++;
      if (s.status === "Accepted") topicMap[topic].accepted++;
    }
    const topicData = Object.entries(topicMap)
      .filter(([, v]) => v.total >= 1)
      .map(([n, v]) => ({ n, v: Math.round((v.accepted / v.total) * 100) }));

    // ── Radar data ────────────────────────────────────────────────────────────
    const radarSubjects = ["DSA", "System Design", "OS/DBMS", "Behavioral", "Networking", "Math/Stats"];
    const topicToRadar: Record<string, string> = {
      Arrays: "DSA", Trees: "DSA", Graphs: "DSA", "Dynamic Programming": "DSA",
      "System Design": "System Design",
      OS: "OS/DBMS", DBMS: "OS/DBMS",
      Networks: "Networking",
    };
    const radarMap: Record<string, { total: number; accepted: number }> = {};
    for (const [t, v] of Object.entries(topicMap)) {
      const subject = topicToRadar[t] ?? "DSA";
      if (!radarMap[subject]) radarMap[subject] = { total: 0, accepted: 0 };
      radarMap[subject].total += v.total;
      radarMap[subject].accepted += v.accepted;
    }
    const radarData = radarSubjects.map((subject) => ({
      subject,
      A: radarMap[subject]
        ? Math.round((radarMap[subject].accepted / radarMap[subject].total) * 100)
        : 0,
    }));

    // ── Summary stats ─────────────────────────────────────────────────────────
    const totalSolved = submissions.filter((s) => s.status === "Accepted").length;
    const totalHours = sessions.reduce((acc, s) => acc + s.duration_minutes, 0) / 60;
    const overallAccuracy =
      submissions.length > 0 ? Math.round((totalSolved / submissions.length) * 100) : 0;

    // Global rank (simple XP-based)
    const { count: rank } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("xp", profileRes.data?.xp ?? 0);

    return {
      stats: {
        totalSolved,
        accuracy: overallAccuracy,
        studyHours: Math.round(totalHours),
        globalRank: (rank ?? 0) + 1,
        streak: profileRes.data?.streak ?? 0,
        badges: achievementsRes.data?.length ?? 0,
      },
      trend,
      timeData,
      diffData,
      topicData,
      radarData,
    };
  });

function getWeekLabel(d: Date): string {
  const year = d.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `W${week}`;
}
