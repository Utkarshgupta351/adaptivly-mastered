/**
 * Mock Interviews server functions.
 * AI-driven Q&A sessions with scoring and feedback via Gemini.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const INTERVIEW_SYSTEM_PROMPTS: Record<string, string> = {
  Technical: `You are a senior software engineer conducting a technical interview. 
Ask coding and CS fundamentals questions. After each answer, provide brief feedback.
Start with a warm greeting and ask your first question.
When the interview ends, provide a score (0-100) and structured feedback.`,

  DSA: `You are a Google-level interviewer conducting a Data Structures & Algorithms interview.
Ask algorithmic problems and probe the candidate's problem-solving approach.
Expect discussion of time/space complexity. Provide hints if the candidate is stuck.
Start by greeting the candidate and presenting your first problem.`,

  "System Design": `You are a Staff Engineer conducting a System Design interview.
Ask the candidate to design a large-scale system. Probe for:
- Requirements clarification, capacity estimation
- High-level design, database schema
- Scaling, caching, load balancing, fault tolerance
Provide a final score and feedback on strengths and areas to improve.`,

  "HR / Behavioral": `You are an experienced HR professional conducting a behavioral interview.
Use the STAR method. Ask about real experiences. Be empathetic but probing.
Focus on teamwork, leadership, conflict resolution, and growth mindset.`,

  "Resume Review": `You are reviewing the candidate's resume as a senior engineering manager.
Ask the candidate to walk you through their resume. Ask probing questions about each item.
Give constructive feedback at the end.`,
};

const SCORING_PROMPT = `Based on our conversation, provide a final assessment in this exact JSON format (no markdown fences):
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestion": "One specific actionable improvement suggestion"
}`;

// ─── Start Session ────────────────────────────────────────────────────────────
export const startSession = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ token: z.string(), type: z.string() }).parse(data)
  )
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const userId = await requireUserId(data.token);

    const systemPrompt = INTERVIEW_SYSTEM_PROMPTS[data.type] ?? INTERVIEW_SYSTEM_PROMPTS["Technical"];
    const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: systemPrompt });
    const result = await model.generateContent("Begin the interview.");
    const firstMessage = result.response.text();

    // Create session in DB
    const messages = [{ role: "assistant", content: firstMessage }];
    const { data: session, error } = await supabase
      .from("mock_sessions")
      .insert({ user_id: userId, type: data.type, messages, status: "in_progress" })
      .select("id, type, messages, status, created_at")
      .single();
    if (error) throw new Error(error.message);

    return { sessionId: session.id, firstMessage };
  });

// ─── Send Answer ──────────────────────────────────────────────────────────────
const sendAnswerSchema = z.object({
  token: z.string(),
  sessionId: z.string(),
  answer: z.string().min(1),
  isEnd: z.boolean().default(false), // true = request final evaluation
});

export const sendAnswer = createServerFn({ method: "POST" })
  .validator((data: unknown) => sendAnswerSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const userId = await requireUserId(data.token);

    const { data: session } = await supabase
      .from("mock_sessions")
      .select("id, type, messages")
      .eq("id", data.sessionId)
      .eq("user_id", userId)
      .single();
    if (!session) throw new Error("Session not found");

    const messages: { role: string; content: string }[] = session.messages ?? [];
    messages.push({ role: "user", content: data.answer });

    const systemPrompt = INTERVIEW_SYSTEM_PROMPTS[session.type] ?? INTERVIEW_SYSTEM_PROMPTS["Technical"];
    const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: systemPrompt });

    // Rebuild history for Gemini
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const prompt = data.isEnd
      ? `${data.answer}\n\n---\n${SCORING_PROMPT}`
      : data.answer;

    const result = await chat.sendMessage(prompt);
    const aiResponse = result.response.text();
    messages.push({ role: "assistant", content: aiResponse });

    // If ending, parse score and update session
    if (data.isEnd) {
      let scoreData: { score: number; strengths: string[]; weaknesses: string[]; suggestion: string } | null = null;
      try {
        let raw = aiResponse.trim().replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
        // Extract JSON if embedded in text
        const jsonMatch = raw.match(/\{[\s\S]+\}/);
        if (jsonMatch) raw = jsonMatch[0];
        scoreData = JSON.parse(raw);
      } catch { /* non-critical */ }

      await supabase.from("mock_sessions").update({
        status: "completed",
        score: scoreData?.score ?? null,
        strengths: scoreData?.strengths ?? [],
        weaknesses: scoreData?.weaknesses ?? [],
        suggestion: scoreData?.suggestion ?? "",
        messages,
        completed_at: new Date().toISOString(),
      }).eq("id", data.sessionId);

      return { response: aiResponse, done: true, score: scoreData };
    }

    // Save updated messages
    await supabase.from("mock_sessions").update({ messages }).eq("id", data.sessionId);
    return { response: aiResponse, done: false, score: null };
  });

// ─── Get Sessions ─────────────────────────────────────────────────────────────
export const getSessions = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: sessions } = await supabase
      .from("mock_sessions")
      .select("id, type, score, status, strengths, weaknesses, suggestion, duration_min, created_at, completed_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    return sessions ?? [];
  });

// ─── Get Session Results ──────────────────────────────────────────────────────
export const getSessionResults = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string(), sessionId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: session } = await supabase
      .from("mock_sessions")
      .select("*")
      .eq("id", data.sessionId)
      .eq("user_id", userId)
      .single();
    if (!session) throw new Error("Session not found");
    return session;
  });
