import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Shuffle, RotateCw, Plus, BookOpen, Target, Zap, Flame, BrainCircuit, Sparkles, Loader2 } from "lucide-react";
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

const STARTER_FLASHCARDS: Record<string, { question: string; answer: string; difficulty: "Easy" | "Medium" | "Hard" }[]> = {
  "DSA Fundamentals": [
    {
      question: "What is the time and space complexity of QuickSort in the average and worst cases?",
      answer: "Average Time: O(N log N)\nWorst Time: O(N²) (when pivot choices produce maximally unbalanced partitions)\nSpace Complexity: O(log N) auxiliary recursion call stack space.",
      difficulty: "Medium"
    },
    {
      question: "Explain Floyd's Cycle-Finding Algorithm (Tortoise and Hare) for Linked Lists.",
      answer: "Maintain two pointers: slow (advances 1 node) and fast (advances 2 nodes).\nIf a cycle exists, fast and slow will intersect within the loop.\nTime: O(N), Auxiliary Space: O(1).",
      difficulty: "Easy"
    },
    {
      question: "When should you use a Hash Map vs. a Balanced Binary Search Tree (e.g. Red-Black Tree)?",
      answer: "Hash Map: O(1) average lookup/insert, but unordered.\nBalanced BST: O(log N) lookup/insert, but maintains keys in sorted order, supporting floor/ceiling and range queries.",
      difficulty: "Medium"
    },
    {
      question: "What is the core difference between Dynamic Programming Memoization and Tabulation?",
      answer: "Top-Down (Memoization): Recursive with caching; only solves subproblems that are reachable.\nBottom-Up (Tabulation): Iterative table filling from base cases; eliminates recursive stack overhead.",
      difficulty: "Hard"
    }
  ],
  "OS & DBMS": [
    {
      question: "What are the four Coffman conditions required for a Deadlock to occur?",
      answer: "1. Mutual Exclusion: At least one unshareable resource.\n2. Hold and Wait: Process holds resource while requesting another.\n3. No Preemption: Resources cannot be forcibly revoked.\n4. Circular Wait: Circular chain of processes each waiting for next.",
      difficulty: "Medium"
    },
    {
      question: "What do the ACID properties guarantee in relational database transactions?",
      answer: "Atomicity: All operations succeed or entire transaction aborts.\nConsistency: Maintains valid database integrity constraints.\nIsolation: Concurrent transactions execute without cross-contamination.\nDurability: Committed records survive crashes via Write-Ahead Logging (WAL).",
      difficulty: "Easy"
    },
    {
      question: "What is the fundamental difference between a Process and a Thread?",
      answer: "Process: Isolated execution unit with private address space, file handles, and memory map.\nThread: Lightweight unit within a process sharing heap, code, and globals, but having private stack/registers.",
      difficulty: "Easy"
    },
    {
      question: "Why do relational database engines use B+ Trees rather than standard Binary Search Trees for indexes?",
      answer: "B+ Trees have high fan-out (hundreds of keys per node), reducing disk I/O depth to 3-4 levels.\nAll values reside in leaf nodes connected by a linked list, enabling O(log N) point lookups and linear range scans.",
      difficulty: "Hard"
    }
  ],
  "System Design": [
    {
      question: "Explain the CAP Theorem and its real-world engineering implications.",
      answer: "In a distributed system, you can choose at most two of: Consistency, Availability, and Partition Tolerance.\nBecause network latency and cable cuts make partitions inevitable, distributed systems must trade off between Consistency (CP) and Availability (AP) during a split.",
      difficulty: "Medium"
    },
    {
      question: "How does Consistent Hashing minimize cache invalidation during cluster scaling?",
      answer: "Maps both servers and cache keys to a virtual 360° ring.\nWhen a server is added or removed, only K/N keys migrate (where K is total keys, N is servers) rather than remapping all keys.",
      difficulty: "Hard"
    },
    {
      question: "Explain the difference between Vertical Scaling and Horizontal Scaling.",
      answer: "Vertical (Scale-Up): Adding faster CPU, RAM, or NVMe disks to one server; limited by hardware ceiling and creates single point of failure.\nHorizontal (Scale-Out): Adding more commodity instances behind a load balancer; provides high availability and near-infinite scale.",
      difficulty: "Easy"
    }
  ],
  "Computer Networks": [
    {
      question: "Walk through the TCP 3-Way Handshake step-by-step.",
      answer: "1. Client -> Server: SYN (synchronize initial sequence number X)\n2. Server -> Client: SYN-ACK (acknowledges X+1, sends server sequence number Y)\n3. Client -> Server: ACK (acknowledges Y+1)\nConnection is now in ESTABLISHED state.",
      difficulty: "Easy"
    },
    {
      question: "Compare TCP vs. UDP and when you would choose one over the other.",
      answer: "TCP: Reliable, ordered delivery, flow control, congestion control. Ideal for HTTP/Web, DB connections, and file transfer.\nUDP: Connectionless, zero handshake delay, no retransmissions. Ideal for real-time multiplayer gaming, DNS, and WebRTC streaming.",
      difficulty: "Easy"
    }
  ],
  "Behavioral": [
    {
      question: "How should you structure technical interview behavioral answers using the STAR method?",
      answer: "Situation: Context and business background (15%)\nTask: The specific challenge, risk, or technical obstacle assigned to you (15%)\nAction: Concrete technical decisions, trade-offs, and implementation steps YOU drove (55%)\nResult: Measurable business or engineering outcome (latency reduced, zero downtime, adoption rate) (15%)",
      difficulty: "Easy"
    }
  ]
};

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

  const [isSeeding, setIsSeeding] = useState(false);

  // 2. Fetch Cards for active deck
  const cardsQuery = useQuery({
    queryKey: ["flashcards", activeDeckId],
    queryFn: async () => {
      if (!activeDeckId || !user) return [];
      let { data: cards } = await supabaseBrowser.from("flashcards").select("*").eq("deck_id", activeDeckId);
      
      // If deck has no cards, auto-seed with curated starter flashcards
      if (!cards || cards.length === 0) {
        const activeDeck = decks[activeDeckIdx];
        const starterList = (activeDeck?.name && STARTER_FLASHCARDS[activeDeck.name])
          ? STARTER_FLASHCARDS[activeDeck.name]
          : STARTER_FLASHCARDS["DSA Fundamentals"];

        if (starterList && starterList.length > 0) {
          const insertData = starterList.map(s => ({
            deck_id: activeDeckId,
            question: s.question,
            answer: s.answer,
            difficulty: s.difficulty,
          }));
          const { data: newCards } = await supabaseBrowser.from("flashcards").insert(insertData).select("*");
          cards = newCards && newCards.length > 0
            ? newCards
            : insertData.map((c, i) => ({ ...c, id: `seed-${i}`, created_at: new Date().toISOString() }));
          queryClient.invalidateQueries({ queryKey: ["flashcard_decks"] });
        }
      }

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

  const handleSeedStarter = async () => {
    if (!activeDeckId || !user) return;
    setIsSeeding(true);
    const activeDeck = decks[activeDeckIdx];
    const starterList = (activeDeck?.name && STARTER_FLASHCARDS[activeDeck.name])
      ? STARTER_FLASHCARDS[activeDeck.name]
      : STARTER_FLASHCARDS["DSA Fundamentals"];

    if (starterList && starterList.length > 0) {
      const insertData = starterList.map(s => ({
        deck_id: activeDeckId,
        question: s.question,
        answer: s.answer,
        difficulty: s.difficulty,
      }));
      await supabaseBrowser.from("flashcards").insert(insertData);
      toast.success("Loaded curated starter flashcards!");
      queryClient.invalidateQueries({ queryKey: ["flashcards", activeDeckId] });
      queryClient.invalidateQueries({ queryKey: ["flashcard_decks"] });
    }
    setIsSeeding(false);
  };

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
             <p className="text-sm text-muted-foreground mt-2 max-w-sm">Use the AI Generate button above to create cards, or seed curated high-yield interview flashcards.</p>
             <Button onClick={handleSeedStarter} disabled={isSeeding} className="mt-4 rounded-xl gap-2 bg-gradient-primary">
               {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Load Curated Flashcards
             </Button>
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

        <div className="flex flex-wrap items-center justify-center gap-2">
          {flipped && card && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rate("hard")}
                className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-semibold px-3"
              >
                🔴 Hard (1d)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rate("good")}
                className="rounded-xl border-amber-500/40 text-amber-500 hover:bg-amber-500/10 text-xs font-semibold px-3"
              >
                🟡 Good (3d)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rate("easy")}
                className="rounded-xl border-emerald-brand/40 text-emerald-brand hover:bg-emerald-brand/10 text-xs font-semibold px-3"
              >
                🟢 Easy (6d)
              </Button>
            </>
          )}
        </div>

        <Button onClick={next} className="bg-gradient-primary shadow-elegant rounded-xl gap-1.5" disabled={idx >= total - 1 || !card}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
