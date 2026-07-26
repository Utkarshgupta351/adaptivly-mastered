/**
 * AI Tutor server functions — chat sessions, messages, Gemini-powered responses.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = `You are Adaptivly AI Tutor — an expert Personal Technical Mentor specializing in computer science, software engineering, and interview preparation. 
You are NOT a generic chatbot. You are a dedicated, personalized mentor that knows the user's learning history, strengths, and weaknesses.

CAPABILITIES & RESPONSIBILITIES:
- Explain complex concepts simply, using real-world analogies.
- Answer doubts and clear up misconceptions.
- Generate coding examples, explain code, and debug snippets provided by the user.
- Generate quizzes or interview questions on demand to test the user.
- Generate flashcards formatted clearly for the user to review.
- Explain time and space complexity for all algorithms.
- Explain mistakes in the user's logic gently but firmly.
- Track the conversation history to provide cohesive, continuous mentorship.

PERSONALIZATION RULES:
- You will be provided with the user's profile context (XP, streak, recent topics mastered, and identified weaknesses). 
- If the user asks a general question like "What should I study?", proactively suggest roadmaps, practice questions, or flashcards based specifically on their known weaknesses.
- If the user is weak in a specific area (e.g., Dynamic Programming), automatically suggest a structured roadmap or revision strategy.
- Keep your tone encouraging, enthusiastic, and highly technical. Use rich Markdown formatting (bold, code blocks, bullet lists).`;

// ─── Get Chat Sessions ────────────────────────────────────────────────────────
export const getChatSessions = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("@/server/auth");
    const { supabase } = await import("@/server/db");
    const userId = await requireUserId(data.token);
    const { data: sessions } = await supabase
      .from("ai_chat_sessions")
      .select("id, title, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20);
    return sessions ?? [];
  });

// ─── Get Chat Messages ────────────────────────────────────────────────────────
export const getChatMessages = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string(), sessionId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("@/server/auth");
    const { supabase } = await import("@/server/db");
    const userId = await requireUserId(data.token);
    // Verify ownership
    const { data: session } = await supabase
      .from("ai_chat_sessions")
      .select("id")
      .eq("id", data.sessionId)
      .eq("user_id", userId)
      .single();
    if (!session) throw new Error("Session not found");
    const { data: messages } = await supabase
      .from("ai_chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", data.sessionId)
      .order("created_at");
    return messages ?? [];
  });

// ─── Create Chat Session ──────────────────────────────────────────────────────
export const createChatSession = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), title: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("@/server/auth");
    const { supabase } = await import("@/server/db");
    const userId = await requireUserId(data.token);
    const { data: session, error } = await supabase
      .from("ai_chat_sessions")
      .insert({ user_id: userId, title: data.title ?? "New chat" })
      .select("id, title, created_at")
      .single();
    if (error) throw new Error(error.message);
    return session;
  });

// ─── Send Message + Get AI Response ──────────────────────────────────────────
const sendMessageSchema = z.object({
  token: z.string(),
  sessionId: z.string(),
  message: z.string().min(1),
});

export const sendMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => sendMessageSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("@/server/auth");
    const { supabase } = await import("@/server/db");
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const userId = await requireUserId(data.token);

    // Verify session ownership
    const { data: session } = await supabase
      .from("ai_chat_sessions")
      .select("id, title")
      .eq("id", data.sessionId)
      .eq("user_id", userId)
      .single();
    if (!session) throw new Error("Session not found");

    // Save user message
    await supabase.from("ai_chat_messages").insert({
      session_id: data.sessionId,
      role: "user",
      content: data.message,
    });

    // Fetch conversation history (last 20 messages for context)
    const { data: history } = await supabase
      .from("ai_chat_messages")
      .select("role, content")
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: true })
      .limit(20);

    // 1. Fetch Profile Context
    const { data: profile } = await supabase.from("profiles").select("xp, streak").eq("id", userId).single();
    
    // Fetch Learner Profile (diagnostic baselines)
    const { data: lp } = await supabase.from("learner_profiles").select("topics").eq("user_id", userId).maybeSingle();
    const baselineTopics = (lp?.topics as Record<string, number>) || {};
    const weakAssessmentTopics = Object.entries(baselineTopics)
      .filter(([_, score]) => score < 60)
      .map(([name, score]) => `${name} (${score}%)`);

    // 2. Fetch Weaknesses from Mock Interviews
    const { data: recentMocks } = await supabase
      .from("mock_sessions")
      .select("weaknesses")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(3);
    const recentWeaknesses = Array.from(new Set(recentMocks?.flatMap((m: any) => m.weaknesses ?? []) || []));

    // 3. Fetch Mastered Topics from Submissions
    const { data: submissions } = await supabase.from("submissions").select("status, problems(topic)").eq("user_id", userId);
    const topicStats: Record<string, { total: number; solved: number }> = {};
    if (submissions) {
      for (const sub of submissions) {
        const p = sub.problems as any;
        if (!p || !p.topic) continue;
        if (!topicStats[p.topic]) topicStats[p.topic] = { total: 0, solved: 0 };
        topicStats[p.topic].total += 1;
        if (sub.status === "Accepted") topicStats[p.topic].solved += 1;
      }
    }
    const masteredTopics = Object.entries(topicStats)
      .filter(([_, s]) => s.solved > 0)
      .map(([t, s]) => `${t} (${s.solved}/${s.total})`);

    const contextPrompt = `
USER PROFILE CONTEXT:
- XP: ${profile?.xp || 0}
- Streak: ${profile?.streak || 0}
- Topics Mastered/Attempted: ${masteredTopics.length > 0 ? masteredTopics.join(", ") : "None yet"}
- Initial Diagnostic baseline scores: ${JSON.stringify(baselineTopics)}
- Weak diagnostic domains: ${weakAssessmentTopics.length > 0 ? weakAssessmentTopics.join(", ") : "None yet"}
- Identified Weaknesses from recent Mock Interviews: ${recentWeaknesses.length > 0 ? recentWeaknesses.join(", ") : "None yet"}

Use this context to be a highly personalized mentor.`;

    const finalSystemInstruction = SYSTEM_PROMPT + "\n" + contextPrompt;

    // Build Gemini request
    const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: finalSystemInstruction
    });

    // 4. Strict History Alignment
    const rawHistory = (history ?? []).slice(0, -1).map((m: any) => ({
      role: (m.role === "user" ? "user" : "model") as "user" | "model",
      parts: [{ text: m.content || "..." }],
    }));

    const formattedHistory: { role: "user" | "model"; parts: { text: string }[] }[] = [];
    if (rawHistory.length > 0 && rawHistory[0].role === "model") {
      formattedHistory.push({ role: "user", parts: [{ text: "Hello! I need some help." }] });
    }
    for (const msg of rawHistory) {
      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === msg.role) {
        formattedHistory.push({
          role: msg.role === "user" ? "model" : "user",
          parts: [{ text: "Acknowledged." }],
        });
      }
      formattedHistory.push(msg);
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    // Timeout logic: race the API call with a 30 second timeout
    const result = await Promise.race([
      chat.sendMessage(data.message),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000))
    ]);
    const aiContent = result.response.text();

    // Save AI response
    const { data: aiMessage } = await supabase
      .from("ai_chat_messages")
      .insert({ session_id: data.sessionId, role: "assistant", content: aiContent })
      .select("id, role, content, created_at")
      .single();

    // Auto-update session title using AI from first message if still "New chat"
    if (session.title === "New chat") {
      try {
        const titleModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const titleResult = await Promise.race([
          titleModel.generateContent(`Analyze this user query and generate a short, clean, descriptive title of 2 to 4 words. Do not wrap in quotes or add a period. Query: "${data.message}"`),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
        ]);
        const aiTitle = titleResult.response.text().trim().replace(/['"]+/g, '');
        await supabase
          .from("ai_chat_sessions")
          .update({ title: aiTitle || "New chat", updated_at: new Date().toISOString() })
          .eq("id", data.sessionId);
      } catch (err) {
        const shortTitle = data.message.slice(0, 30) + (data.message.length > 30 ? "..." : "");
        await supabase
          .from("ai_chat_sessions")
          .update({ title: shortTitle, updated_at: new Date().toISOString() })
          .eq("id", data.sessionId);
      }
    } else {
      await supabase
        .from("ai_chat_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", data.sessionId);
    }

    // Check for newly unlocked badges
    const { checkAndAwardBadges } = await import("@/server/functions/achievements");
    await checkAndAwardBadges({ data: { token: data.token } });

    return aiMessage;
  });

// ─── Rename Chat Session ──────────────────────────────────────────────────────
export const renameChatSession = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), sessionId: z.string(), title: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("@/server/auth");
    const { supabase } = await import("@/server/db");
    const userId = await requireUserId(data.token);
    const { data: session, error } = await supabase
      .from("ai_chat_sessions")
      .update({ title: data.title, updated_at: new Date().toISOString() })
      .eq("id", data.sessionId)
      .eq("user_id", userId)
      .select("id, title")
      .single();
    if (error) throw new Error(error.message);
    return session;
  });

// ─── Delete Chat Session ──────────────────────────────────────────────────────
export const deleteChatSession = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), sessionId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("@/server/auth");
    const { supabase } = await import("@/server/db");
    const userId = await requireUserId(data.token);
    await supabase
      .from("ai_chat_sessions")
      .delete()
      .eq("id", data.sessionId)
      .eq("user_id", userId);
    return { success: true };
  });
