import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, useDerived } from "@/lib/store";
import { ProgressRing } from "@/components/ProgressRing";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatShort, formatHuman, todayKey, daysBetween, addDaysKey } from "@/lib/time";
import { format } from "date-fns";
import {
  Flame,
  Trophy,
  AlertTriangle,
  Sparkles,
  ListTodo,
  RotateCcw,
  Timer,
  ChevronRight,
} from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/")({ component: Dashboard });

const QUOTES = [
  "योगः कर्मसु कौशलम् — Excellence in action is yoga.",
  "तपस्या is the bridge between aspiration and achievement.",
  "Small daily sadhana compounds into great victory.",
  "The arrow you let go today decides tomorrow's target.",
  "Consistency over intensity. Sadhana over sprints.",
];

function Dashboard() {
  const { state } = useStore();
  const d = useDerived();
  const today = todayKey();
  const target = state.settings.targetDate;

  const todayTasks = state.tasks.filter((t) => t.date === today);
  const todayDoneCount = todayTasks.filter((t) => t.completed).length;
  const todaySessions = state.sessions.filter((s) => s.startTime.startsWith(today));
  const todayStudySec = todaySessions.reduce((a, s) => a + s.durationSeconds, 0);

  // Week study hours
  const weekSec = useMemo(() => {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const k = addDaysKey(today, -i);
      total += state.sessions
        .filter((s) => s.startTime.startsWith(k))
        .reduce((a, s) => a + s.durationSeconds, 0);
    }
    return total;
  }, [state.sessions, today]);

  // Streak
  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const k = addDaysKey(today, -i);
      const has = state.sessions.some((x) => x.startTime.startsWith(k));
      if (has) s++;
      else break;
    }
    return s;
  }, [state.sessions, today]);

  const backlogCount = state.tasks.filter((t) => t.status === "backlog" && !t.completed).length;
  const dueRevisions = state.revisions.filter((r) => !r.done && r.dueDate <= today);

  // Target tracker
  const daysLeft = daysBetween(today, target);
  const remainingPlanned = (d.totalRaw - d.completedRaw) * state.settings.planningFactor;
  const requiredHoursPerDay = daysLeft > 0 ? remainingPlanned / 3600 / daysLeft : 0;
  const onTrack = requiredHoursPerDay <= state.settings.dailyStudyHourTarget;
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold/80">ॐ · Today's Sankalp</div>
          <h1 className="mt-2 text-3xl lg:text-4xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-[--saffron] via-[--gold] to-[--emerald-glow] bg-clip-text text-transparent">
              {greeting()}, sadhak.
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM yyyy")} · Indian Standard Time
          </p>
        </div>
        <Card className="glass p-4 max-w-md">
          <div className="flex gap-3 items-start">
            <Sparkles className="size-5 text-gold shrink-0 mt-0.5" />
            <p className="text-sm italic text-foreground/90">"{quote}"</p>
          </div>
        </Card>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass p-6 mandala-bg">
          <div className="flex items-center gap-5">
            <ProgressRing value={d.overallPercent} size={108} stroke={10} sub="overall" />
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                GATE Mission Progress
              </div>
              <div className="text-2xl font-semibold">
                {d.completedLectures} / {d.totalLectures}
              </div>
              <div className="text-xs text-muted-foreground">lectures complete</div>
              <div className="text-xs text-emerald-glow">
                {formatShort(d.completedRaw)} / {formatShort(d.totalRaw)} raw
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Today's Focus
              </div>
              <Timer className="size-4 text-saffron" />
            </div>
            <div className="text-3xl font-semibold">{formatShort(todayStudySec)}</div>
            <div className="text-xs text-muted-foreground">
              of {state.settings.dailyStudyHourTarget}h target
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[--saffron] to-[--gold]"
                style={{
                  width: `${Math.min(100, (todayStudySec / 3600 / state.settings.dailyStudyHourTarget) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-muted-foreground">This week</span>
              <span className="text-foreground">{formatShort(weekSec)}</span>
            </div>
          </div>
        </Card>

        <Card className="glass p-6">
          <div className="grid grid-cols-2 gap-4">
            <Stat
              icon={<Flame className="size-4 text-saffron" />}
              label="Streak"
              value={`${streak}d`}
            />
            <Stat
              icon={<Trophy className="size-4 text-gold" />}
              label="Today done"
              value={`${todayDoneCount}/${todayTasks.length}`}
            />
            <Stat
              icon={<AlertTriangle className="size-4 text-destructive" />}
              label="Backlog"
              value={`${backlogCount}`}
            />
            <Stat
              icon={<RotateCcw className="size-4 text-emerald-glow" />}
              label="Revisions due"
              value={`${dueRevisions.length}`}
            />
          </div>
        </Card>
      </div>

      {/* Target tracker */}
      <Card
        className={`p-5 glass border-l-4 ${onTrack ? "border-l-[--emerald-glow]" : "border-l-destructive"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Target Tracker
            </div>
            <div className="text-lg font-semibold mt-1">
              {daysLeft} days to GATE Day · {format(new Date(target), "d MMM yyyy")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Remaining planned study:{" "}
              <span className="text-foreground">{formatShort(remainingPlanned)}</span>
              {" · "} Required pace:{" "}
              <span className="text-foreground">{requiredHoursPerDay.toFixed(2)}h/day</span>
            </div>
          </div>
          <Badge
            variant={onTrack ? "default" : "destructive"}
            className={onTrack ? "bg-emerald-glow text-[oklch(0.15_0.04_280)]" : ""}
          >
            {onTrack ? "On Track" : "Behind — pick up pace"}
          </Badge>
        </div>
      </Card>

      {/* Subject grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Subjects</h2>
          <Link
            to="/subjects"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            View all <ChevronRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {state.subjects.map((s) => {
            const b = d.bySubject.get(s.id)!;
            const pct = b.rawSeconds > 0 ? (b.completedRawSeconds / b.rawSeconds) * 100 : 0;
            const status =
              b.completedLectures === 0 ? "Not Started" : pct >= 100 ? "Completed" : "In Progress";
            return (
              <Link to="/subjects/$id" params={{ id: s.id }} key={s.id}>
                <Card className="glass p-4 hover:scale-[1.02] transition-all hover:border-saffron/40 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-9 rounded-lg grid place-items-center"
                        style={{ background: `${s.themeColor}22`, color: s.themeColor }}
                      >
                        <DynamicIcon name={s.icon} className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{s.shortName}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                          {s.name}
                        </div>
                      </div>
                    </div>
                    <ProgressRing value={pct} size={48} stroke={5} label={`${Math.round(pct)}%`} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {b.completedLectures}/{b.lectureCount} · {formatShort(b.completedRawSeconds)}/
                    {formatShort(b.rawSeconds)}
                  </div>
                  <Badge variant="outline" className="mt-2 text-[10px]">
                    {status}
                  </Badge>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Today tasks + revisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListTodo className="size-4 text-saffron" />
              <h3 className="font-semibold">Today's Tasks</h3>
            </div>
            <Link to="/planner">
              <Button size="sm" variant="ghost">
                Open planner
              </Button>
            </Link>
          </div>
          {todayTasks.length === 0 ? (
            <EmptyState text="No tasks yet. Plan your sadhana for today." />
          ) : (
            <ul className="space-y-2">
              {todayTasks.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={`size-2 rounded-full ${t.completed ? "bg-emerald-glow" : "bg-white/30"}`}
                  />
                  <span className={t.completed ? "line-through text-muted-foreground" : ""}>
                    {t.title}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatHuman(t.plannedSeconds)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="glass p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="size-4 text-emerald-glow" />
              <h3 className="font-semibold">Revisions Due Today</h3>
            </div>
            <Link to="/revision">
              <Button size="sm" variant="ghost">
                Open queue
              </Button>
            </Link>
          </div>
          {dueRevisions.length === 0 ? (
            <EmptyState text="No revisions due. Smriti is fresh." />
          ) : (
            <ul className="space-y-2 max-h-56 overflow-auto scrollbar-thin">
              {dueRevisions.slice(0, 8).map((r) => {
                const lec = state.lectures.find((l) => l.id === r.lectureId);
                const sub = state.subjects.find((s) => s.id === r.subjectId);
                return (
                  <li key={r.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-[10px]">
                      {r.interval}d
                    </Badge>
                    <span className="truncate">{lec?.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{sub?.shortName}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-sm text-muted-foreground py-6 text-center italic">{text}</div>;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Shubh prabhat";
  if (h < 17) return "Good afternoon";
  if (h < 20) return "Shubh sandhya";
  return "Good evening";
}
