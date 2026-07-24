import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import {
  Folder, Pin, Plus, Search, Tag, FileText, Star, Clock, MoreHorizontal,
  Bold, Italic, List, Hash, Code2, Image,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/notes")({ component: Notes });

const folders = [
  { name: "DSA", count: 42, color: "text-primary" },
  { name: "System Design", count: 18, color: "text-emerald-brand" },
  { name: "OS", count: 12, color: "text-amber-500" },
  { name: "DBMS", count: 9, color: "text-purple-400" },
  { name: "Networks", count: 7, color: "text-cyan-400" },
];

const tags = ["DSA", "OS", "DBMS", "Networks", "System Design", "Behavioral", "Maths"];

const pinned = [
  {
    title: "Big-O Cheatsheet",
    tag: "DSA",
    preview: "Quick reference for time & space complexities of common data structures and sorting algorithms...",
    words: 340,
    when: "2h ago",
    starred: true,
  },
  {
    title: "CAP Theorem Notes",
    tag: "System Design",
    preview: "Consistency, Availability, Partition tolerance — pick any two. A distributed system can only guarantee two of the three...",
    words: 520,
    when: "Yesterday",
    starred: false,
  },
];

const recent = [
  { title: "Sliding window patterns", tag: "DSA", when: "2h", words: 210 },
  { title: "TCP vs UDP comparison", tag: "Networks", when: "Yesterday", words: 185 },
  { title: "ACID properties deep dive", tag: "DBMS", when: "2d", words: 430 },
  { title: "Load balancer types", tag: "System Design", when: "3d", words: 295 },
  { title: "Process vs Thread", tag: "OS", when: "1w", words: 170 },
  { title: "Trie data structure", tag: "DSA", when: "1w", words: 380 },
];

const tagColors: Record<string, string> = {
  DSA: "border-primary/40 text-primary bg-primary/5",
  "System Design": "border-emerald-brand/40 text-emerald-brand bg-emerald-brand/5",
  OS: "border-amber-500/40 text-amber-600 bg-amber-500/5",
  DBMS: "border-purple-400/40 text-purple-400 bg-purple-400/5",
  Networks: "border-cyan-400/40 text-cyan-400 bg-cyan-400/5",
  Behavioral: "border-pink-400/40 text-pink-400 bg-pink-400/5",
};

function Notes() {
  const [activeFolder, setActiveFolder] = useState("All");
  const [activeNote, setActiveNote] = useState(pinned[0].title);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4">
      <PageHeader title="Notes" description="Your second brain for interview prep.">
        <Button className="bg-gradient-primary shadow-elegant rounded-xl gap-2">
          <Plus className="h-4 w-4" /> New note
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-9 rounded-xl border-border/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Folders */}
          <Card className="border-border/40 p-3 shadow-soft">
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              Folders
            </div>
            <button
              onClick={() => setActiveFolder("All")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-sm transition-all ${
                activeFolder === "All" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50"
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">All notes</span>
              <span className="text-xs text-muted-foreground">92</span>
            </button>
            {folders.map((f) => (
              <button
                key={f.name}
                onClick={() => setActiveFolder(f.name)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-sm transition-all ${
                  activeFolder === f.name ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50"
                }`}
              >
                <Folder className={`h-4 w-4 shrink-0 ${f.color}`} />
                <span className="flex-1 text-left">{f.name}</span>
                <span className="text-xs text-muted-foreground">{f.count}</span>
              </button>
            ))}
          </Card>

          {/* Tags */}
          <Card className="border-border/40 p-3 shadow-soft">
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5 px-2">
              {tags.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className={`cursor-pointer text-xs transition-all hover:scale-105 ${tagColors[t] ?? ""}`}
                >
                  <Tag className="mr-1 h-2.5 w-2.5" />
                  {t}
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Main area */}
        <div className="min-h-0 space-y-5">
          {/* Pinned notes */}
          <div>
            <div className="flex items-center gap-2 text-sm font-bold mb-3">
              <Pin className="h-4 w-4 text-primary" />
              Pinned
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {pinned.map((p) => (
                <Card
                  key={p.title}
                  onClick={() => setActiveNote(p.title)}
                  className={`group cursor-pointer border p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant ${
                    activeNote === p.title ? "border-primary/40 bg-primary/5" : "border-border/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm leading-tight">{p.title}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {p.starred && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                      <Pin className="h-3.5 w-3.5 text-primary opacity-70" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.preview}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className={`text-xs ${tagColors[p.tag] ?? ""}`}>{p.tag}</Badge>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.when}</span>
                      <span>{p.words} words</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent notes */}
          <div>
            <div className="text-sm font-bold mb-3">Recent notes</div>
            <Card className="border-border/40 p-0 shadow-soft overflow-hidden divide-y divide-border/40">
              {recent.map((r) => (
                <button
                  key={r.title}
                  onClick={() => setActiveNote(r.title)}
                  className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-all hover:bg-muted/40 ${
                    activeNote === r.title ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className={`h-4 text-[10px] ${tagColors[r.tag] ?? ""}`}>{r.tag}</Badge>
                      <span>{r.words} words</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {r.when}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </button>
              ))}
            </Card>
          </div>

          {/* Mini editor preview */}
          {activeNote && (
            <Card className="border-border/40 shadow-soft overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-3 bg-muted/20">
                <div className="text-sm font-bold">{activeNote}</div>
                <div className="flex items-center gap-1">
                  {[Bold, Italic, List, Hash, Code2, Image].map((Icon, i) => (
                    <Button key={i} variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                      <Icon className="h-3.5 w-3.5" />
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-5 min-h-48 text-sm text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground mb-2"># {activeNote}</p>
                <p>{pinned.find((p) => p.title === activeNote)?.preview ?? recent.find((r) => r.title === activeNote)?.title + " — click to start editing."}</p>
                <p className="mt-3 text-muted-foreground/60 italic">Continue writing here...</p>
              </div>
              <div className="border-t border-border/40 px-5 py-3 flex items-center justify-between bg-muted/10">
                <span className="text-xs text-muted-foreground">Auto-saved · 2h ago</span>
                <Button size="sm" className="bg-gradient-primary rounded-lg h-7 text-xs">Save & close</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
