import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Code2, Server, Brain, Globe, Cpu,
  CheckCircle2, ArrowRight, Zap, Target, Flame,
} from "lucide-react";
import { supabaseBrowser, useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

/* ─── Learning Path Definitions ─────────────────────────────────────────── */
const PATHS = [
  {
    id: "FAANG Full Prep",
    label: "FAANG Full Prep",
    desc: "DSA + System Design + Behavioral — the complete package",
    weeks: 12,
    icon: Brain,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    topics: ["Arrays & Hashing", "Two Pointers", "Sliding Window", "Stacks", "Binary Search", "Linked Lists", "Trees", "Graphs", "DP", "System Design"],
  },
  {
    id: "DSA Intensive",
    label: "DSA Intensive",
    desc: "Deep dive on algorithms and data structures only",
    weeks: 6,
    icon: Code2,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/40",
    topics: ["Arrays & Hashing", "Two Pointers", "Sliding Window", "Stacks", "Binary Search", "Linked Lists", "Trees", "Graphs", "DP"],
  },
  {
    id: "System Design Pro",
    label: "System Design Pro",
    desc: "Distributed systems, databases, and scalability",
    weeks: 8,
    icon: Server,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    border: "border-indigo-400/40",
    topics: ["System Design", "Databases", "Caching", "Load Balancing", "Microservices"],
  },
  {
    id: "Full Stack Dev",
    label: "Full Stack Dev",
    desc: "Frontend + Backend + Deployment + DevOps",
    weeks: 10,
    icon: Globe,
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/40",
    topics: ["HTML/CSS", "JavaScript", "React", "Node.js", "Databases", "Deployment"],
  },
  {
    id: "AI/ML Engineer",
    label: "AI/ML Engineer",
    desc: "ML concepts + math + coding for AI roles",
    weeks: 10,
    icon: Cpu,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/40",
    topics: ["Python", "Linear Algebra", "Statistics", "ML Algorithms", "Deep Learning", "LLMs"],
  },
];

const DAILY_GOALS = [
  { value: 3, label: "Casual", desc: "3 problems / day", icon: "🌱" },
  { value: 5, label: "Focused", desc: "5 problems / day", icon: "🔥" },
  { value: 10, label: "Intense", desc: "10 problems / day", icon: "⚡" },
];

/* ─── Step indicators ────────────────────────────────────────────────────── */
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/50" : "w-2 bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Main Onboarding Component ──────────────────────────────────────────── */
function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? "");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [selectedPath, setSelectedPath] = useState("FAANG Full Prep");
  const [dailyGoal, setDailyGoal] = useState(5);

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabaseBrowser
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          target_role: targetRole,
          target_company: targetCompany,
          learning_path: selectedPath,
          daily_goal: dailyGoal,
          onboarding_done: true,
        });
      if (error) throw error;
      await navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-primary bg-clip-text text-transparent">Adaptivly</span>
          </div>
          <p className="text-sm text-muted-foreground">Let's personalize your prep journey</p>
        </div>

        <StepDots step={step} total={3} />

        <div>
          {/* ── Step 0: About You ── */}
          {step === 0 && (
            <div
              key="step0"
              className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur p-8 shadow-elegant animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black">Welcome! Tell us about yourself 👋</h2>
                <p className="text-muted-foreground mt-1">This helps us personalize your experience.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="onb-name">Full name</Label>
                  <Input id="onb-name" className="mt-1.5 h-12 rounded-xl" placeholder="Jane Doe"
                    value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="onb-role">Target role</Label>
                  <Input id="onb-role" className="mt-1.5 h-12 rounded-xl" placeholder="Software Engineer, ML Engineer..."
                    value={targetRole} onChange={e => setTargetRole(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="onb-company">Target company <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input id="onb-company" className="mt-1.5 h-12 rounded-xl" placeholder="Google, Meta, Amazon..."
                    value={targetCompany} onChange={e => setTargetCompany(e.target.value)} />
                </div>
              </div>
              <Button
                className="mt-6 h-12 w-full bg-gradient-primary rounded-xl font-bold text-base"
                onClick={() => setStep(1)}
                disabled={!fullName.trim()}
              >
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* ── Step 1: Learning Path ── */}
          {step === 1 && (
            <div
              key="step1"
              className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur p-8 shadow-elegant animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black">Choose your learning path 🗺️</h2>
                <p className="text-muted-foreground mt-1">This determines your subjects, practice problems, and planner tasks.</p>
              </div>
              <div className="grid gap-3">
                {PATHS.map((path) => {
                  const Icon = path.icon;
                  const selected = selectedPath === path.id;
                  return (
                    <button
                      key={path.id}
                      onClick={() => setSelectedPath(path.id)}
                      className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                        selected ? `${path.border} ${path.bg}` : "border-border/40 hover:border-border"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${path.bg}`}>
                        <Icon className={`h-5 w-5 ${path.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{path.label}</span>
                          <Badge variant="outline" className="text-[10px]">{path.weeks}w</Badge>
                          {selected && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{path.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="h-12 rounded-xl flex-1" onClick={() => setStep(0)}>Back</Button>
                <Button className="h-12 flex-1 bg-gradient-primary rounded-xl font-bold" onClick={() => setStep(2)}>
                  Continue <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Daily Goal ── */}
          {step === 2 && (
            <div
              key="step2"
              className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur p-8 shadow-elegant animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black">Set your daily goal 🎯</h2>
                <p className="text-muted-foreground mt-1">How many problems do you want to solve each day?</p>
              </div>
              <div className="grid gap-3">
                {DAILY_GOALS.map((g) => {
                  const selected = dailyGoal === g.value;
                  return (
                    <button
                      key={g.value}
                      onClick={() => setDailyGoal(g.value)}
                      className={`flex items-center gap-4 rounded-xl border p-5 text-left transition-all ${
                        selected ? "border-primary/50 bg-primary/5" : "border-border/40 hover:border-border"
                      }`}
                    >
                      <span className="text-3xl">{g.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{g.label}</span>
                          {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{g.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-6 rounded-xl border border-border/40 bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your plan summary</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1"><Target className="h-3 w-3" />{targetRole || "No role set"}</Badge>
                  <Badge variant="outline" className="gap-1"><Brain className="h-3 w-3" />{selectedPath}</Badge>
                  <Badge variant="outline" className="gap-1"><Flame className="h-3 w-3" />{dailyGoal} problems/day</Badge>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="h-12 rounded-xl flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="h-12 flex-1 bg-gradient-primary rounded-xl font-bold text-base"
                  onClick={finish}
                  disabled={saving}
                >
                  {saving ? "Setting up..." : "Start learning 🚀"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Export path config for learning paths (used by other pages) ──────── */
export const LEARNING_PATHS = PATHS;
