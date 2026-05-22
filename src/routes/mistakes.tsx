import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { Plus, Check } from "lucide-react";

const TYPES = [
  "concept",
  "formula",
  "calculation",
  "silly",
  "misread",
  "time-pressure",
  "forgot-property",
] as const;

export const Route = createFileRoute("/mistakes")({ component: MistakesPage });

function MistakesPage() {
  const { state, addMistake, updateMistake } = useStore();
  const [filterSub, setFilterSub] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const items = useMemo(
    () =>
      state.mistakes.filter(
        (m) =>
          (filterSub === "all" || m.subjectId === filterSub) &&
          (filterStatus === "all" || m.status === filterStatus),
      ),
    [state.mistakes, filterSub, filterStatus],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    state.mistakes.forEach((m) => {
      c[m.mistakeType] = (c[m.mistakeType] || 0) + 1;
    });
    return c;
  }, [state.mistakes]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Mistake Notebook</h1>
          <p className="text-sm text-muted-foreground">Every mistake is a teacher.</p>
        </div>
        <AddMistakeDialog addMistake={addMistake} />
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TYPES.slice(0, 4).map((t) => (
          <Card key={t} className="glass p-3">
            <div className="text-xs text-muted-foreground capitalize">{t}</div>
            <div className="text-2xl font-semibold">{counts[t] || 0}</div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={filterSub} onValueChange={setFilterSub}>
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
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="revised">Revised</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <Card className="glass p-10 text-center text-sm text-muted-foreground italic">
          No mistakes yet. That's not always good — practice more and log honestly.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((m) => {
            const s = state.subjects.find((x) => x.id === m.subjectId);
            return (
              <Card key={m.id} className="glass p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm font-medium">{m.topic}</div>
                    <div className="text-xs text-muted-foreground">
                      {s?.shortName} · {m.date} · {m.mistakeType}
                    </div>
                  </div>
                  <Badge
                    variant={
                      m.status === "fixed"
                        ? "default"
                        : m.status === "open"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {m.status}
                  </Badge>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Went wrong:</span> {m.whatWentWrong}
                </div>
                {m.correctLogic && (
                  <div className="text-xs mt-1">
                    <span className="text-muted-foreground">Correct:</span> {m.correctLogic}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  {m.status !== "fixed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateMistake(m.id, { status: "fixed" });
                        toast.success("Marked fixed");
                      }}
                    >
                      <Check className="size-3 mr-1" />
                      Fixed
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddMistakeDialog({ addMistake }: { addMistake: any }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("concept");
  const [what, setWhat] = useState("");
  const [correct, setCorrect] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5 mr-1" />
          Add mistake
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Mistake</DialogTitle>
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
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>What went wrong</Label>
            <Textarea value={what} onChange={(e) => setWhat(e.target.value)} />
          </div>
          <div>
            <Label>Correct logic</Label>
            <Textarea value={correct} onChange={(e) => setCorrect(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!subjectId || !topic}
            onClick={() => {
              addMistake({
                date: todayKey(),
                subjectId,
                topic,
                mistakeType: type,
                whatWentWrong: what,
                correctLogic: correct,
                status: "open",
                priority: "medium",
              });
              toast.success("Mistake logged");
              setOpen(false);
              setTopic("");
              setWhat("");
              setCorrect("");
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
