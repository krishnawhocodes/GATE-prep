import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { todayKey } from "@/lib/time";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/revision")({ component: RevisionPage });

function RevisionPage() {
  const { state, toggleRevision } = useStore();
  const [filter, setFilter] = useState("all");
  const today = todayKey();

  const filtered = useMemo(
    () => state.revisions.filter((r) => filter === "all" || r.subjectId === filter),
    [state.revisions, filter],
  );
  const due = filtered.filter((r) => !r.done && r.dueDate === today);
  const overdue = filtered.filter((r) => !r.done && r.dueDate < today);
  const upcoming = filtered
    .filter((r) => !r.done && r.dueDate > today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const done = filtered.filter((r) => r.done);

  function row(r: (typeof state.revisions)[number]) {
    const lec = state.lectures.find((l) => l.id === r.lectureId);
    const sub = state.subjects.find((s) => s.id === r.subjectId);
    return (
      <li key={r.id} className="py-2 flex items-center gap-2 text-sm">
        <Checkbox checked={r.done} onCheckedChange={() => toggleRevision(r.id)} />
        <Badge variant="outline" className="text-[10px]">
          {r.interval}d
        </Badge>
        <span className={`flex-1 truncate ${r.done ? "line-through text-muted-foreground" : ""}`}>
          {lec?.title || "(deleted)"}
        </span>
        <span className="text-xs text-muted-foreground">{sub?.shortName}</span>
        <span className="text-xs text-muted-foreground">{r.dueDate}</span>
      </li>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Revision Queue</h1>
          <p className="text-sm text-muted-foreground">Spaced repetition: 1, 3, 7, 15, 30 days.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {state.subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>
      <Tabs defaultValue="due">
        <TabsList>
          <TabsTrigger value="due">Due today ({due.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="done">Completed ({done.length})</TabsTrigger>
        </TabsList>
        {[
          ["due", due],
          ["overdue", overdue],
          ["upcoming", upcoming],
          ["done", done],
        ].map(([k, list]: any) => (
          <TabsContent key={k} value={k}>
            <Card className="glass p-4">
              {list.length === 0 ? (
                <div className="text-sm text-muted-foreground italic text-center py-6">
                  Nothing here.
                </div>
              ) : (
                <ul className="divide-y divide-white/5">{list.map(row)}</ul>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
