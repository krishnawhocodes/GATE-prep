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

export const Route = createFileRoute("/doubts")({ component: DoubtsPage });

function DoubtsPage() {
  const { state, addDoubt, updateDoubt } = useStore();
  const unresolved = state.doubts.filter((d) => d.status === "unresolved");
  const resolved = state.doubts.filter((d) => d.status === "resolved");
  const grouped = useMemo(() => {
    const m = new Map<string, typeof state.doubts>();
    unresolved.forEach((d) => {
      const list = m.get(d.subjectId) || [];
      list.push(d);
      m.set(d.subjectId, list);
    });
    return m;
  }, [unresolved]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Doubt Tracker</h1>
          <p className="text-sm text-muted-foreground">Clarity is the path to mastery.</p>
        </div>
        <AddDoubt addDoubt={addDoubt} />
      </header>

      {grouped.size === 0 && (
        <Card className="glass p-10 text-center text-sm text-muted-foreground italic">
          No unresolved doubts. Ananda!
        </Card>
      )}

      {Array.from(grouped.entries()).map(([sid, list]) => {
        const s = state.subjects.find((x) => x.id === sid);
        return (
          <Card key={sid} className="glass p-4">
            <div className="text-sm font-semibold mb-2">
              {s?.name} · <span className="text-muted-foreground">{list.length} open</span>
            </div>
            <ul className="divide-y divide-white/5">
              {list.map((d) => (
                <li key={d.id} className="py-2 flex items-start gap-2 text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{d.topic}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{d.doubtText}</div>
                  </div>
                  <Badge variant="outline">{d.priority}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      updateDoubt(d.id, { status: "resolved" });
                      toast.success("Resolved");
                    }}
                  >
                    <Check className="size-3" />
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}

      {resolved.length > 0 && (
        <Card className="glass p-4 opacity-60">
          <div className="text-sm font-semibold mb-2">Resolved · {resolved.length}</div>
          <ul className="divide-y divide-white/5 text-sm">
            {resolved.slice(-10).map((d) => (
              <li key={d.id} className="py-2 line-through">
                {d.topic}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function AddDoubt({ addDoubt }: { addDoubt: any }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5 mr-1" />
          Add doubt
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Doubt</DialogTitle>
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
            <Label>Doubt</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} />
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
        <DialogFooter>
          <Button
            disabled={!subjectId || !topic}
            onClick={() => {
              addDoubt({
                date: todayKey(),
                subjectId,
                topic,
                doubtText: text,
                priority,
                status: "unresolved",
              });
              toast.success("Doubt added");
              setOpen(false);
              setTopic("");
              setText("");
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
