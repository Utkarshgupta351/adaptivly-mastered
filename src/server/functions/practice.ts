/**
 * Practice server functions — problems list, submission, code execution, star toggle.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Get Problems (paginated + filtered) ──────────────────────────────────────
const getProblemsSchema = z.object({
  token: z.string(),
  topic: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  solved: z.boolean().optional(),
  starred: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(50),
});

export const getProblems = createServerFn({ method: "GET" })
  .validator((data: unknown) => getProblemsSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    let query = supabase
      .from("problems")
      .select("id, title, difficulty, topic, tags, acceptance, xp_reward, leetcode_url, neetcode_url");

    if (data.topic) query = query.eq("topic", data.topic);
    if (data.difficulty) query = query.eq("difficulty", data.difficulty);
    if (data.search) query = query.ilike("title", `%${data.search}%`);

    const { data: problems } = await query.order("id");

    // Get user status for all problems
    const { data: statuses } = await supabase
      .from("user_problem_status")
      .select("problem_id, solved, starred")
      .eq("user_id", userId);

    const statusMap: Record<number, { solved: boolean; starred: boolean }> = {};
    for (const s of statuses ?? []) statusMap[s.problem_id] = { solved: s.solved, starred: s.starred };

    let result = (problems ?? []).map((p) => ({
      ...p,
      solved: statusMap[p.id]?.solved ?? false,
      starred: statusMap[p.id]?.starred ?? false,
    }));

    // Filter by solved/starred if requested
    if (data.solved !== undefined) result = result.filter((p) => p.solved === data.solved);
    if (data.starred !== undefined) result = result.filter((p) => p.starred === data.starred);

    const total = result.length;
    const start = (data.page - 1) * data.pageSize;
    return { problems: result.slice(start, start + data.pageSize), total };
  });

// ─── Get Single Problem ───────────────────────────────────────────────────────
const getProblemSchema = z.object({ token: z.string(), problemId: z.number() });

export const getProblem = createServerFn({ method: "GET" })
  .validator((data: unknown) => getProblemSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const [problemRes, statusRes] = await Promise.all([
      supabase.from("problems").select("*").eq("id", data.problemId).single(),
      supabase
        .from("user_problem_status")
        .select("solved, starred")
        .eq("user_id", userId)
        .eq("problem_id", data.problemId)
        .maybeSingle(),
    ]);

    if (problemRes.error) throw new Error("Problem not found");
    return {
      ...problemRes.data,
      solved: statusRes.data?.solved ?? false,
      starred: statusRes.data?.starred ?? false,
    };
  });

// ─── Toggle Starred ───────────────────────────────────────────────────────────
const toggleStarredSchema = z.object({ token: z.string(), problemId: z.number() });

export const toggleStarred = createServerFn({ method: "POST" })
  .validator((data: unknown) => toggleStarredSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const { data: existing } = await supabase
      .from("user_problem_status")
      .select("solved, starred")
      .eq("user_id", userId)
      .eq("problem_id", data.problemId)
      .maybeSingle();

    const newStarred = !((existing as { starred?: boolean } | null)?.starred ?? false);
    await supabase.from("user_problem_status").upsert({
      user_id: userId,
      problem_id: data.problemId,
      starred: newStarred,
      solved: existing?.solved ?? false, // preserve existing
    });
    return { starred: newStarred };
  });

// ─── Run Code (Judge0 — no save) ──────────────────────────────────────────────
const JUDGE0_LANG_IDS: Record<string, number> = {
  Python: 71,
  JavaScript: 63,
  Java: 62,
  "C++": 54,
  Go: 60,
  TypeScript: 74,
  Rust: 73,
  C: 50,
};

const runCodeSchema = z.object({
  token: z.string(),
  language: z.string(),
  code: z.string(),
  stdin: z.string().optional(),
});

export const runCode = createServerFn({ method: "POST" })
  .validator((data: unknown) => runCodeSchema.parse(data))
  .handler(async ({ data }) => {
    const langId = JUDGE0_LANG_IDS[data.language];
    if (!langId) throw new Error(`Unsupported language: ${data.language}`);

    const apiUrl = process.env["JUDGE0_API_URL"] ?? "https://judge0-ce.p.rapidapi.com";
    const apiKey = process.env["JUDGE0_API_KEY"];

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["X-RapidAPI-Key"] = apiKey;
      headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
    }

    // Submit
    const submitRes = await fetch(`${apiUrl}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: langId,
        source_code: data.code,
        stdin: data.stdin ?? "",
      }),
    });
    const result = (await submitRes.json()) as {
      status?: { description: string };
      stdout?: string;
      stderr?: string;
      compile_output?: string;
      time?: string;
      memory?: number;
    };

    return {
      status: result.status?.description ?? "Unknown",
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? result.compile_output ?? "",
      runtime: result.time ? `${parseFloat(result.time) * 1000}ms` : null,
      memory: result.memory ? `${Math.round(result.memory / 1024)}MB` : null,
    };
  });

// ─── Submit Code (Judge0 + save + XP) ────────────────────────────────────────
const submitCodeSchema = z.object({
  token: z.string(),
  problemId: z.number(),
  language: z.string(),
  code: z.string(),
});

export const submitCode = createServerFn({ method: "POST" })
  .validator((data: unknown) => submitCodeSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    // Get problem for test cases and XP reward
    const { data: problem } = await supabase
      .from("problems")
      .select("examples, xp_reward")
      .eq("id", data.problemId)
      .single();

    // Run against first example as stdin
    const firstExample = problem?.examples?.[0];
    const runResult = await runCode({
      data: {
        token: data.token,
        language: data.language,
        code: data.code,
        stdin: firstExample?.input ?? "",
      },
    });

    const isAccepted = runResult.status === "Accepted";

    // Save submission
    const { data: submission } = await supabase
      .from("submissions")
      .insert({
        user_id: userId,
        problem_id: data.problemId,
        language: data.language,
        code: data.code,
        status: isAccepted ? "Accepted" : "Wrong Answer",
        runtime_ms: runResult.runtime ? parseInt(runResult.runtime) : null,
        memory_kb: null,
      })
      .select("id")
      .single();

    // Mark solved + award XP if first accepted submission
    if (isAccepted) {
      const { data: existing } = await supabase
        .from("user_problem_status")
        .select("solved")
        .eq("user_id", userId)
        .eq("problem_id", data.problemId)
        .maybeSingle();

      const alreadySolved = existing?.solved ?? false;

      await supabase.from("user_problem_status").upsert({
        user_id: userId,
        problem_id: data.problemId,
        solved: true,
        starred: (existing as { solved?: boolean; starred?: boolean } | null)?.starred ?? false,
      });

      // Award XP and coins only for first solve
      if (!alreadySolved) {
        const xp = problem?.xp_reward ?? 50;
        await supabase.rpc("increment_profile_stats", {
          p_user_id: userId,
          p_xp: xp,
          p_coins: Math.floor(xp / 5),
        });

        // Update today's study session
        const today = new Date().toISOString().split("T")[0];
        await supabase.from("study_sessions").upsert({
          user_id: userId,
          session_date: today,
          problems_solved: 1,
          duration_minutes: 0,
        }, { onConflict: "user_id,session_date", ignoreDuplicates: false });
      }
    }

    return {
      submissionId: submission?.id,
      status: runResult.status,
      stdout: runResult.stdout,
      stderr: runResult.stderr,
      runtime: runResult.runtime,
      memory: runResult.memory,
      accepted: isAccepted,
    };
  });

// ─── Get User Problem Status (all) ────────────────────────────────────────────
export const getUserProblemStatus = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: statuses } = await supabase
      .from("user_problem_status")
      .select("problem_id, solved, starred")
      .eq("user_id", userId);
    const map: Record<number, { solved: boolean; starred: boolean }> = {};
    for (const s of statuses ?? []) map[s.problem_id] = { solved: s.solved, starred: s.starred };
    return map;
  });
