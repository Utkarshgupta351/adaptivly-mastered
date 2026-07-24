import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Github, Linkedin, MapPin, Briefcase, Target } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({ component: Profile });

function Profile() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your public profile and career goals." />

      <Card className="relative overflow-hidden border-border/50 p-0 shadow-soft">
        <div className="h-32 bg-gradient-primary" />
        <div className="p-6">
          <div className="-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-background bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-elegant">JD</div>
              <button className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-card shadow-soft"><Camera className="h-3.5 w-3.5" /></button>
            </div>
            <Button variant="outline">Edit profile</Button>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold">Jane Doe</h2>
            <p className="text-sm text-muted-foreground">Software Engineer · Preparing for FAANG</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> San Francisco, CA</span>
              <span className="flex items-center gap-1"><Github className="h-3.5 w-3.5" /> @janedoe</span>
              <span className="flex items-center gap-1"><Linkedin className="h-3.5 w-3.5" /> jane-doe</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/50 p-6 shadow-soft">
          <h3 className="font-semibold">About</h3>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Full name</Label><Input defaultValue="Jane Doe" className="mt-1.5" /></div>
              <div><Label>Email</Label><Input defaultValue="jane@example.com" className="mt-1.5" /></div>
              <div><Label>Target role</Label><Input defaultValue="Software Engineer" className="mt-1.5" /></div>
              <div><Label>Target company</Label><Input defaultValue="Google, Meta" className="mt-1.5" /></div>
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea defaultValue="CS grad preparing for FAANG. Interested in distributed systems and ML infra." className="mt-1.5 h-24" />
            </div>
            <div>
              <Label>Skills</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Python", "Java", "System Design", "React", "Kubernetes", "SQL", "AWS", "Distributed Systems"].map((s) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
            </div>
            <Button className="bg-gradient-primary">Save changes</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/50 p-6 shadow-soft">
            <div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><h3 className="font-semibold">Goals</h3></div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3"><span className="text-sm">Target date</span><span className="text-sm font-semibold">Jun 2026</span></div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3"><span className="text-sm">Study hours / week</span><span className="text-sm font-semibold">20h</span></div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3"><span className="text-sm">Difficulty focus</span><span className="text-sm font-semibold">Medium+</span></div>
            </div>
          </Card>

          <Card className="border-border/50 p-6 shadow-soft">
            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /><h3 className="font-semibold">Lifetime stats</h3></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[{ l: "Problems", v: "348" }, { l: "XP", v: "12.4k" }, { l: "Streak", v: "42d" }, { l: "Mocks", v: "18" }].map((s) => (
                <div key={s.l} className="rounded-lg border border-border/50 p-3">
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                  <div className="mt-0.5 text-lg font-bold">{s.v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
