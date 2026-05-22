import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { todayKey } from "@/lib/time";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export const Route = createFileRoute("/practice")({ component: PracticePage });

function PracticePage() {
  const { state, addPractice } = useStore();
  const bySubject = useMemo(() => {
    const m = new Map<string, { solved: number; correct: number; wrong: number }>();
    state.subjects.forEach((s) => m.set(s.id, { solved: 0, correct: 0, wrong: 0 }));
    state.practice.forEach((p) => {
      const x = m.get(p.subjectId);
      if (!x) return;
      x.solved += p.questionsSolved;
      x.correct += p.correct;
      x.wrong += p.wrong;
    });
    return state.subjects.map((s) => {
      const x = m.get(s.id)!;
      return {
        name: s.shortName,
        solved: x.solved,
        correct: x.correct,
        accuracy: x.solved > 0 ? Math.round((x.correct / x.solved) * 100) : 0,
      };
    });
  }, [state]);

  const trend = useMemo(() => {
    const byDate = new Map<string, { solved: number; correct: number }>();
    state.practice.forEach((p) => {
      const e = byDate.get(p.date) || { solved: 0, correct: 0 };
      e.solved += p.questionsSolved;
      e.correct += p.correct;
      byDate.set(p.date, e);
    });
    return Array.from(byDate.entries())
      .sort()
      .map(([date, v]) => ({
        date: date.slice(5),
        accuracy: v.solved ? Math.round((v.correct / v.solved) * 100) : 0,
      }));
  }, [state.practice]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Practice / PYQ Tracker</h1>
          <p className="text-sm text-muted-foreground">Every question solved is a step closer.</p>
        </div>
        <AddPractice addPractice={addPractice} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass p-4">
          <div className="text-sm font-semibold mb-3">Questions by Subject</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bySubject}>
              <CartesianGrid stroke="#ffffff10" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,40,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="solved" fill="var(--saffron)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="glass p-4">
          <div className="text-sm font-semibold mb-3">Accuracy by Subject</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bySubject}>
              <CartesianGrid stroke="#ffffff10" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,40,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="accuracy" fill="var(--emerald-glow)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="glass p-4">
        <div className="text-sm font-semibold mb-3">Accuracy Trend</div>
        {trend.length === 0 ? (
          <div className="text-sm text-muted-foreground italic text-center py-6">
            No practice yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,40,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                }}
              />
              <Line dataKey="accuracy" stroke="var(--gold)" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="glass p-4">
        <div className="text-sm font-semibold mb-3">Recent Practice Logs</div>
        {state.practice.length === 0 ? (
          <div className="text-sm text-muted-foreground italic text-center py-6">No logs yet.</div>
        ) : (
          <ul className="divide-y divide-white/5 text-sm">
            {[...state.practice]
              .reverse()
              .slice(0, 30)
              .map((p) => {
                const s = state.subjects.find((x) => x.id === p.subjectId);
                return (
                  <li key={p.id} className="py-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">{p.date}</span>
                    <span>
                      {s?.shortName} · {p.topic}
                    </span>
                    <span className="ml-auto text-xs">
                      {p.correct}/{p.questionsSolved} · {p.source}
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function AddPractice({ addPractice }: { addPractice: any }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [source, setSource] = useState<"PYQ" | "DPP" | "test" | "custom">("PYQ");
  const [solved, setSolved] = useState(10);
  const [correct, setCorrect] = useState(7);
  const [mins, setMins] = useState(30);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5 mr-1" />
          Log practice
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Practice</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={subjectId} onValueChange={setSubjectId}>
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
          <div>
            <Label>Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Source</Label>
              <Select value={source} onValueChange={(v) => setSource(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["PYQ", "DPP", "test", "custom"].map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time (min)</Label>
              <Input
                type="number"
                value={mins}
                onChange={(e) => setMins(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Solved</Label>
              <Input
                type="number"
                value={solved}
                onChange={(e) => setSolved(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Correct</Label>
              <Input
                type="number"
                value={correct}
                onChange={(e) => setCorrect(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!subjectId}
            onClick={() => {
              addPractice({
                date: todayKey(),
                subjectId,
                topic,
                source,
                questionsSolved: solved,
                correct,
                wrong: Math.max(0, solved - correct),
                timeSpentSeconds: mins * 60,
              });
              toast.success("Practice logged");
              setOpen(false);
              setTopic("");
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
