import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Shuffle, RotateCw, Plus, BookOpen, Target, Zap, Flame, BrainCircuit, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, supabaseBrowser } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { generateFlashcardsAI } from "@/lib/ai-flashcards";

export const Route = createFileRoute("/_app/flashcards")({ component: Flashcards });

// SM-2 algorithm math
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

function Flashcards() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const [activeDeckIdx, setActiveDeckIdx] = useState(0);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState<any[]>([]);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiContext, setAiContext] = useState("");
  const [generateStatus, setGenerateStatus] = useState<"idle" | "analyzing" | "saving">("idle");

  // 1. Fetch Decks
  const decksQuery = useQuery({
    queryKey: ["flashcard_decks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      let { data: decks } = await supabaseBrowser
        .from("flashcard_decks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at");
        
      if (!decks || decks.length === 0) {
        // Auto-seed standard decks
        const defaultNames = ["DSA Fundamentals", "OS & DBMS", "System Design", "Behavioral", "Computer Networks", "AI & ML", "Web Dev"];
        const insertData = defaultNames.map(name => ({ user_id: user.id, name, subject: name }));
        const { data: newDecks } = await supabaseBrowser.from("flashcard_decks").insert(insertData).select("*");
        decks = newDecks || [];
      }
      
      const stats = await Promise.all(decks.map(async (deck: any, i: number) => {
         const { count: total } = await supabaseBrowser.from("flashcards").select("id", { count: "exact", head: true }).eq("deck_id", deck.id);
         
         const { data: cards } = await supabaseBrowser.from("flashcards").select("id").eq("deck_id", deck.id);
         const cardIds = cards?.map(c => c.id) || [];
         let mastered = 0;
         if (cardIds.length > 0) {
           const { count: masteredCount } = await supabaseBrowser.from("flashcard_reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("card_id", cardIds).eq("rating", "easy");
           mastered = masteredCount || 0;
         }
         
         const colors = [
            "bg-primary/10 text-primary border-primary/30",
            "bg-emerald-brand/10 text-emerald-brand border-emerald-brand/30",
            "bg-amber-500/10 text-amber-600 border-amber-500/30",
            "bg-purple-400/10 text-purple-400 border-purple-400/30",
            "bg-cyan-400/10 text-cyan-400 border-cyan-400/30",
            "bg-rose-400/10 text-rose-400 border-rose-400/30",
            "bg-indigo-400/10 text-indigo-400 border-indigo-400/30"
         ];
         
         return { ...deck, cards: total || 0, mastered, color: colors[i % colors.length] };
      }));
      return stats;
    },
    enabled: !!user,
  });

  const decks = decksQuery.data || [];
  const activeDeckId = decks[activeDeckIdx]?.id;

  // 2. Fetch Cards for active deck
  const cardsQuery = useQuery({
    queryKey: ["flashcards", activeDeckId],
    queryFn: async () => {
      if (!activeDeckId || !user) return [];
      const { data: cards } = await supabaseBrowser.from("flashcards").select("*").eq("deck_id", activeDeckId);
      if (!cards || cards.length === 0) return [];
      
      const cardIds = cards.map(c => c.id);
      const { data: reviews } = await supabaseBrowser.from("flashcard_reviews").select("*").eq("user_id", user.id).in("card_id", cardIds);
      
      const reviewMap: Record<string, any> = {};
      for (const r of reviews || []) reviewMap[r.card_id] = r;
      
      const now = new Date().toISOString();
      return cards.map(c => {
        const rev = reviewMap[c.id];
        return {
          ...c,
          ease_factor: rev?.ease_factor || 2.5,
          interval_days: rev?.interval_days || 0,
          next_review_at: rev?.next_review_at || now,
          isDue: !rev || rev.next_review_at <= now,
          reviewed_at: rev?.reviewed_at
        }
      }).sort((a, b) => {
        if (a.isDue && !b.isDue) return -1;
        if (!a.isDue && b.isDue) return 1;
        return new Date(a.next_review_at).getTime() - new Date(b.next_review_at).getTime();
      });
    },
    enabled: !!activeDeckId && !!user,
  });

  useEffect(() => {
    if (cardsQuery.data) {
      setSessionCards(cardsQuery.data);
      setIdx(0);
      setFlipped(false);
    }
  }, [cardsQuery.data, activeDeckId]);

  const card = sessionCards[idx];
  const total = sessionCards.length;

  const handleGenerateAI = async () => {
    if (!activeDeckId || !token || !aiContext.trim()) return;
    setGenerateStatus("analyzing");
    
    let attempt = 0;
    let success = false;
    let lastError = "";

    while (attempt < 2 && !success) {
      try {
        await generateFlashcardsAI({ data: { token, deckId: activeDeckId, context: aiContext } });
        success = true;
      } catch (err: any) {
        attempt++;
        lastError = err.message || "Unknown error";
        if (attempt === 1) {
          console.warn("Flashcard generation failed, retrying...", lastError);
          toast("Generation failed, retrying...", { duration: 2000 });
        }
      }
    }

    if (success) {
      toast.success("Flashcards generated successfully!");
      setAiModalOpen(false);
      setAiContext("");
      queryClient.invalidateQueries({ queryKey: ["flashcards", activeDeckId] });
      queryClient.invalidateQueries({ queryKey: ["flashcard_decks"] });
    } else {
      console.error("AI Generation Error:", lastError);
      toast.error(lastError);
      // We don't close the modal or erase context, allowing the user to try again
    }
    
    setGenerateStatus("idle");
  };

  const rate = async (rating: "easy" | "good" | "hard") => {
    if (!card || !user) return;
    
    // Calculate new SM-2 interval
    const { newEase, newInterval, nextReview } = sm2(rating, card.ease_factor, card.interval_days);
    
    // Optimistic update of session cards so it isn't "due" anymore
    setSessionCards(prev => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        ease_factor: newEase,
        interval_days: newInterval,
        next_review_at: nextReview.toISOString(),
        isDue: false,
      };
      return next;
    });
  
    // Advance queue
    setTimeout(() => {
      setIdx(prev => Math.min(prev + 1, total - 1));
      setFlipped(false);
    }, 300);
  
    // Background DB sync
    await supabaseBrowser.from("flashcard_reviews").upsert({
      card_id: card.id,
      user_id: user.id,
      rating,
      ease_factor: newEase,
      interval_days: newInterval,
      next_review_at: nextReview.toISOString(),
      reviewed_at: new Date().toISOString()
    }, { onConflict: "card_id,user_id" });
    
    queryClient.invalidateQueries({ queryKey: ["flashcard_decks"] });
  };

  const prev = () => { setIdx(Math.max(0, idx - 1)); setFlipped(false); };
  const next = () => { setIdx(Math.min(total - 1, idx + 1)); setFlipped(false); };
  
  const shuffle = () => {
    setSessionCards([...sessionCards].sort(() => Math.random() - 0.5));
    setIdx(0);
    setFlipped(false);
  };

  if (decksQuery.isLoading) return <div className="p-8"><Skeleton className="h-48 w-full rounded-2xl" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Flashcards" description="Spaced repetition for long-term retention.">
        <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-xl gap-2 bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20">
              <BrainCircuit className="h-4 w-4" /> AI Generate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate Flashcards with AI</DialogTitle>
              <DialogDescription>
                Paste your notes, PDF text, or YouTube summaries below. Adaptivly AI will extract key concepts and automatically add spaced repetition flashcards to your deck.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea 
                placeholder="Paste your context here..." 
                className="h-48 resize-none"
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAiModalOpen(false)}>Cancel</Button>
              <Button onClick={handleGenerateAI} disabled={generateStatus !== "idle" || aiContext.length < 10} className="bg-gradient-primary">
                {generateStatus !== "idle" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {generateStatus === "analyzing" ? "Analyzing..." : "Generating..."}</> : "Generate Cards"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Session stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: BookOpen, label: "Total cards", value: decks.reduce((acc, d) => acc + d.cards, 0), color: "text-primary", bg: "bg-primary/10" },
          { icon: Target, label: "Mastered", value: decks.reduce((acc, d) => acc + d.mastered, 0), color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
          { icon: Zap, label: "Due today", value: sessionCards.filter(c => c.isDue).length, color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: Flame, label: "Streak", value: "Active", color: "text-orange-400", bg: "bg-orange-400/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/40 bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
              </div>
            </div>
            <div className="text-2xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Deck selector */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {decks.map((d, i) => (
          <button
            key={d.name}
            onClick={() => setActiveDeckIdx(i)}
            className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft ${
              activeDeckIdx === i ? `${d.color} shadow-soft border-current/30` : "border-border/40 bg-card"
            }`}
          >
            <div className="text-sm font-bold">{d.name}</div>
            <div className="mt-2 text-xs text-muted-foreground">{d.cards} cards · {d.mastered} mastered</div>
            <Progress value={d.cards > 0 ? (d.mastered / d.cards) * 100 : 0} className="mt-3 h-1.5" />
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <Badge variant="outline">Card {total > 0 ? idx + 1 : 0} of {total}</Badge>
        <div className="flex-1">
          <Progress value={total > 0 ? ((idx + 1) / total) * 100 : 0} className="h-2" />
        </div>
        <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-xs" onClick={shuffle}>
          <Shuffle className="h-3.5 w-3.5" /> Shuffle
        </Button>
      </div>

      {/* Card */}
      <div className="h-72" style={{ perspective: "1200px" }}>
        {cardsQuery.isLoading ? (
          <Skeleton className="h-full w-full rounded-2xl" />
        ) : !card ? (
          <Card className="h-full w-full flex flex-col items-center justify-center border-border/40 bg-card p-8 text-center shadow-elegant">
             <div className="mb-4 rounded-full bg-muted p-4">
               <BookOpen className="h-8 w-8 text-muted-foreground" />
             </div>
             <h3 className="text-lg font-bold">This deck is empty</h3>
             <p className="text-sm text-muted-foreground mt-2 max-w-sm">Use the AI Generate button above to automatically create flashcards from your notes.</p>
          </Card>
        ) : (
          <button
            onClick={() => setFlipped(!flipped)}
            className="relative h-full w-full transition-all duration-500"
            style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "" }}
          >
            {/* Front */}
            <Card
              className="absolute inset-0 flex flex-col items-center justify-center border-border/40 bg-card p-8 text-center shadow-elegant"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-center gap-2 mb-6">
                {card.isDue ? (
                  <Badge variant="default" className="text-xs bg-amber-500 text-black">Due for review</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">Not due</Badge>
                )}
              </div>
              <p className="text-xl font-bold leading-relaxed max-w-lg">{card.question}</p>
              <div className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
                <RotateCw className="h-3.5 w-3.5" /> Click to reveal answer
              </div>
            </Card>

            {/* Back */}
            <Card
              className="absolute inset-0 flex flex-col items-center justify-center border-primary/40 bg-gradient-primary p-8 text-center text-primary-foreground shadow-elegant overflow-auto"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <Badge className="mb-6 border-white/20 bg-white/15 text-primary-foreground shrink-0 mt-4">Answer</Badge>
              <div className="max-w-lg pb-4">
                {card.answer.split("\n").map((line: string, i: number) => (
                  <p key={i} className={`text-lg leading-relaxed ${i > 0 ? "mt-2" : ""}`}>{line}</p>
                ))}
              </div>
            </Card>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prev} className="rounded-xl gap-1.5" disabled={idx === 0 || !card}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        <div className="flex gap-2">
          {/* Rating buttons removed as requested */}
        </div>

        <Button onClick={next} className="bg-gradient-primary shadow-elegant rounded-xl gap-1.5" disabled={idx >= total - 1 || !card}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
