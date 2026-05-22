import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { addDaysKey, formatHuman, formatShort, todayKey } from "@/lib/time";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Archive,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import type { TaskType } from "@/lib/types";

export const Route = createFileRoute("/planner")({ component: Planner });

const TYPE_LABEL: Record<TaskType, string> = {
  lecture: "Lecture",
  practice: "Practice",
  revision: "Revision",
  test: "Test",
  dsa: "DSA",
  running: "Fitness",
  reading: "Reading",
  custom: "Custom",
};

function Planner() {
  const {
    state,
    addTask,
    toggleTask,
    removeTask,
    moveToBacklog,
    rescheduleBacklog,
    setReflection,
  } = useStore();
  const [date, setDate] = useState(todayKey());
  const tasks = useMemo(() => state.tasks.filter((t) => t.date === date), [state.tasks, date]);
  const grouped = useMemo(() => {
    const m: Record<string, typeof tasks> = {};
    tasks.forEach((t) => {
      (m[t.type] ||= []).push(t);
    });
    return m;
  }, [tasks]);

  const planned = tasks.reduce((a, t) => a + t.plannedSeconds, 0);
  const actual = state.sessions
    .filter((s) => s.startTime.startsWith(date))
    .reduce((a, s) => a + s.durationSeconds, 0);
  const completedCount = tasks.filter((t) => t.completed).length;
  const completionScore = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const reflection = state.reflections.find((r) => r.date === date);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Daily Planner</h1>
          <p className="text-sm text-muted-foreground">Plan today's sadhana with intention.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDate(addDaysKey(date, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
          <Button variant="ghost" size="sm" onClick={() => setDate(addDaysKey(date, 1))}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDate(todayKey())}>
            <CalendarIcon className="size-3.5 mr-1" />
            Today
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Daily completion</div>
          <div className="text-2xl font-semibold">{completionScore}%</div>
          <div className="text-xs">
            {completedCount}/{tasks.length} done
          </div>
        </Card>
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Planned hours</div>
          <div className="text-2xl font-semibold">{formatShort(planned)}</div>
        </Card>
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Actual study</div>
          <div className="text-2xl font-semibold text-emerald-glow">{formatShort(actual)}</div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AddTaskDialog date={date} addTask={addTask} />
        <AddLectureDialog date={date} addTask={addTask} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            rescheduleBacklog(5);
            toast.success("Backlog redistributed across 5 days");
          }}
        >
          <Wand2 className="size-3.5 mr-1" />
          Smart reschedule backlog
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card className="glass p-10 text-center text-sm text-muted-foreground italic">
          No tasks for this day. Begin by adding a lecture or custom task.
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, items]) => (
            <Card key={type} className="glass p-4">
              <div className="text-xs uppercase tracking-wider text-gold mb-2">
                {TYPE_LABEL[type as TaskType] || type}
              </div>
              <ul className="divide-y divide-white/5">
                {items.map((t) => (
                  <li key={t.id} className="py-2 flex items-center gap-3">
                    <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t.id)} />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm truncate ${t.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {t.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatHuman(t.plannedSeconds)} · {t.priority}
                      </div>
                    </div>
                    {t.status === "backlog" && (
                      <Badge variant="destructive" className="text-[10px]">
                        Backlog
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Move to backlog"
                      onClick={() => moveToBacklog(t.id)}
                    >
                      <Archive className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Delete"
                      onClick={() => removeTask(t.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <Card className="glass p-5">
        <div className="text-sm font-semibold mb-3">
          Daily Reflection — {format(new Date(date), "d MMM")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">What went well?</Label>
            <Textarea
              defaultValue={reflection?.wentWell}
              onBlur={(e) =>
                setReflection({ ...(reflection || { date }), date, wentWell: e.target.value })
              }
            />
          </div>
          <div>
            <Label className="text-xs">What distracted me?</Label>
            <Textarea
              defaultValue={reflection?.distractions}
              onBlur={(e) =>
                setReflection({ ...(reflection || { date }), date, distractions: e.target.value })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Tomorrow's #1 priority</Label>
            <Input
              defaultValue={reflection?.topPriorityTomorrow}
              onBlur={(e) =>
                setReflection({
                  ...(reflection || { date }),
                  date,
                  topPriorityTomorrow: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Focus rating (1–10)</Label>
            <Input
              type="number"
              min={1}
              max={10}
              defaultValue={reflection?.focusRating}
              onBlur={(e) =>
                setReflection({
                  ...(reflection || { date }),
                  date,
                  focusRating: parseInt(e.target.value) || undefined,
                })
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function AddTaskDialog({ date, addTask }: { date: string; addTask: any }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("custom");
  const [mins, setMins] = useState(30);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5 mr-1" />
          Add task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABEL).map(([k, l]) => (
                    <SelectItem key={k} value={k}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minutes</Label>
              <Input
                type="number"
                value={mins}
                onChange={(e) => setMins(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (!title.trim()) return;
              addTask({ date, title, type, plannedSeconds: mins * 60, priority });
              toast.success("Task added");
              setOpen(false);
              setTitle("");
            }}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddLectureDialog({ date, addTask }: { date: string; addTask: any }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [lectureId, setLectureId] = useState("");
  const chapters = state.chapters.filter((c) => c.subjectId === subjectId);
  const lectures = state.lectures
    .filter((l) => l.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-3.5 mr-1" />
          Add lecture task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Lecture Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select
            value={subjectId}
            onValueChange={(v) => {
              setSubjectId(v);
              setChapterId("");
              setLectureId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {state.subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={chapterId}
            onValueChange={(v) => {
              setChapterId(v);
              setLectureId("");
            }}
            disabled={!subjectId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lectureId} onValueChange={setLectureId} disabled={!chapterId}>
            <SelectTrigger>
              <SelectValue placeholder="Lecture" />
            </SelectTrigger>
            <SelectContent>
              {lectures.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            disabled={!lectureId}
            onClick={() => {
              const lec = state.lectures.find((l) => l.id === lectureId)!;
              addTask({
                date,
                title: lec.title,
                type: "lecture",
                subjectId,
                chapterId,
                lectureId,
                plannedSeconds: Math.round(lec.rawSeconds * state.settings.planningFactor),
                priority: "medium",
              });
              toast.success("Lecture added to planner");
              setOpen(false);
            }}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
