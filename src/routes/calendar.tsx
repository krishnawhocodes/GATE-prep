import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { addDaysKey, todayKey } from "@/lib/time";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

function CalendarPage() {
  const { state } = useStore();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const monthDays = useMemo(() => {
    const first = new Date(cursor);
    const days: (string | null)[] = [];
    const startWeekday = first.getDay();
    for (let i = 0; i < startWeekday; i++) days.push(null);
    const dim = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= dim; i++) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth(), i);
      days.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      );
    }
    return days;
  }, [cursor]);
  const [selected, setSelected] = useState<string>(todayKey());

  function dayColor(key: string) {
    const tasks = state.tasks.filter((t) => t.date === key);
    const sessions = state.sessions.filter((s) => s.startTime.startsWith(key));
    const today = todayKey();
    if (tasks.length === 0 && sessions.length === 0) return "bg-white/5";
    const done = tasks.filter((t) => t.completed).length;
    if (done === tasks.length && tasks.length > 0) return "bg-emerald-glow/30";
    if (done > 0) return "bg-gold/30";
    if (key < today) return "bg-destructive/30";
    return "bg-saffron/20";
  }

  const dayTasks = state.tasks.filter((t) => t.date === selected);
  const daySessions = state.sessions.filter((s) => s.startTime.startsWith(selected));
  const dayMistakes = state.mistakes.filter((m) => m.date === selected);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="text-sm font-medium w-32 text-center">{format(cursor, "MMMM yyyy")}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>
      <Card className="glass p-4">
        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((k, i) =>
            k === null ? (
              <div key={i} />
            ) : (
              <button
                key={k}
                onClick={() => setSelected(k)}
                className={`aspect-square rounded-md text-xs hover:ring-1 hover:ring-saffron ${dayColor(k)} ${selected === k ? "ring-2 ring-saffron" : ""}`}
              >
                {parseInt(k.slice(-2))}
              </button>
            ),
          )}
        </div>
      </Card>
      <Card className="glass p-5">
        <div className="text-sm font-semibold mb-3">
          {format(new Date(selected), "EEEE, d MMM yyyy")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Tasks ({dayTasks.filter((t) => t.completed).length}/{dayTasks.length})
            </div>
            <ul className="space-y-1">
              {dayTasks.map((t) => (
                <li key={t.id} className={t.completed ? "line-through text-muted-foreground" : ""}>
                  {t.title}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Sessions ({daySessions.length})
            </div>
            <ul className="space-y-1">
              {daySessions.map((s) => (
                <li key={s.id}>
                  {s.type} · {Math.round(s.durationSeconds / 60)}m
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Mistakes ({dayMistakes.length})
            </div>
            <ul className="space-y-1">
              {dayMistakes.map((m) => (
                <li key={m.id}>{m.topic}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
