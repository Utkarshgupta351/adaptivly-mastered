import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, MapPin, Briefcase, Target, Sparkles, Flame, Trophy, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, supabaseBrowser } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({ component: Profile });

function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [learningPath, setLearningPath] = useState("");

  // Real stats from DB
  const [stats, setStats] = useState({
    xp: 0,
    streak: 0,
    coins: 0,
    solvedCount: 0,
  });

  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      try {
        const [profileRes, statusRes] = await Promise.all([
          supabaseBrowser.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
          supabaseBrowser.from("user_problem_status").select("id", { count: "exact" }).eq("user_id", user!.id).eq("status", "solved"),
        ]);

        const p = profileRes.data;
        if (p) {
          setFullName(p.full_name ?? user!.email?.split("@")[0] ?? "");
          setTargetRole(p.target_role ?? "");
          setTargetCompany(p.target_company ?? "");
          setLearningPath(p.learning_path ?? "FAANG Full Prep");
          setStats({
            xp: p.xp ?? 0,
            streak: p.streak ?? 0,
            coins: p.coins ?? 0,
            solvedCount: statusRes.count ?? 0,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        });

      if (error) throw error;
      toast.success("Profile saved successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = fullName
    ? fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your public profile and career goals." />

      <Card className="relative overflow-hidden border-border/50 p-0 shadow-soft">
        <div className="h-32 bg-gradient-primary" />
        <div className="p-6">
          <div className="-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-background bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-elegant">
                {initials}
              </div>
            </div>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-bold">
              {learningPath}
            </Badge>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold">{fullName || "User"}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {targetRole ? `${targetRole}` : "Learner"} {targetCompany ? `· Targeting ${targetCompany}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>✉️ {user?.email}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/50 p-6 shadow-soft">
          <h3 className="font-semibold">About You</h3>
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="prof-name">Full name</Label>
                <Input
                  id="prof-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="prof-email">Email</Label>
                <Input
                  id="prof-email"
                  value={user?.email ?? ""}
                  disabled
                  className="mt-1.5 bg-muted/30 cursor-not-allowed"
                />
              </div>
              <div>
                <Label htmlFor="prof-role">Target role</Label>
                <Input
                  id="prof-role"
                  placeholder="e.g. Software Engineer, ML Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="prof-company">Target company</Label>
                <Input
                  id="prof-company"
                  placeholder="e.g. Google, Meta, Amazon"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label>Current Active Learning Path</Label>
              <div className="mt-2">
                <Badge className="bg-gradient-primary text-white p-2 text-sm">{learningPath}</Badge>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="bg-gradient-primary">
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/50 p-6 shadow-soft">
            <div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><h3 className="font-semibold">Active Roadmap</h3></div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <span className="text-sm">Active Path</span>
                <span className="text-sm font-semibold">{learningPath}</span>
              </div>
            </div>
          </Card>

          <Card className="border-border/50 p-6 shadow-soft">
            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /><h3 className="font-semibold">Lifetime Stats</h3></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/50 p-3">
                <div className="text-xs text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3 text-primary" /> Problems Solved</div>
                <div className="mt-1 text-lg font-bold">{stats.solvedCount}</div>
              </div>
              <div className="rounded-lg border border-border/50 p-3">
                <div className="text-xs text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> Total XP</div>
                <div className="mt-1 text-lg font-bold">{stats.xp}</div>
              </div>
              <div className="rounded-lg border border-border/50 p-3">
                <div className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3 text-amber-500" /> Current Streak</div>
                <div className="mt-1 text-lg font-bold">{stats.streak} days</div>
              </div>
              <div className="rounded-lg border border-border/50 p-3">
                <div className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="h-3 w-3 text-yellow-500" /> Coins</div>
                <div className="mt-1 text-lg font-bold">{stats.coins}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
