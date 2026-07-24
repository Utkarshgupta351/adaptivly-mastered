import { Link } from "@tanstack/react-router";
import {
  Brain,
  Sparkles,
  Target,
  Trophy,
  Zap,
  Code2,
  LineChart,
  MessageSquare,
  Youtube,
  Calendar,
  ArrowRight,
  Check,
  Star,
  Github,
  Twitter,
  Linkedin,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  Play,
  Users,
  Award,
  TrendingUp,
  Shield,
  Cpu,
  BarChart3,
  BookOpen,
  Flame,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTheme } from "@/lib/theme";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
        <Brain className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-brand animate-pulse" />
      </div>
      <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-primary">Adaptivly</span>
    </div>
  );
}

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 10}s`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            opacity: 0.3 + Math.random() * 0.4,
          }}
        />
      ))}
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border/40 glass shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative group"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-primary transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="rounded-xl">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-xl font-medium">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-primary shadow-elegant rounded-xl font-semibold gap-1.5">
            <Link to="/signup">
              Get Started <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <button
          id="nav-mobile-toggle"
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/40 px-6 py-5 md:hidden glass">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="flex-1 bg-gradient-primary rounded-xl">
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < 50000) setCount((c) => Math.min(c + 1250, 50000));
    }, 30);
    return () => clearTimeout(timer);
  }, [count]);

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Multi-layer background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.68 0.19 268 / 0.18), transparent)",
      }} />
      <ParticleField />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-10 h-64 w-64 rounded-full blur-3xl opacity-20 animate-float" style={{ background: "oklch(0.52 0.22 268)" }} aria-hidden="true" />
      <div className="absolute top-1/3 right-10 h-48 w-48 rounded-full blur-3xl opacity-15 animate-float" style={{ background: "oklch(0.72 0.16 165)", animationDelay: "2s" }} aria-hidden="true" />
      <div className="absolute bottom-1/4 left-1/3 h-80 w-80 rounded-full blur-3xl opacity-10 animate-float" style={{ background: "oklch(0.62 0.2 320)", animationDelay: "4s" }} aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 w-full">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 mb-8 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>AI-Powered · Adaptive · Personalized</span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-brand animate-pulse" />
          </div>

          <h1 className="text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl leading-none mb-6">
            <span className="block text-foreground">Master Tech</span>
            <span className="block text-gradient">Interviews</span>
            <span className="block text-foreground">with AI</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed mb-10">
            Personalized learning paths, live mock interviews, and an AI tutor that adapts to your pace.
            Land your dream role at top tech companies — faster.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-14 bg-gradient-primary px-10 shadow-elegant rounded-2xl text-base font-bold gap-2 hover:scale-105 transition-transform"
            >
              <Link to="/signup" id="hero-cta-primary">
                Start Free Today <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-10 rounded-2xl text-base font-semibold gap-2 border-border/60 hover:border-primary/40 transition-colors backdrop-blur-sm"
            >
              <a href="#features" id="hero-cta-secondary">
                <Play className="h-4 w-4" /> See Features
              </a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-brand" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-brand" /> Free forever plan
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-brand" /> Cancel anytime
            </span>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="absolute -inset-6 rounded-3xl bg-gradient-primary opacity-15 blur-3xl" />
          <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md shadow-elegant overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-5 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-brand/80" />
              <div className="ml-4 flex-1 rounded-md bg-muted/60 px-3 py-1 text-xs text-muted-foreground max-w-sm">
                app.adaptivly.dev/dashboard
              </div>
            </div>
            {/* Dashboard content */}
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                {[
                  { label: "Current Streak", value: "42 days", icon: Flame, color: "text-amber-500", bg: "bg-amber-500/10", progress: 70 },
                  { label: "XP Earned", value: "12,480", icon: Trophy, color: "text-primary", bg: "bg-primary/10", progress: 82 },
                  { label: "Problems Solved", value: "348", icon: Code2, color: "text-emerald-brand", bg: "bg-emerald-brand/10", progress: 55 },
                  { label: "Readiness Score", value: "94%", icon: Target, color: "text-purple-400", bg: "bg-purple-400/10", progress: 94 },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/40 bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                      <div className={`p-1.5 rounded-lg ${s.bg}`}>
                        <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold tracking-tight">{s.value}</div>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-gradient-primary rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="col-span-2 rounded-xl border border-border/40 bg-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold">Weekly Progress</span>
                    <Badge variant="outline" className="text-xs">This week</Badge>
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 45, 80, 70, 90, 75].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-gradient-primary opacity-80" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span key={i} className="text-xs text-muted-foreground flex-1 text-center">{d}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border/40 bg-card p-4">
                  <div className="text-sm font-semibold mb-3">Next Session</div>
                  <div className="space-y-2">
                    {["Binary Trees", "Dynamic Programming", "System Design"].map((t, i) => (
                      <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className={`h-2 w-2 rounded-full ${i === 0 ? "bg-primary" : i === 1 ? "bg-emerald-brand" : "bg-amber-500"}`} />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBanner() {
  const companies = ["Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix", "Stripe", "Airbnb"];
  return (
    <section className="py-12 border-y border-border/30 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
          Engineers hired at top companies worldwide
        </p>
        <div className="flex flex-wrap justify-center gap-8">
          {companies.map((c) => (
            <div key={c} className="text-lg font-bold text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors cursor-default select-none">
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "50K+", label: "Active Learners", icon: Users, color: "text-primary" },
    { value: "1.2M", label: "Problems Solved", icon: Code2, color: "text-emerald-brand" },
    { value: "94%", label: "Interview Success Rate", icon: TrendingUp, color: "text-amber-500" },
    { value: "150+", label: "Top Companies", icon: Award, color: "text-purple-400" },
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center group">
              <div className={`inline-flex p-3 rounded-2xl bg-card border border-border/50 mb-4 ${s.color} group-hover:scale-110 transition-transform`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div className="text-4xl font-black tracking-tight text-gradient md:text-5xl">{s.value}</div>
              <div className="mt-2 text-sm text-muted-foreground font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Brain, title: "AI Tutor", desc: "24/7 personalized guidance that adapts to your understanding level in real time.", color: "text-primary", bg: "bg-primary/10" },
    { icon: Target, title: "Adaptive Paths", desc: "Learning roadmaps that evolve based on your strengths and knowledge gaps.", color: "text-emerald-brand", bg: "bg-emerald-brand/10" },
    { icon: Code2, title: "Live Practice", desc: "Real coding environment with test cases from FAANG interviews.", color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: MessageSquare, title: "Mock Interviews", desc: "AI-driven technical, HR, and system design interviews with detailed feedback.", color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: BarChart3, title: "Deep Analytics", desc: "Track accuracy, speed, and topic mastery over time with visual dashboards.", color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: Youtube, title: "Lecture Summarizer", desc: "Turn any YouTube lecture into concise, interview-ready study notes.", color: "text-red-400", bg: "bg-red-400/10" },
    { icon: Calendar, title: "Smart Planner", desc: "Auto-scheduled study sessions with spaced repetition reminders.", color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { icon: Trophy, title: "Gamification", desc: "XP, streaks, badges, and leaderboards to keep you motivated every day.", color: "text-orange-400", bg: "bg-orange-400/10" },
  ];

  return (
    <section id="features" className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-20">
          <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 text-primary px-4 py-1.5">
            <Sparkles className="h-3 w-3 mr-1.5" /> Features
          </Badge>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">
            Everything you need to{" "}
            <span className="text-gradient">crack the interview</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            A complete adaptive platform built for serious technical interview preparation.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Card
              key={f.title}
              id={`feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative overflow-hidden border-border/40 bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-elegant hover:border-border/80"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "radial-gradient(ellipse at top left, oklch(0.68 0.19 268 / 0.05), transparent 60%)" }}
              />
              <div className={`inline-flex p-3 rounded-xl ${f.bg} mb-5`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className={`absolute bottom-0 left-0 h-0.5 w-0 ${f.bg} transition-all duration-300 group-hover:w-full`} style={{ background: `currentColor`, color: "var(--tw-" }} />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Take the diagnostic", desc: "A 15-minute assessment identifies your strengths and weak areas across all CS fundamentals.", icon: Cpu },
    { n: "02", title: "Get your custom path", desc: "Adaptivly builds an adaptive roadmap tailored to your goal company, role, and timeline.", icon: Target },
    { n: "03", title: "Practice with AI", desc: "Solve problems, chat with the AI tutor, and simulate real interviews every single day.", icon: Brain },
    { n: "04", title: "Land the offer", desc: "Track measurable improvement, ace the interview, celebrate the win.", icon: Trophy },
  ];

  return (
    <section id="how" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-20">
          <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 text-primary px-4 py-1.5">
            How it works
          </Badge>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">
            From zero to offer,{" "}
            <span className="text-gradient">step by step</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-16 left-0 right-0 h-px bg-gradient-primary opacity-20 hidden lg:block" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-soft hover:shadow-elegant transition-shadow group">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                      <s.icon className="h-5 w-5 text-primary-foreground" />
                      <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border text-[10px] font-bold text-foreground">
                        {i + 1}
                      </div>
                    </div>
                    <div className="text-5xl font-black text-gradient opacity-30">{s.n}</div>
                  </div>
                  <h3 className="font-bold text-base mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Priya Sharma", role: "SWE @ Google", quote: "Adaptivly's adaptive paths caught the exact DP patterns I was weak on. Landed my Google offer in just 3 months. Absolutely game-changing.", avatar: "PS" },
    { name: "Marcus Chen", role: "SDE-2 @ Amazon", quote: "The mock interviews were shockingly close to the real thing. The AI feedback is genuinely actionable and helped me identify blind spots I didn't even know I had.", avatar: "MC" },
    { name: "Aisha Patel", role: "Frontend Engineer @ Meta", quote: "Best interview prep money can buy. The AI tutor explains concepts better than most human tutors I've worked with. 10/10 would recommend.", avatar: "AP" },
    { name: "James Kim", role: "Staff Engineer @ Netflix", quote: "Finally, a platform that understands that everyone learns differently. The adaptive learning engine is genuinely impressive.", avatar: "JK" },
    { name: "Sofia Rodriguez", role: "ML Engineer @ Apple", quote: "Went from failing OA rounds to acing FAANG interviews in 2 months. The system design track especially is phenomenal.", avatar: "SR" },
    { name: "Liam Turner", role: "Backend SWE @ Stripe", quote: "The gamification keeps me coming back every day. 70-day streak and counting — I've never been this consistent with my prep.", avatar: "LT" },
  ];

  return (
    <section className="py-28 bg-muted/20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-20">
          <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 text-primary px-4 py-1.5">
            Testimonials
          </Badge>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">
            Loved by engineers at{" "}
            <span className="text-gradient">top companies</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Card
              key={t.name}
              className="border-border/40 p-6 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [annual, setAnnual] = useState(false);
  const tiers = [
    {
      name: "Free",
      price: annual ? "$0" : "$0",
      desc: "Perfect to get started",
      features: ["100 practice problems", "Basic AI tutor", "Community access", "Learning heatmap", "5 mock interviews/month"],
      cta: "Start free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: annual ? "$15" : "$19",
      desc: "For serious job seekers",
      features: ["Unlimited problems", "Advanced AI tutor", "Unlimited mock interviews", "Adaptive learning paths", "System design track", "Deep analytics", "Priority support"],
      cta: "Go Pro",
      highlighted: true,
      badge: "Most popular",
    },
    {
      name: "Team",
      price: annual ? "$39" : "$49",
      desc: "For bootcamps & teams",
      features: ["Everything in Pro", "Team analytics dashboard", "Custom learning paths", "Admin controls", "Bulk seat management", "Dedicated success manager"],
      cta: "Contact sales",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-gradient-hero" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 text-primary px-4 py-1.5">
            Pricing
          </Badge>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">
            Simple pricing,{" "}
            <span className="text-gradient">serious value</span>
          </h2>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            id="pricing-toggle"
            onClick={() => setAnnual(!annual)}
            className={`relative h-7 w-13 rounded-full transition-colors ${annual ? "bg-gradient-primary" : "bg-muted"}`}
            style={{ width: "52px" }}
            aria-label="Toggle annual pricing"
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual <Badge className="ml-1 bg-emerald-brand/20 text-emerald-brand border-emerald-brand/30 text-xs">Save 20%</Badge>
          </span>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <Card
              key={t.name}
              id={`pricing-${t.name.toLowerCase()}`}
              className={`relative p-8 transition-all duration-300 ${
                t.highlighted
                  ? "border-primary/50 shadow-elegant scale-105 bg-card"
                  : "border-border/40 shadow-soft hover:shadow-elegant"
              }`}
            >
              {t.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-primary px-4 py-1.5 text-xs font-bold shadow-glow">{t.badge}</Badge>
                </div>
              )}
              {t.highlighted && (
                <div className="absolute inset-0 rounded-lg bg-gradient-primary opacity-5" />
              )}
              <div className="relative">
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">{t.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-black">{t.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground mb-8">{t.desc}</p>
                <ul className="space-y-3 mb-8">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-brand" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full h-12 rounded-xl font-semibold ${
                    t.highlighted ? "bg-gradient-primary shadow-elegant hover:scale-105 transition-transform" : ""
                  }`}
                  variant={t.highlighted ? "default" : "outline"}
                >
                  <Link to="/signup">{t.cta}</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "How does the adaptive learning engine work?", a: "Adaptivly continuously analyzes your responses, pacing, and error patterns to build a personalized model of your knowledge. It then serves the next problem or concept at the ideal difficulty to maximize retention and learning speed." },
    { q: "Is there a free plan?", a: "Yes. Our free plan includes 100 practice problems, basic AI tutor access, 5 mock interviews per month, and community features — no credit card required. You can upgrade anytime." },
    { q: "Which companies does Adaptivly prepare me for?", a: "Adaptivly prepares candidates for interviews at 150+ top companies including Google, Meta, Amazon, Apple, Microsoft, Netflix, Stripe, Airbnb, and hundreds of high-growth startups." },
    { q: "Can I cancel anytime?", a: "Absolutely. Cancel with one click from your account settings. No questions asked and no cancellation fees. Your data is always yours." },
    { q: "Do you support system design interviews?", a: "Yes — Pro includes a full system design track with real interview scenarios, detailed feedback rubrics, and an interactive design canvas to sketch architectures." },
    { q: "How is Adaptivly different from LeetCode?", a: "LeetCode is a problem bank. Adaptivly is a complete adaptive learning system — it tells you what to study, coaches you through concepts, simulates real interviews, and tracks your progress holistically." },
  ];

  return (
    <section id="faq" className="py-28 bg-muted/20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 text-primary px-4 py-1.5">
            FAQ
          </Badge>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">
            Frequently asked{" "}
            <span className="text-gradient">questions</span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-border/40 rounded-xl px-6 bg-card shadow-soft data-[state=open]:shadow-elegant data-[state=open]:border-primary/30 transition-all"
            >
              <AccordionTrigger className="text-left text-base font-semibold py-5 hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-primary p-14 text-center shadow-elegant md:p-20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <ParticleField />
        <div className="relative">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5">
            <Sparkles className="h-3 w-3 mr-1.5" /> Join 50,000+ engineers
          </Badge>
          <h2 className="text-4xl font-black tracking-tight text-primary-foreground md:text-6xl leading-tight">
            Ready to level up your<br />interview game?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-primary-foreground/80 text-lg">
            Start for free today. No credit card. No commitment. Just smarter interview prep.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-14 px-10 rounded-2xl text-base font-bold gap-2 hover:scale-105 transition-transform"
            >
              <Link to="/signup" id="cta-start-free">
                Start free — no credit card <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-14 px-10 rounded-2xl text-base font-semibold text-primary-foreground hover:bg-white/10 border border-white/20"
            >
              <Link to="/login" id="cta-sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/10">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
            The adaptive AI platform that helps engineers ace technical interviews at top companies.
          </p>
          <div className="mt-6 flex gap-2">
            {[Github, Twitter, Linkedin].map((I, i) => (
              <a
                key={i}
                href="#"
                className="grid h-10 w-10 place-items-center rounded-xl border border-border/60 text-muted-foreground transition-all hover:text-foreground hover:border-primary/40 hover:bg-primary/5"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Product", links: ["Features", "Pricing", "Roadmap", "Changelog", "Status"] },
          { title: "Company", links: ["About", "Careers", "Blog", "Press", "Contact"] },
          { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies", "GDPR"] },
        ].map((c) => (
          <div key={c.title}>
            <div className="text-sm font-bold mb-4">{c.title}</div>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/40 px-6 py-6 text-center text-xs text-muted-foreground">
        © 2026 Adaptivly. All rights reserved. Built with ❤️ for engineers.
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <TrustBanner />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
