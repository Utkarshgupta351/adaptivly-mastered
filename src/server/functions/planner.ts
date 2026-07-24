/**
 * Planner server functions — task CRUD, date-based retrieval, toggle done.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Get Tasks for a Date ─────────────────────────────────────────────────────
export const getTasks = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z.object({
      token: z.string(),
      date: z.string(),         // ISO date: "2025-07-24"
      daysAhead: z.number().default(0),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const from = `${data.date}T00:00:00Z`;
    const toDate = new Date(data.date);
    toDate.setDate(toDate.getDate() + data.daysAhead);
    const to = `${toDate.toISOString().split("T")[0]}T23:59:59Z`;

    const { data: tasks } = await supabase
      .from("planner_tasks")
      .select("id, title, tag, priority, scheduled_at, done, created_at")
      .eq("user_id", userId)
      .gte("scheduled_at", from)
      .lte("scheduled_at", to)
      .order("scheduled_at");

    return tasks ?? [];
  });

// ─── Create Task ──────────────────────────────────────────────────────────────
export const createTask = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      token: z.string(),
      title: z.string().min(1),
      tag: z.string().default(""),
      priority: z.enum(["high", "medium", "low"]).default("medium"),
      scheduledAt: z.string(),  // ISO datetime
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: task, error } = await supabase
      .from("planner_tasks")
      .insert({
        user_id: userId,
        title: data.title,
        tag: data.tag,
        priority: data.priority,
        scheduled_at: data.scheduledAt,
      })
      .select("id, title, tag, priority, scheduled_at, done")
      .single();
    if (error) throw new Error(error.message);
    return task;
  });

// ─── Update Task ──────────────────────────────────────────────────────────────
export const updateTask = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      token: z.string(),
      taskId: z.string(),
      title: z.string().optional(),
      tag: z.string().optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      scheduledAt: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const updates: Record<string, unknown> = {};
    if (data.title !== undefined) updates["title"] = data.title;
    if (data.tag !== undefined) updates["tag"] = data.tag;
    if (data.priority !== undefined) updates["priority"] = data.priority;
    if (data.scheduledAt !== undefined) updates["scheduled_at"] = data.scheduledAt;

    const { data: task, error } = await supabase
      .from("planner_tasks")
      .update(updates)
      .eq("id", data.taskId)
      .eq("user_id", userId)
      .select("id, title, tag, priority, scheduled_at, done")
      .single();
    if (error) throw new Error(error.message);
    return task;
  });

// ─── Toggle Task Done ─────────────────────────────────────────────────────────
export const toggleTask = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), taskId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const { data: existing } = await supabase
      .from("planner_tasks")
      .select("done")
      .eq("id", data.taskId)
      .eq("user_id", userId)
      .single();

    const newDone = !(existing?.done ?? false);
    await supabase
      .from("planner_tasks")
      .update({ done: newDone })
      .eq("id", data.taskId)
      .eq("user_id", userId);

    return { done: newDone };
  });

// ─── Delete Task ──────────────────────────────────────────────────────────────
export const deleteTask = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), taskId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    await supabase.from("planner_tasks").delete().eq("id", data.taskId).eq("user_id", userId);
    return { success: true };
  });
