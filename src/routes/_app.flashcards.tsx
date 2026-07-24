import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Shuffle, RotateCw, Plus, BookOpen, Target, Zap, Flame } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/flashcards")({ component: Flashcards });

const decks = [
  { name: "DSA Fundamentals", cards: 48, mastered: 32, color: "bg-primary/10 text-primary border-primary/30" },
  { name: "System Design", cards: 24, mastered: 10, color: "bg-emerald-brand/10 text-emerald-brand border-emerald-brand/30" },
  { name: "OS & DBMS", cards: 36, mastered: 22, color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  { name: "Behavioral (STAR)", cards: 20, mastered: 18, color: "bg-purple-400/10 text-purple-400 border-purple-400/30" },
];

const cards = [
  {
    q: "What is the time complexity of accessing an element in a hashmap?",
    a: "O(1) average case, O(n) worst case when many collisions occur. Most implementations use open addressing or chaining to minimize collisions.",
    tag: "DSA",
    difficulty: "Easy",
  },
  {
    q: "Explain ACID properties in databases",
    a: "Atomicity — all or nothing transactions\nConsistency — data stays valid\nIsolation — transactions don't interfere\nDurability — committed data persists",
    tag: "DBMS",
    difficulty: "Medium",
  },
  {
    q: "What's the difference between a process and a thread?",
    a: "Processes have isolated memory spaces and are independently scheduled. Threads share memory within the same process, making them lighter and faster to create, but more prone to race conditions.",
    tag: "OS",
    difficulty: "Easy",
  },
  {
    q: "What is consistent hashing and when is it used?",
    a: "Consistent hashing maps both data and servers onto a circular ring. When a server is added/removed, only the adjacent keys migrate — minimizing rebalancing. Used in distributed caches like Memcached and DynamoDB.",
    tag: "System Design",
    difficulty: "Hard",
  },
];

const diffColors: Record<string, string> = {
  Easy: "bg-emerald-brand/10 text-emerald-brand border-emerald-brand/30",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Hard: "bg-destructive/10 text-destructive border-destructive/30",
};

function Flashcards() {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<number, string>>({});
  const [activeDeck, setActiveDeck] = useState(0);

  const card = cards[idx % cards.length];
  const total = cards.length;
  const rated = Object.keys(ratings).length;

  const rate = (r: string) => {
    setRatings((prev) => ({ ...prev, [idx]: r }));
    setTimeout(() => {
      setIdx((prev) => (prev + 1) % total);
      setFlipped(false);
    }, 300);
  };

  const prev = () => { setIdx(Math.max(0, idx - 1)); setFlipped(false); };
  const next = () => { setIdx((idx + 1) % total); setFlipped(false); };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Flashcards" description="Spaced repetition for long-term retention.">
        <Button variant="outline" className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> New deck
        </Button>
      </PageHeader>

      {/* Session stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: BookOpen, label: "Total cards", value: `${total * 4}`, color: "text-primary", bg: "bg-primary/10" },
          { icon: Target, label: "Mastered", value: "82", color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
          { icon: Zap, label: "Due today", value: "12", color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: Flame, label: "Streak", value: "42d", color: "text-orange-400", bg: "bg-orange-400/10" },
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
            onClick={() => setActiveDeck(i)}
            className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft ${
              activeDeck === i ? `${d.color} shadow-soft` : "border-border/40 bg-card"
            }`}
          >
            <div className="text-sm font-bold">{d.name}</div>
            <div className="mt-2 text-xs text-muted-foreground">{d.cards} cards · {d.mastered} mastered</div>
            <Progress value={(d.mastered / d.cards) * 100} className="mt-3 h-1.5" />
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <Badge variant="outline">Card {idx + 1} of {total}</Badge>
        <div className="flex-1">
          <Progress value={((idx + 1) / total) * 100} className="h-2" />
        </div>
        <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-xs">
          <Shuffle className="h-3.5 w-3.5" /> Shuffle
        </Button>
      </div>

      {/* Card */}
      <div className="h-72" style={{ perspective: "1200px" }}>
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
              <Badge variant="outline" className={`text-xs ${diffColors[card.difficulty]}`}>{card.difficulty}</Badge>
              <Badge variant="outline" className="text-xs">{card.tag}</Badge>
            </div>
            <p className="text-xl font-bold leading-relaxed max-w-lg">{card.q}</p>
            <div className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
              <RotateCw className="h-3.5 w-3.5" /> Click to reveal answer
            </div>
          </Card>

          {/* Back */}
          <Card
            className="absolute inset-0 flex flex-col items-center justify-center border-primary/40 bg-gradient-primary p-8 text-center text-primary-foreground shadow-elegant"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <Badge className="mb-6 border-white/20 bg-white/15 text-primary-foreground">Answer</Badge>
            <div className="max-w-lg">
              {card.a.split("\n").map((line, i) => (
                <p key={i} className={`text-lg leading-relaxed ${i > 0 ? "mt-2" : ""}`}>{line}</p>
              ))}
            </div>
          </Card>
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prev} className="rounded-xl gap-1.5" disabled={idx === 0}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => rate("hard")}
          >
            Hard
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
            onClick={() => rate("good")}
          >
            Good
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-emerald-brand/40 text-emerald-brand hover:bg-emerald-brand/10"
            onClick={() => rate("easy")}
          >
            Easy
          </Button>
        </div>

        <Button onClick={next} className="bg-gradient-primary shadow-elegant rounded-xl gap-1.5">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Session summary */}
      {rated > 0 && (
        <Card className="border-border/40 p-5 shadow-soft">
          <h3 className="font-bold text-sm mb-3">Session so far</h3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-brand" />
              <span>Easy: {Object.values(ratings).filter((r) => r === "easy").length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span>Good: {Object.values(ratings).filter((r) => r === "good").length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span>Hard: {Object.values(ratings).filter((r) => r === "hard").length}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
