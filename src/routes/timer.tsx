import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { todayKey, formatHMS, formatShort } from "@/lib/time";
import { toast } from "sonner";
import type { TaskType } from "@/lib/types";

export const Route = createFileRoute("/timer")({ component: TimerPage });

type Mode = "stopwatch" | "pom-50-10" | "pom-25-5" | "custom";

function TimerPage() {
  const { state, addSession, setLectureStatus } = useStore();
  const [mode, setMode] = useState<Mode>("stopwatch");
  const [subjectId, setSubjectId] = useState<string>("");
  const [lectureId, setLectureId] = useState<string>("");
  const [type, setType] = useState<TaskType>("lecture");
  const [customMin, setCustomMin] = useState(45);

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [phase, setPhase] = useState<"work" | "break">("work");
  const startRef = useRef<number | null>(null);

  // tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (startRef.current !== null) setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const targetSeconds = (() => {
    if (mode === "pom-50-10") return phase === "work" ? 50 * 60 : 10 * 60;
    if (mode === "pom-25-5") return phase === "work" ? 25 * 60 : 5 * 60;
    if (mode === "custom") return customMin * 60;
    return 0;
  })();

  // auto stop pomodoro
  useEffect(() => {
    if (!running || targetSeconds === 0) return;
    if (elapsed >= targetSeconds) {
      if (mode === "pom-50-10" || mode === "pom-25-5") {
        toast.success(`${phase === "work" ? "Work" : "Break"} block done`);
        finishCurrent(false);
        setPhase((p) => (p === "work" ? "break" : "work"));
      } else {
        finishCurrent(true);
      }
    }
  }, [elapsed, running, targetSeconds]);

  const lectureOptions = state.lectures.filter((l) => !subjectId || l.subjectId === subjectId);

  const todaySessions = state.sessions.filter((s) => s.startTime.startsWith(todayKey()));
  const todayTotal = todaySessions.reduce((a, s) => a + s.durationSeconds, 0);

  const [postOpen, setPostOpen] = useState(false);
  const [postNote, setPostNote] = useState("");
  const [postFocus, setPostFocus] = useState(8);
  const [markLectureDone, setMarkLectureDone] = useState(true);
  const [pendingSession, setPendingSession] = useState<{
    duration: number;
    start: string;
    end: string;
  } | null>(null);

  function startTimer() {
    setRunning(true);
    setElapsed(0);
    startRef.current = Date.now();
    setStartedAt(new Date().toISOString());
    setPhase("work");
  }

  function finishCurrent(openPost: boolean) {
    setRunning(false);
    const end = new Date().toISOString();
    const duration = elapsed;
    if (duration < 10) {
      toast.info("Session too short to save");
      return;
    }
    setPendingSession({ duration, start: startedAt || end, end });
    if (openPost) setPostOpen(true);
  }

  function savePending() {
    if (!pendingSession) return;
    addSession({
      type,
      subjectId: subjectId || undefined,
      lectureId: lectureId || undefined,
      startTime: pendingSession.start,
      endTime: pendingSession.end,
      durationSeconds: pendingSession.duration,
      focusRating: postFocus,
      notes: postNote,
    });
    if (markLectureDone && lectureId) {
      setLectureStatus(lectureId, "lecture_done");
    }
    toast.success("Session saved");
    setPendingSession(null);
    setPostOpen(false);
    setPostNote("");
    setElapsed(0);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Study Timer</h1>
        <p className="text-sm text-muted-foreground">Sit. Breathe. Begin tapasya.</p>
      </header>

      <Card className="glass p-6 mandala-bg">
        <div className="flex flex-col items-center gap-5">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
              <TabsTrigger value="pom-50-10">50/10</TabsTrigger>
              <TabsTrigger value="pom-25-5">25/5</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="text-7xl font-mono tracking-tight tabular-nums bg-gradient-to-br from-[--saffron] via-[--gold] to-[--emerald-glow] bg-clip-text text-transparent">
            {formatHMS(targetSeconds > 0 ? Math.max(0, targetSeconds - elapsed) : elapsed)}
          </div>
          {mode !== "stopwatch" && (
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              {phase === "work" ? "Work block" : "Break"}
            </div>
          )}

          <div className="flex gap-2">
            {!running ? (
              <Button
                onClick={startTimer}
                className="bg-saffron text-[oklch(0.15_0.04_280)] hover:opacity-90"
              >
                <Play className="size-4 mr-1" />
                Start
              </Button>
            ) : (
              <Button onClick={() => setRunning(false)} variant="outline">
                <Pause className="size-4 mr-1" />
                Pause
              </Button>
            )}
            {running && elapsed > 0 && (
              <Button onClick={() => finishCurrent(true)} variant="destructive">
                <Square className="size-4 mr-1" />
                Stop & Save
              </Button>
            )}
            <Button
              onClick={() => {
                setRunning(false);
                setElapsed(0);
                startRef.current = null;
              }}
              variant="ghost"
            >
              <RotateCcw className="size-4 mr-1" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full max-w-3xl pt-4 border-t border-white/5">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["lecture", "practice", "revision", "test", "dsa", "reading", "custom"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Subject</Label>
              <Select
                value={subjectId}
                onValueChange={(v) => {
                  setSubjectId(v);
                  setLectureId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {state.subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Lecture (optional)</Label>
              <Select value={lectureId} onValueChange={setLectureId}>
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {lectureOptions.slice(0, 200).map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {mode === "custom" && (
              <div className="md:col-span-4">
                <Label className="text-xs">Custom minutes</Label>
                <Input
                  type="number"
                  value={customMin}
                  onChange={(e) => setCustomMin(parseInt(e.target.value) || 0)}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="glass p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Today's Sessions</h3>
          <div className="text-sm text-emerald-glow">Total: {formatShort(todayTotal)}</div>
        </div>
        {todaySessions.length === 0 ? (
          <div className="text-sm text-muted-foreground italic py-4 text-center">
            No sessions yet.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {todaySessions.map((s) => {
              const sub = state.subjects.find((x) => x.id === s.subjectId);
              return (
                <li key={s.id} className="py-2 flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground text-xs w-24">
                    {new Date(s.startTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>{s.type}</span>
                  {sub && <span className="text-muted-foreground text-xs">· {sub.shortName}</span>}
                  <span className="ml-auto font-mono">{formatHMS(s.durationSeconds)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Complete · {formatHMS(pendingSession?.duration || 0)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={markLectureDone}
                disabled={!lectureId}
                onChange={(e) => setMarkLectureDone(e.target.checked)}
              />
              <Label>Mark lecture as done</Label>
            </div>
            <div>
              <Label className="text-xs">Focus rating (1–10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={postFocus}
                onChange={(e) => setPostFocus(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label className="text-xs">Quick note</Label>
              <Textarea value={postNote} onChange={(e) => setPostNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={savePending}>Save session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
