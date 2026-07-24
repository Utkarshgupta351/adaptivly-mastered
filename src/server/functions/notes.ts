/**
 * Notes server functions — CRUD, search, pin, star, auto-save.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string() });

// ─── Get Notes ────────────────────────────────────────────────────────────────
const getNotesSchema = z.object({
  token: z.string(),
  folder: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  pinned: z.boolean().optional(),
  starred: z.boolean().optional(),
});

export const getNotes = createServerFn({ method: "GET" })
  .validator((data: unknown) => getNotesSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    let query = supabase
      .from("notes")
      .select("id, title, folder, tags, pinned, starred, word_count, created_at, updated_at")
      .eq("user_id", userId);

    if (data.folder && data.folder !== "All") query = query.eq("folder", data.folder);
    if (data.tag) query = query.contains("tags", [data.tag]);
    if (data.search) query = query.ilike("title", `%${data.search}%`);
    if (data.pinned !== undefined) query = query.eq("pinned", data.pinned);
    if (data.starred !== undefined) query = query.eq("starred", data.starred);

    const { data: notes } = await query.order("updated_at", { ascending: false }).limit(100);

    return notes ?? [];
  });

// ─── Get Note (with content) ──────────────────────────────────────────────────
export const getNote = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string(), noteId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: note } = await supabase
      .from("notes")
      .select("*")
      .eq("id", data.noteId)
      .eq("user_id", userId)
      .single();
    if (!note) throw new Error("Note not found");
    return note;
  });

// ─── Create Note ──────────────────────────────────────────────────────────────
export const createNote = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      token: z.string(),
      title: z.string().min(1),
      folder: z.string().default("General"),
      tags: z.array(z.string()).default([]),
      content: z.string().default(""),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const wordCount = data.content.split(/\s+/).filter(Boolean).length;
    const { data: note, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: data.title,
        content: data.content,
        folder: data.folder,
        tags: data.tags,
        word_count: wordCount,
      })
      .select("id, title, folder, tags, pinned, starred, word_count, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return note;
  });

// ─── Update Note ──────────────────────────────────────────────────────────────
export const updateNote = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      token: z.string(),
      noteId: z.string(),
      title: z.string().optional(),
      content: z.string().optional(),
      folder: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const updates: Record<string, unknown> = {};
    if (data.title !== undefined) updates["title"] = data.title;
    if (data.folder !== undefined) updates["folder"] = data.folder;
    if (data.tags !== undefined) updates["tags"] = data.tags;
    if (data.content !== undefined) {
      updates["content"] = data.content;
      updates["word_count"] = data.content.split(/\s+/).filter(Boolean).length;
    }

    const { data: note, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", data.noteId)
      .eq("user_id", userId)
      .select("id, title, updated_at, word_count")
      .single();
    if (error) throw new Error(error.message);
    return note;
  });

// ─── Delete Note ──────────────────────────────────────────────────────────────
export const deleteNote = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), noteId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    await supabase.from("notes").delete().eq("id", data.noteId).eq("user_id", userId);
    return { success: true };
  });

// ─── Toggle Pin ───────────────────────────────────────────────────────────────
export const togglePin = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), noteId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: note } = await supabase
      .from("notes")
      .select("pinned")
      .eq("id", data.noteId)
      .eq("user_id", userId)
      .single();
    const newPinned = !(note?.pinned ?? false);
    await supabase.from("notes").update({ pinned: newPinned }).eq("id", data.noteId).eq("user_id", userId);
    return { pinned: newPinned };
  });

// ─── Toggle Star ──────────────────────────────────────────────────────────────
export const toggleStar = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), noteId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: note } = await supabase
      .from("notes")
      .select("starred")
      .eq("id", data.noteId)
      .eq("user_id", userId)
      .single();
    const newStarred = !(note?.starred ?? false);
    await supabase.from("notes").update({ starred: newStarred }).eq("id", data.noteId).eq("user_id", userId);
    return { starred: newStarred };
  });

// ─── Get Folders ──────────────────────────────────────────────────────────────
export const getFolders = createServerFn({ method: "GET" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: notes } = await supabase
      .from("notes")
      .select("folder")
      .eq("user_id", userId);
    const folderCounts: Record<string, number> = {};
    for (const n of notes ?? []) {
      folderCounts[n.folder] = (folderCounts[n.folder] ?? 0) + 1;
    }
    return Object.entries(folderCounts).map(([name, count]) => ({ name, count }));
  });
