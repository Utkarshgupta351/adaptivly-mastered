import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { Youtube, Sparkles, Copy, Save, Download, Play, Clock, BookOpen, Tag, History, Star } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/youtube-summarizer")({ component: YT });

const history = [
  { title: "MIT 6.006 — Dynamic Programming", url: "youtube.com/watch?v=...", duration: "1:12:03", when: "2h ago", tags: ["DP", "Algorithms"] },
  { title: "System Design: Design Twitter", url: "youtube.com/watch?v=...", duration: "45:22", when: "Yesterday", tags: ["System Design"] },
  { title: "OS Scheduling Algorithms", url: "youtube.com/watch?v=...", duration: "38:14", when: "3d ago", tags: ["OS"] },
];

const keyPoints = [
  "DP is optimization + recursion + memoization",
  "Always identify the state and transition function first",
  "Space can often be reduced from O(n²) to O(n)",
  "Memoization = top-down; Tabulation = bottom-up",
  "Classic patterns: Knapsack, LIS, LCS, Matrix Chain",
];

const concepts = ["Memoization", "Tabulation", "0/1 Knapsack", "Optimal Substructure", "Overlapping Subproblems", "State Transition", "Bottom-up DP", "Top-down DP"];

function YT() {
  const [url, setUrl] = useState("https://youtube.com/watch?v=abc123");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(true);

  const generate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="YouTube Summarizer"
        description="Turn any lecture into interview-ready notes in seconds."
      />

      {/* URL input */}
      <Card className="relative overflow-hidden border-0 p-0 shadow-elegant">
        <div className="absolute inset-0 bg-gradient-primary" />
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="relative p-8">
          <div className="flex items-center gap-2 mb-4">
            <Youtube className="h-5 w-5 text-primary-foreground" />
            <span className="font-bold text-primary-foreground">Paste a YouTube URL</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Youtube className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-red-500" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 pl-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:bg-white/20"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <Button
              onClick={generate}
              disabled={loading}
              className="h-12 bg-white text-primary font-bold px-8 rounded-xl hover:bg-white/90 shadow-elegant gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Summary
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-primary-foreground/70">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ~15 seconds</span>
            <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Auto-generates notes</span>
            <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Extracts key concepts</span>
          </div>
        </div>
      </Card>

      {generated && (
        <div className="space-y-6">
          {/* Video info */}
          <Card className="border-border/40 p-5 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="h-20 w-32 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                  <Play className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 rounded-lg bg-card border border-border px-1.5 py-0.5 text-[10px] font-bold">
                  1:12:03
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base leading-tight">MIT 6.006 — Dynamic Programming Lecture</h3>
                <p className="text-xs text-muted-foreground mt-1">MIT OpenCourseWare · 2.1M views</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["DP", "Algorithms", "MIT", "Memoization"].map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Summary tabs */}
          <Tabs defaultValue="summary">
            <TabsList className="rounded-xl">
              <TabsTrigger value="summary" className="rounded-lg">Summary</TabsTrigger>
              <TabsTrigger value="concepts" className="rounded-lg">Key Concepts</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-lg">Interview Notes</TabsTrigger>
              <TabsTrigger value="raw" className="rounded-lg">Raw Transcript</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <Card className="border-border/40 p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">AI Summary</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                    <Button size="sm" className="bg-gradient-primary rounded-xl gap-1.5 text-xs">
                      <Save className="h-3.5 w-3.5" /> Save to Notes
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    This lecture covers <strong className="text-foreground">dynamic programming fundamentals</strong> from first principles.
                    The instructor begins with the intuition behind overlapping subproblems and optimal substructure,
                    then builds up to memoization and tabulation as two equivalent implementation strategies.
                  </p>
                  <p>
                    Key examples covered: Fibonacci sequence (naive vs memoized), 0/1 Knapsack, Longest Common Subsequence (LCS),
                    and Longest Increasing Subsequence (LIS). Each is analyzed for time and space complexity.
                  </p>
                  <p>
                    The lecture concludes with tips for recognizing DP patterns in interview problems: look for
                    "optimal" or "minimum/maximum" in the problem statement, and check if the brute force has exponential time.
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="concepts" className="mt-4">
              <Card className="border-border/40 p-6 shadow-soft">
                <h3 className="font-bold mb-4">Key Concepts Extracted</h3>
                <div className="flex flex-wrap gap-2">
                  {concepts.map((c) => (
                    <Badge key={c} className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 cursor-pointer transition-colors">
                      {c}
                    </Badge>
                  ))}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {["Memoization vs Tabulation", "Optimal Substructure", "Overlapping Subproblems", "State Design"].map((topic) => (
                    <div key={topic} className="rounded-xl border border-border/40 p-4">
                      <div className="font-semibold text-sm mb-1">{topic}</div>
                      <p className="text-xs text-muted-foreground">Click to learn more about this concept →</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card className="border-border/40 p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Interview-ready notes</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                    <Button size="sm" className="bg-gradient-primary rounded-xl gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" /> Export PDF
                    </Button>
                  </div>
                </div>
                <ul className="space-y-3">
                  {keyPoints.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-primary" />
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl border border-border/40 bg-muted/20 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                  <p className="text-foreground font-bold mb-2"># Dynamic Programming Cheatsheet</p>
                  <p>- Identify: state, choice, transition</p>
                  <p>- Memoize: use dict/array to cache</p>
                  <p>- Tabulate: fill table bottom-up</p>
                  <p className="mt-2 text-foreground font-bold">Practice problems:</p>
                  <p>- LC 322 Coin Change, LC 300 LIS, LC 1143 LCS</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="raw" className="mt-4">
              <Card className="border-border/40 p-6 shadow-soft">
                <h3 className="font-bold mb-4">Raw Transcript</h3>
                <div className="rounded-xl border border-border/40 bg-muted/20 p-4 font-mono text-xs leading-loose text-muted-foreground max-h-80 overflow-y-auto">
                  [00:00] Welcome to 6.006 Introduction to Algorithms.<br />
                  [00:12] Today we're covering Dynamic Programming, one of the most powerful paradigms in algorithms.<br />
                  [01:45] The key insight is that DP solves problems by combining solutions to subproblems...<br />
                  [03:20] Let's start with the classic Fibonacci example to build intuition...<br />
                  [08:00] The naive recursive approach has O(2^n) time complexity. Terrible for large inputs.<br />
                  [12:30] Now let's introduce memoization — storing previously computed results...<br />
                  [18:00] This brings us down to O(n) time with O(n) space. Much better!<br />
                  <span className="text-primary cursor-pointer">... load more transcript</span>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* History */}
      <Card className="border-border/40 p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-primary" />
          <h3 className="font-bold">Recent summaries</h3>
        </div>
        <div className="space-y-2">
          {history.map((h) => (
            <div
              key={h.title}
              className="flex items-center gap-4 rounded-xl border border-border/40 p-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <Youtube className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{h.title}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{h.duration}</span>
                  {h.tags.map((t) => (
                    <Badge key={t} variant="outline" className="h-4 text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">{h.when}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
