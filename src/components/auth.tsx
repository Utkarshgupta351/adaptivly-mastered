import { Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState, useRef } from "react";
import { Github, Chrome, Eye, EyeOff, ArrowLeft, Mail, Lock, User, CheckCircle2, Sparkles, Brain, Zap, Trophy, Target, Loader2 } from "lucide-react";
import { Logo } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";
import { supabaseBrowser } from "@/hooks/use-auth";
import { toast } from "sonner";

/* ─── Animated Background ─────────────────────────────────────────────── */
function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Gradient orbs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl opacity-30 animate-float"
        style={{ background: "oklch(0.52 0.22 268 / 0.6)" }} />
      <div className="absolute top-1/2 -right-20 h-80 w-80 rounded-full blur-3xl opacity-20 animate-float"
        style={{ background: "oklch(0.72 0.16 165 / 0.6)", animationDelay: "3s" }} />
      <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full blur-3xl opacity-15 animate-float"
        style={{ background: "oklch(0.62 0.2 320 / 0.6)", animationDelay: "6s" }} />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(oklch(0.52 0.22 268) 1px, transparent 1px), linear-gradient(90deg, oklch(0.52 0.22 268) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
    </div>
  );
}

/* ─── Left Panel ───────────────────────────────────────────────────────── */
function AuthLeftPanel() {
  const highlights = [
    { icon: Brain, label: "AI-Powered Tutoring", desc: "Learn from an AI that adapts to you" },
    { icon: Target, label: "Adaptive Learning Paths", desc: "Customized roadmaps for your goals" },
    { icon: Zap, label: "Live Mock Interviews", desc: "Practice with real interview scenarios" },
    { icon: Trophy, label: "Track Your Progress", desc: "XP, streaks, and detailed analytics" },
  ];

  const avatars = [
    { initials: "PS", title: "SWE @ Google" },
    { initials: "MC", title: "SDE @ Amazon" },
    { initials: "AP", title: "FE @ Meta" },
    { initials: "JK", title: "ML @ Apple" },
    { initials: "LR", title: "SWE @ Stripe" },
  ];

  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-gradient-primary">
      {/* Mesh overlay */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle at 20% 50%, oklch(1 0 0 / 0.05) 0%, transparent 50%)",
      }} />

      {/* Floating shapes */}
      <div className="absolute top-20 right-10 h-32 w-32 rounded-2xl border border-white/10 rotate-12 backdrop-blur-sm bg-white/5" />
      <div className="absolute bottom-32 left-8 h-20 w-20 rounded-xl border border-white/10 -rotate-6 backdrop-blur-sm bg-white/5" />
      <div className="absolute top-1/2 right-24 h-16 w-16 rounded-full border border-white/10 backdrop-blur-sm bg-white/5" />

      <div className="relative p-12">
        <Link to="/">
          <Logo className="text-primary-foreground [&_span]:text-white [&_span]:bg-clip-text [&_span]:bg-none" />
        </Link>
      </div>

      <div className="relative flex-1 flex flex-col justify-center px-12 py-8">
        <h2 className="text-4xl font-black leading-tight text-white mb-4">
          Adaptive prep that<br />
          <span className="opacity-80">meets you where you are.</span>
        </h2>
        <p className="text-white/70 mb-10 text-base leading-relaxed max-w-sm">
          Join 50,000+ engineers using Adaptivly to crack technical interviews at top tech companies.
        </p>

        <div className="space-y-4">
          {highlights.map((h) => (
            <div key={h.label} className="flex items-center gap-4 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm group-hover:bg-white/25 transition-colors">
                <h.icon className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{h.label}</div>
                <div className="text-xs text-white/60">{h.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative p-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex -space-x-2">
            {avatars.map((a, idx) => (
              <div
                key={a.initials}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-white text-xs font-bold text-primary shadow-soft"
                style={{ zIndex: avatars.length - idx }}
                title={a.title}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <div className="text-sm text-white/80">
            <span className="font-bold text-white">50,000+</span> engineers enrolled
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          ))}
          <span className="text-xs text-white/70 ml-1">4.9/5 from 2,400+ reviews</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Auth Shell ───────────────────────────────────────────────────────── */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { theme, toggle } = useTheme();

  return (
    <div className="relative grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <AuthLeftPanel />

      {/* Right panel */}
      <div className="relative flex flex-col bg-background">
        <AuthBackground />

        {/* Header bar */}
        <div className="relative flex items-center justify-between px-6 py-5">
          <Link to="/" className="lg:hidden">
            <Logo />
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-xl"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Form area */}
        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          {footer && (
            <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Social Buttons ───────────────────────────────────────────────────── */
export function SocialButtons() {
  return (
    <div className="grid gap-3">
      <Button
        id="social-google"
        variant="outline"
        className="h-12 w-full gap-3 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold"
      >
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>
      <Button
        id="social-github"
        variant="outline"
        className="h-12 w-full gap-3 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold"
      >
        <Github className="h-4.5 w-4.5" />
        Continue with GitHub
      </Button>
    </div>
  );
}

/* ─── Divider ──────────────────────────────────────────────────────────── */
export function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border/60" />
      <span className="font-medium">or continue with email</span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

/* ─── Password Input ───────────────────────────────────────────────────── */
function PasswordInput({ id, placeholder, label }: { id: string; placeholder: string; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="h-12 pl-10 pr-10 rounded-xl border-border/60 focus:border-primary/50 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

/* ─── Login Form ───────────────────────────────────────────────────────── */
export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <AuthShell
      title="Welcome back 👋"
      subtitle="Sign in to continue your prep journey."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Sign up free
          </Link>
        </>
      }
    >
      <div className="grid gap-3">
        <Button
          id="social-google"
          variant="outline"
          type="button"
          onClick={handleGoogleAuth}
          className="h-12 w-full gap-3 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>
      </div>
      <Divider />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 pl-10 rounded-xl border-border/60 focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-password"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 pl-10 pr-10 rounded-xl border-border/60 focus:border-primary/50 transition-colors"
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full bg-gradient-primary shadow-elegant rounded-xl font-bold text-base hover:scale-[1.02] transition-transform"
          id="login-submit"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign in →"}
        </Button>
      </form>
    </AuthShell>
  );
}

/* ─── Password Strength ─────────────────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-destructive", "bg-orange-400", "bg-amber-400", "bg-emerald-brand", "bg-emerald-brand"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : "bg-muted"}`}
          />
        ))}
      </div>
      {score > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {checks.map((c) => (
            <span key={c.label} className={`flex items-center gap-1 text-xs ${c.pass ? "text-emerald-brand" : "text-muted-foreground"}`}>
              <CheckCircle2 className="h-3 w-3" /> {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function SignupForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowser.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      // If email confirmation required, go to verify-email page
      if (!data.session) {
        await navigate({ to: "/verify-email" });
      } else {
        await navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <AuthShell
      title="Create your account ✨"
      subtitle="Start your adaptive prep in under 60 seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="grid gap-3">
        <Button id="social-google" variant="outline" type="button" onClick={handleGoogleAuth}
          className="h-12 w-full gap-3 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all font-semibold">
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>
      </div>
      <Divider />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="signup-name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="signup-name" placeholder="Jane Doe"
              value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="h-12 pl-10 rounded-xl border-border/60 focus:border-primary/50 transition-colors" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="signup-email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              className="h-12 pl-10 rounded-xl border-border/60 focus:border-primary/50 transition-colors" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input id="signup-password" type="password" placeholder="At least 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)} required
              className="h-12 pl-10 rounded-xl border-border/60 focus:border-primary/50 transition-colors" />
          </div>
          <PasswordStrength password={password} />
        </div>
        <Button type="submit" disabled={loading}
          className="mt-2 h-12 w-full bg-gradient-primary shadow-elegant rounded-xl font-bold text-base hover:scale-[1.02] transition-transform"
          id="signup-submit">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : "Create free account →"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          By creating an account you agree to our{" "}
          <a href="#" className="underline hover:text-foreground">Terms</a> and{" "}
          <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
        </p>
      </form>
    </AuthShell>
  );
}


/* ─── Forgot Password ──────────────────────────────────────────────────── */
export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  return (
    <AuthShell
      title="Reset your password 🔑"
      subtitle="Enter your email and we'll send you a secure reset link."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-emerald-brand/30 bg-emerald-brand/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-brand/10">
            <Mail className="h-8 w-8 text-emerald-brand" />
          </div>
          <h3 className="text-lg font-bold mb-2">Check your inbox</h3>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a password reset link to your email address. It expires in 15 minutes.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => setSent(false)}
          >
            Resend email
          </Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="reset-email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                className="h-12 pl-10 rounded-xl border-border/60 focus:border-primary/50 transition-colors"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            id="reset-submit"
            className="h-12 w-full bg-gradient-primary shadow-elegant rounded-xl font-bold hover:scale-[1.02] transition-transform"
          >
            Send reset link →
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

/* ─── Verify Email ─────────────────────────────────────────────────────── */
export function VerifyEmail() {
  return (
    <AuthShell
      title="Check your inbox 📬"
      subtitle="We sent a confirmation link to your email address."
      footer={
        <>
          Already confirmed?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-6 text-center">
        {/* Email icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
          <Mail className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Click the <span className="font-semibold text-foreground">confirmation link</span> in
            your email to activate your account. Check your spam folder if you don't see it.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What happens next</p>
          <div className="space-y-1.5">
            {[
              "Open the email from Supabase / Adaptivly",
              "Click the confirmation link",
              "You'll be redirected back to sign in",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </div>
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <Button asChild variant="outline" className="h-12 w-full rounded-xl font-semibold">
          <Link to="/login">Back to sign in →</Link>
        </Button>
      </div>
    </AuthShell>
  );
}


