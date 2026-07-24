import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Monitor, Bell, Shield, Globe, User, Trash2 } from "lucide-react";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

function Section({ icon: Icon, title, desc, children }: any) {
  return (
    <Card className="border-border/50 p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
        <div className="flex-1"><h3 className="font-semibold">{title}</h3><p className="text-xs text-muted-foreground">{desc}</p></div>
      </div>
      <Separator className="my-5" />
      <div className="space-y-5">{children}</div>
    </Card>
  );
}

function Row({ label, desc, children }: any) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1"><Label className="text-sm">{label}</Label>{desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}</div>
      <div>{children}</div>
    </div>
  );
}

function Settings() {
  const { theme, toggle } = useTheme();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences." />

      <Section icon={theme === "dark" ? Moon : Sun} title="Appearance" desc="Customize how ALE looks on your device.">
        <Row label="Theme" desc="Switch between light and dark modes.">
          <div className="flex rounded-lg border border-border p-1">
            {[{ v: "light", i: Sun }, { v: "dark", i: Moon }, { v: "system", i: Monitor }].map((t) => (
              <button key={t.v} onClick={() => t.v !== theme && t.v !== "system" && toggle()} className={`grid h-8 w-9 place-items-center rounded-md text-xs transition-colors ${(t.v === theme) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <t.i className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section icon={Bell} title="Notifications" desc="Choose what to hear from us.">
        <Row label="Daily reminders" desc="Get a nudge if you haven't logged in."><Switch defaultChecked /></Row>
        <Row label="Weekly reports" desc="Recap of your progress every Sunday."><Switch defaultChecked /></Row>
        <Row label="New mock feedback" desc="Alert when AI has scored your session."><Switch defaultChecked /></Row>
        <Row label="Product updates" desc="Occasional emails about new features."><Switch /></Row>
      </Section>

      <Section icon={Shield} title="Privacy" desc="Control your data visibility.">
        <Row label="Public profile"><Switch defaultChecked /></Row>
        <Row label="Show on leaderboard"><Switch defaultChecked /></Row>
        <Row label="Share analytics with team"><Switch /></Row>
      </Section>

      <Section icon={Globe} title="Language & region">
        <Row label="Language">
          <Select defaultValue="en"><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Timezone">
          <Select defaultValue="pst"><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pst">Pacific (PST)</SelectItem>
              <SelectItem value="est">Eastern (EST)</SelectItem>
              <SelectItem value="ist">India (IST)</SelectItem>
              <SelectItem value="cet">Central Europe (CET)</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Section>

      <Section icon={User} title="Account" desc="Sensitive actions related to your account.">
        <Row label="Change password"><Button variant="outline" size="sm">Change</Button></Row>
        <Row label="Export data" desc="Download all your notes, progress, and history."><Button variant="outline" size="sm">Export</Button></Row>
        <Row label="Delete account" desc="Permanently remove your account and data.">
          <Button variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-3.5 w-3.5" /> Delete</Button>
        </Row>
      </Section>
    </div>
  );
}
