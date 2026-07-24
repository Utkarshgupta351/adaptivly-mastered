import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, GitBranch, BookOpen, Calendar, Code2, MessagesSquare, Bot,
  StickyNote, Youtube, LineChart, Trophy, User, Settings, ChevronLeft, ChevronRight,
  Search, Bell, Moon, Sun, Menu, Sparkles, Layers, Zap, X,
} from "lucide-react";
import { Logo } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-primary" },
  { to: "/learning-paths", label: "Learning Paths", icon: GitBranch, color: "text-indigo-400" },
  { to: "/subjects", label: "Subjects", icon: BookOpen, color: "text-blue-400" },
  { to: "/planner", label: "Planner", icon: Calendar, color: "text-cyan-400" },
  { to: "/practice", label: "Practice", icon: Code2, color: "text-emerald-brand" },
  { to: "/mock-interviews", label: "Mock Interviews", icon: MessagesSquare, color: "text-amber-400" },
  { to: "/ai-tutor", label: "AI Tutor", icon: Bot, color: "text-purple-400" },
  { to: "/notes", label: "Notes", icon: StickyNote, color: "text-yellow-400" },
  { to: "/flashcards", label: "Flashcards", icon: Layers, color: "text-pink-400" },
  { to: "/youtube-summarizer", label: "YouTube Summarizer", icon: Youtube, color: "text-red-400" },
  { to: "/analytics", label: "Analytics", icon: LineChart, color: "text-teal-400" },
  { to: "/achievements", label: "Achievements", icon: Trophy, color: "text-orange-400" },
] as const;

const bottomNav = [
  { to: "/profile", label: "Profile", icon: User, color: "text-muted-foreground" },
  { to: "/settings", label: "Settings", icon: Settings, color: "text-muted-foreground" },
] as const;

function SidebarInner({ collapsed, onNav }: { collapsed: boolean; onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const Item = ({
    to,
    label,
    icon: Icon,
    color,
  }: {
    to: string;
    label: string;
    icon: typeof LayoutDashboard;
    color: string;
  }) => {
    const active = path === to || path.startsWith(to + "/");
    return (
      <Link
        to={to}
        onClick={onNav}
        title={collapsed ? label : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary/10 text-foreground shadow-soft"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
        )}
      >
        {/* Active indicator */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-primary shadow-glow" />
        )}
        <Icon
          className={cn(
            "h-4.5 w-4.5 shrink-0 transition-colors",
            active ? color : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        {!collapsed && (
          <span className="truncate">{label}</span>
        )}
        {/* Tooltip on collapsed */}
        {collapsed && (
          <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium shadow-elegant group-hover:flex whitespace-nowrap">
            {label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo area */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border/60 px-4 shrink-0",
          collapsed && "justify-center px-2"
        )}
      >
        {collapsed ? (
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
        ) : (
          <Logo />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 scrollbar-thin">
        {!collapsed && (
          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Main Menu
          </div>
        )}
        {nav.map((n) => (
          <Item key={n.to} {...n} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="shrink-0 space-y-0.5 border-t border-sidebar-border/60 p-3">
        {!collapsed && (
          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Account
          </div>
        )}
        {bottomNav.map((n) => (
          <Item key={n.to} {...n} />
        ))}
      </div>

      {/* Upgrade CTA */}
      {!collapsed && (
        <div className="m-3 rounded-2xl overflow-hidden border border-primary/20 bg-gradient-primary p-4 shadow-elegant">
          <div className="flex items-center gap-2 text-xs font-bold text-primary-foreground">
            <Zap className="h-3.5 w-3.5" /> Upgrade to Pro
          </div>
          <p className="mt-1 text-[11px] text-primary-foreground/70 leading-relaxed">
            Unlock unlimited mock interviews &amp; advanced AI tutor.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 h-7 w-full text-xs font-bold rounded-lg"
          >
            Upgrade now →
          </Button>
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Derive page title from current path
  const pageTitle = [...nav, ...bottomNav].find(
    (n) => path === n.to || path.startsWith(n.to + "/")
  )?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 transition-all duration-300 lg:block",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarInner collapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          id="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-20 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card shadow-soft hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 shadow-elegant">
            <SidebarInner collapsed={false} onNav={() => setMobileOpen(false)} />
          </aside>
          <button
            className="absolute top-4 left-[268px] z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-md md:px-6">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl"
            onClick={() => setMobileOpen(true)}
            id="mobile-menu-toggle"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page breadcrumb */}
          <div className="hidden items-center gap-2 text-sm md:flex">
            <span className="text-muted-foreground">Adaptivly</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-semibold">{pageTitle}</span>
          </div>

          {/* Search */}
          <div className="relative hidden max-w-sm flex-1 md:block ml-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="global-search"
              placeholder="Search topics, problems, notes..."
              className="h-9 pl-9 rounded-xl border-border/50 bg-muted/30 focus:bg-background"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Streak badge */}
            <Badge
              variant="outline"
              className="hidden gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 sm:flex font-semibold"
            >
              🔥 42
            </Badge>

            {/* XP badge */}
            <Badge
              variant="outline"
              className="hidden gap-1.5 border-primary/30 bg-primary/10 text-primary sm:flex font-semibold"
            >
              <Sparkles className="h-3 w-3" /> 12.4K XP
            </Badge>

            <Button variant="ghost" size="icon" onClick={toggle} className="rounded-xl" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            </Button>

            {/* Avatar */}
            <button
              id="user-avatar"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow hover:scale-105 transition-transform"
              aria-label="User menu"
            >
              JD
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap gap-2">{children}</div>
      )}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  color = "text-primary",
  bg = "bg-primary/10",
  trend = "up",
}: {
  icon: any;
  label: string;
  value: string;
  delta?: string;
  color?: string;
  bg?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="group rounded-2xl border border-border/40 bg-card p-5 shadow-soft transition-all hover:shadow-elegant hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className={cn("grid h-9 w-9 place-items-center rounded-xl", bg)}>
          <Icon className={cn("h-4.5 w-4.5", color)} />
        </div>
      </div>
      <div className="mt-3 text-3xl font-black tracking-tight">{value}</div>
      {delta && (
        <div
          className={cn(
            "mt-1.5 flex items-center gap-1 text-xs font-medium",
            trend === "up" ? "text-emerald-brand" : trend === "down" ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {delta}
        </div>
      )}
    </div>
  );
}
