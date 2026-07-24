/**
 * AI Tutor server functions — chat sessions, messages, Gemini-powered responses.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = `You are Adaptivly AI Tutor — an expert computer science tutor specialising in:
- Data Structures & Algorithms (DSA)
- System Design
- Operating Systems, DBMS, Computer Networks
- Technical interview preparation

Guidelines:
- Give clear, structured explanations with examples
- Use markdown formatting (bold, code blocks, bullet lists)
- When explaining algorithms, always include time/space complexity
- Encourage the student and be enthusiastic
- Keep responses focused and not overly long
- When asked about code, provide working examples
`;

// ─── Get Chat Sessions ────────────────────────────────────────────────────────
export const getChatSessions = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
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
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
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
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
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
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
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

    // Build Gemini request
    const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      systemInstruction: SYSTEM_PROMPT,
      history: (history ?? []).slice(0, -1).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(data.message);
    const aiContent = result.response.text();

    // Save AI response
    const { data: aiMessage } = await supabase
      .from("ai_chat_messages")
      .insert({ session_id: data.sessionId, role: "assistant", content: aiContent })
      .select("id, role, content, created_at")
      .single();

    // Auto-update session title from first message if still "New chat"
    if (session.title === "New chat") {
      const shortTitle = data.message.slice(0, 60) + (data.message.length > 60 ? "..." : "");
      await supabase
        .from("ai_chat_sessions")
        .update({ title: shortTitle, updated_at: new Date().toISOString() })
        .eq("id", data.sessionId);
    } else {
      await supabase
        .from("ai_chat_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", data.sessionId);
    }

    return aiMessage;
  });

// ─── Delete Chat Session ──────────────────────────────────────────────────────
export const deleteChatSession = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), sessionId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    await supabase
      .from("ai_chat_sessions")
      .delete()
      .eq("id", data.sessionId)
      .eq("user_id", userId);
    return { success: true };
  });
