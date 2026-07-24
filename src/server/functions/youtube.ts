/**
 * YouTube Summarizer server functions.
 * Extracts transcript via youtube-transcript, then uses Gemini to generate
 * a structured summary, key points, concepts, and interview-ready notes.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Extract YouTube Video ID ─────────────────────────────────────────────────
function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const match = u.pathname.match(/\/embed\/([^/?]+)/);
      if (match) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Summarize Video ──────────────────────────────────────────────────────────
const summarizeSchema = z.object({
  token: z.string(),
  url: z.string().url(),
});

export const summarizeVideo = createServerFn({ method: "POST" })
  .validator((data: unknown) => summarizeSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const userId = await requireUserId(data.token);

    const videoId = extractVideoId(data.url);
    if (!videoId) throw new Error("Invalid YouTube URL — could not extract video ID");

    // Check if we already summarized this video for this user
    const { data: existing } = await supabase
      .from("yt_summaries")
      .select("*")
      .eq("user_id", userId)
      .eq("video_id", videoId)
      .maybeSingle();
    if (existing) return existing;

    // Fetch transcript
    let transcript = "";
    let videoTitle = "";
    let videoDuration = "";
    let channel = "";

    try {
      // Dynamically import youtube-transcript (ESM)
      const { YoutubeTranscript } = await import("youtube-transcript");
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = segments
        .map((s: { text: string; offset: number }) => {
          const minutes = Math.floor(s.offset / 60000);
          const seconds = Math.floor((s.offset % 60000) / 1000);
          return `[${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}] ${s.text}`;
        })
        .join("\n");
    } catch {
      throw new Error("Could not fetch transcript. The video may not have captions enabled.");
    }

    // Fetch basic metadata via oEmbed (no API key needed)
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (oembedRes.ok) {
        const meta = (await oembedRes.json()) as { title?: string; author_name?: string };
        videoTitle = meta.title ?? "";
        channel = meta.author_name ?? "";
      }
    } catch {
      /* ignore metadata fetch failure */
    }

    // Ask Gemini to generate structured summary
    const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert technical educator. Analyze the following YouTube lecture transcript and produce a structured study resource for software engineering / computer science interview preparation.

VIDEO TITLE: ${videoTitle || "Unknown"}
TRANSCRIPT:
${transcript.slice(0, 30000)} ${transcript.length > 30000 ? "\n[transcript truncated for length]" : ""}

Respond with a JSON object (and ONLY the JSON object, no markdown fences) with these exact fields:
{
  "summary": "3–5 paragraph comprehensive summary",
  "keyPoints": ["bullet point 1", "bullet point 2", ...],  (8–12 points)
  "concepts": ["concept1", "concept2", ...],  (6–10 key CS concepts covered)
  "tags": ["tag1", "tag2", ...],  (3–6 subject area tags like "DSA", "DP", "OS", etc.)
  "interviewNotes": "interview-ready markdown cheatsheet with the most important takeaways"
}`;

    const result = await model.generateContent(prompt);
    let rawJson = result.response.text().trim();
    // Strip markdown code fences if model included them anyway
    rawJson = rawJson.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");

    let parsed: {
      summary: string;
      keyPoints: string[];
      concepts: string[];
      tags: string[];
      interviewNotes: string;
    };
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new Error("AI returned malformed JSON — please try again");
    }

    // Save to DB
    const { data: saved, error } = await supabase
      .from("yt_summaries")
      .insert({
        user_id: userId,
        video_id: videoId,
        title: videoTitle,
        channel,
        duration: videoDuration,
        summary: parsed.summary,
        key_points: parsed.keyPoints,
        concepts: parsed.concepts,
        tags: parsed.tags,
        raw_transcript: transcript.slice(0, 50000),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return saved;
  });

// ─── Get Summaries History ────────────────────────────────────────────────────
export const getSummaries = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: summaries } = await supabase
      .from("yt_summaries")
      .select("id, video_id, title, channel, duration, tags, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    return summaries ?? [];
  });

// ─── Get Single Summary ───────────────────────────────────────────────────────
export const getSummary = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string(), id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: summary } = await supabase
      .from("yt_summaries")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", userId)
      .single();
    if (!summary) throw new Error("Summary not found");
    return summary;
  });

// ─── Save Summary to Notes ────────────────────────────────────────────────────
export const saveSummaryToNotes = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), summaryId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const { data: summary } = await supabase
      .from("yt_summaries")
      .select("*")
      .eq("id", data.summaryId)
      .eq("user_id", userId)
      .single();
    if (!summary) throw new Error("Summary not found");

    const content = `# ${summary.title}\n\n**Channel:** ${summary.channel}\n\n## Summary\n\n${summary.summary}\n\n## Key Points\n\n${summary.key_points.map((p: string) => `- ${p}`).join("\n")}\n\n## Key Concepts\n\n${summary.concepts.join(", ")}\n\n## Source\n\nhttps://www.youtube.com/watch?v=${summary.video_id}`;

    const { data: note, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: summary.title || "YouTube Summary",
        content,
        folder: "YouTube",
        tags: summary.tags,
        word_count: content.split(/\s+/).length,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { noteId: note.id };
  });
