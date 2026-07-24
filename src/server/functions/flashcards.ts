/**
 * Flashcards server functions with SM-2 spaced repetition algorithm.
 *
 * SM-2 Algorithm:
 *   - rating "easy"  → quality = 5
 *   - rating "good"  → quality = 4
 *   - rating "hard"  → quality = 2
 *
 *   new_ease = max(1.3, ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
 *   if quality < 3: interval = 1
 *   else if interval == 0: interval = 1
 *   else if interval == 1: interval = 6
 *   else: interval = round(interval * ease)
 *   next_review = now + interval days
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── SM-2 ──────────────────────────────────────────────────────────────────────
function sm2(rating: "easy" | "good" | "hard", easeFactor: number, intervalDays: number) {
  const quality = rating === "easy" ? 5 : rating === "good" ? 4 : 2;
  const newEase = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  let newInterval: number;
  if (quality < 3) {
    newInterval = 1;
  } else if (intervalDays === 0) {
    newInterval = 1;
  } else if (intervalDays === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(intervalDays * newEase);
  }
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  return { newEase, newInterval, nextReview };
}

const tokenSchema = z.object({ token: z.string() });

// ─── Get Decks ────────────────────────────────────────────────────────────────
export const getDecks = createServerFn({ method: "GET" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const { data: decks } = await supabase
      .from("flashcard_decks")
      .select("id, name, subject, created_at")
      .eq("user_id", userId)
      .order("created_at");

    if (!decks) return [];

    // Attach card counts
    const result = await Promise.all(
      decks.map(async (deck) => {
        const [{ count: total }, { count: mastered }] = await Promise.all([
          supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("deck_id", deck.id),
          supabase
            .from("flashcard_reviews")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .in("card_id", (await supabase.from("flashcards").select("id").eq("deck_id", deck.id)).data?.map((c) => c.id) ?? [])
            .in("rating", ["easy"]),
        ]);
        return { ...deck, total: total ?? 0, mastered: mastered ?? 0 };
      })
    );
    return result;
  });

// ─── Get Deck Cards (due for review) ─────────────────────────────────────────
export const getDeckCards = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string(), deckId: z.string(), dueOnly: z.boolean().default(true) }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const { data: cards } = await supabase
      .from("flashcards")
      .select("id, question, answer, difficulty")
      .eq("deck_id", data.deckId);

    if (!cards || cards.length === 0) return [];

    const cardIds = cards.map((c) => c.id);
    const { data: reviews } = await supabase
      .from("flashcard_reviews")
      .select("card_id, rating, ease_factor, interval_days, next_review_at")
      .eq("user_id", userId)
      .in("card_id", cardIds);

    const reviewMap: Record<string, typeof reviews extends (infer T)[] | null ? T : never> = {};
    for (const r of reviews ?? []) reviewMap[(r as { card_id: string }).card_id] = r as typeof reviewMap[string];

    const now = new Date().toISOString();
    const result = cards
      .map((card) => {
        const rev = reviewMap[card.id];
        return {
          ...card,
          easeFactor: (rev as { ease_factor?: number } | undefined)?.ease_factor ?? 2.5,
          intervalDays: (rev as { interval_days?: number } | undefined)?.interval_days ?? 0,
          nextReviewAt: (rev as { next_review_at?: string } | undefined)?.next_review_at ?? now,
          isDue: !rev || (rev as { next_review_at?: string }).next_review_at! <= now,
        };
      })
      .filter((c) => !data.dueOnly || c.isDue);

    return result;
  });

// ─── Create Deck ──────────────────────────────────────────────────────────────
export const createDeck = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ token: z.string(), name: z.string(), subject: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    const { data: deck, error } = await supabase
      .from("flashcard_decks")
      .insert({ user_id: userId, name: data.name, subject: data.subject ?? "" })
      .select("id, name, subject")
      .single();
    if (error) throw new Error(error.message);
    return deck;
  });

// ─── Create Card ──────────────────────────────────────────────────────────────
export const createCard = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      token: z.string(),
      deckId: z.string(),
      question: z.string().min(1),
      answer: z.string().min(1),
      difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);
    // Verify deck ownership
    const { data: deck } = await supabase
      .from("flashcard_decks")
      .select("id")
      .eq("id", data.deckId)
      .eq("user_id", userId)
      .single();
    if (!deck) throw new Error("Deck not found");
    const { data: card, error } = await supabase
      .from("flashcards")
      .insert({ deck_id: data.deckId, question: data.question, answer: data.answer, difficulty: data.difficulty })
      .select("id, question, answer, difficulty")
      .single();
    if (error) throw new Error(error.message);
    return card;
  });

// ─── Review Card (SM-2) ───────────────────────────────────────────────────────
export const reviewCard = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      token: z.string(),
      cardId: z.string(),
      rating: z.enum(["easy", "good", "hard"]),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    // Get current review state
    const { data: existing } = await supabase
      .from("flashcard_reviews")
      .select("ease_factor, interval_days")
      .eq("card_id", data.cardId)
      .eq("user_id", userId)
      .maybeSingle();

    const { newEase, newInterval, nextReview } = sm2(
      data.rating,
      existing?.ease_factor ?? 2.5,
      existing?.interval_days ?? 0
    );

    await supabase.from("flashcard_reviews").upsert({
      card_id: data.cardId,
      user_id: userId,
      rating: data.rating,
      ease_factor: newEase,
      interval_days: newInterval,
      next_review_at: nextReview.toISOString(),
      reviewed_at: new Date().toISOString(),
    }, { onConflict: "card_id,user_id" });

    return { nextReviewAt: nextReview.toISOString(), intervalDays: newInterval };
  });

// ─── Get Deck Stats ───────────────────────────────────────────────────────────
export const getDeckStats = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth");
    const { supabase } = await import("../db");
    const userId = await requireUserId(data.token);

    const [totalRes, reviewedRes] = await Promise.all([
      supabase.from("flashcards").select("id", { count: "exact", head: true }),
      supabase
        .from("flashcard_reviews")
        .select("card_id, rating, next_review_at")
        .eq("user_id", userId),
    ]);

    const reviews = reviewedRes.data ?? [];
    const now = new Date().toISOString();
    const mastered = reviews.filter((r) => r.rating === "easy").length;
    const due = reviews.filter((r) => r.next_review_at <= now).length;

    return {
      total: totalRes.count ?? 0,
      mastered,
      due,
    };
  });
