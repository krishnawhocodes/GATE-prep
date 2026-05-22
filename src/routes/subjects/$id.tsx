import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, useDerived } from "@/lib/store";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProgressRing } from "@/components/ProgressRing";
import { DynamicIcon } from "@/components/DynamicIcon";
import { formatShort, formatHuman, parseHMS, todayKey } from "@/lib/time";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, FileText, Plus, Timer, AlertCircle, HelpCircle, Upload } from "lucide-react";
import type { LectureStatus } from "@/lib/types";

export const Route = createFileRoute("/subjects/$id")({ component: SubjectDetail });

const STATUS_LABEL: Record<LectureStatus, string> = {
  not_started: "Not started",
  watching: "Watching",
  lecture_done: "Lecture done",
  notes_done: "Notes done",
  practice_done: "Practice done",
  revised: "Revised",
};

function SubjectDetail() {
  const { id } = Route.useParams();
  const { state, setLectureStatus, addTask, addMistake, addDoubt, addChapter, importLectures } =
    useStore();
  const d = useDerived();
  const sub = state.subjects.find((s) => s.id === id);
  if (!sub)
    return (
      <div>
        Subject not found.{" "}
        <Link to="/subjects" className="underline">
          Back
        </Link>
      </div>
    );
  const b = d.bySubject.get(sub.id)!;
  const chapters = state.chapters
    .filter((c) => c.subjectId === sub.id)
    .sort((a, b) => a.order - b.order);
  const pct = b.rawSeconds > 0 ? (b.completedRawSeconds / b.rawSeconds) * 100 : 0;

  return (
    <div className="space-y-6">
      <Link
        to="/subjects"
        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="size-3" />
        All subjects
      </Link>

      <Card className="glass p-6 mandala-bg">
        <div className="flex flex-wrap items-center gap-5">
          <div
            className="size-16 rounded-2xl grid place-items-center"
            style={{ background: `${sub.themeColor}22`, color: sub.themeColor }}
          >
            <DynamicIcon name={sub.icon} className="size-7" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl font-semibold">{sub.name}</h1>
            <div className="text-sm text-muted-foreground mt-1">
              {b.completedLectures}/{b.lectureCount} lectures · {formatShort(b.completedRawSeconds)}{" "}
              / {formatShort(b.rawSeconds)} · Planned {formatShort(b.plannedSeconds)}
            </div>
          </div>
          <ProgressRing value={pct} size={92} stroke={9} />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chapters</h2>
        <BulkImportButton
          subjectId={sub.id}
          addChapter={addChapter}
          importLectures={importLectures}
        />
      </div>

      {chapters.length === 0 ? (
        <Card className="glass p-8 text-center text-sm text-muted-foreground italic">
          No chapters yet. Import lectures to begin your sadhana.
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {chapters.map((ch) => {
            const lecs = state.lectures
              .filter((l) => l.chapterId === ch.id)
              .sort((a, b) => a.order - b.order);
            const totalRaw =
              lecs.reduce((a, l) => a + l.rawSeconds, 0) || ch.expectedRawSeconds || 0;
            const doneRaw = lecs
              .filter((l) => l.status !== "not_started" && l.status !== "watching")
              .reduce((a, l) => a + l.rawSeconds, 0);
            const chPct = totalRaw > 0 ? (doneRaw / totalRaw) * 100 : 0;
            const doneCount = lecs.filter(
              (l) => l.status !== "not_started" && l.status !== "watching",
            ).length;
            return (
              <AccordionItem key={ch.id} value={ch.id} className="glass rounded-xl border-white/10">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex-1 flex items-center gap-4 text-left">
                    <div className="flex-1">
                      <div className="font-medium">{ch.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {doneCount}/{lecs.length || ch.expectedLectureCount || 0} ·{" "}
                        {formatShort(doneRaw)}
                        {totalRaw ? ` / ${formatShort(totalRaw)}` : ""}
                      </div>
                    </div>
                    <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[--saffron] to-[--gold]"
                        style={{ width: `${chPct}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground w-10 text-right">
                      {Math.round(chPct)}%
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2">
                  {lecs.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground italic">
                      No lectures imported yet. Use Import Lectures.
                    </div>
                  ) : (
                    <ul className="divide-y divide-white/5">
                      {lecs.map((lec) => (
                        <LectureRow
                          key={lec.id}
                          lectureId={lec.id}
                          subjectId={sub.id}
                          onAddTask={(date: string) => {
                            addTask({
                              date,
                              title: lec.title,
                              type: "lecture",
                              subjectId: sub.id,
                              chapterId: ch.id,
                              lectureId: lec.id,
                              plannedSeconds: Math.round(
                                lec.rawSeconds * state.settings.planningFactor,
                              ),
                              priority: "medium",
                            });
                            toast.success("Added to planner");
                          }}
                          onAddMistake={() => {
                            /* handled in dialog */
                          }}
                          onAddDoubt={() => {
                            /* handled in dialog */
                          }}
                          addMistake={addMistake}
                          addDoubt={addDoubt}
                          setLectureStatus={setLectureStatus}
                        />
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

function LectureRow({
  lectureId,
  subjectId,
  onAddTask,
  addMistake,
  addDoubt,
  setLectureStatus,
}: any) {
  const { state } = useStore();
  const lec = state.lectures.find((l) => l.id === lectureId)!;
  const done = lec.status !== "not_started" && lec.status !== "watching";
  return (
    <li className="px-3 py-2 flex flex-wrap items-center gap-2 hover:bg-white/5">
      <Checkbox
        checked={done}
        onCheckedChange={(v) => {
          setLectureStatus(lectureId, v ? "lecture_done" : "not_started");
          if (v) toast.success("Lecture done · progress updated · revisions scheduled");
        }}
      />
      <div className="flex-1 min-w-[180px]">
        <div className="text-sm">{lec.title}</div>
        <div className="text-[11px] text-muted-foreground flex gap-2 flex-wrap">
          <span>Raw {lec.rawSeconds ? formatHuman(lec.rawSeconds) : "—"}</span>
          <span>·</span>
          <span>
            Planned{" "}
            {lec.rawSeconds
              ? formatHuman(Math.round(lec.rawSeconds * state.settings.planningFactor))
              : "—"}
          </span>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap">
        {lec.notesDone && (
          <Badge variant="outline" className="text-[10px]">
            Notes
          </Badge>
        )}
        {lec.practiceDone && (
          <Badge variant="outline" className="text-[10px]">
            Practice
          </Badge>
        )}
        {lec.revised && (
          <Badge variant="outline" className="text-[10px] border-emerald-glow/60 text-emerald-glow">
            Revised
          </Badge>
        )}
      </div>
      <Select
        value={lec.status}
        onValueChange={(v) => setLectureStatus(lectureId, v as LectureStatus)}
      >
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(STATUS_LABEL) as LectureStatus[]).map((k) => (
            <SelectItem key={k} value={k}>
              {STATUS_LABEL[k]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" variant="ghost" title="Add to today" onClick={() => onAddTask(todayKey())}>
        <Plus className="size-3.5" />
      </Button>
      <Link to="/timer" search={{ lectureId, subjectId } as any}>
        <Button size="sm" variant="ghost" title="Start timer">
          <Timer className="size-3.5" />
        </Button>
      </Link>
      <MistakeDialog subjectId={subjectId} topic={lec.title} addMistake={addMistake} />
      <DoubtDialog subjectId={subjectId} topic={lec.title} addDoubt={addDoubt} />
    </li>
  );
}

function MistakeDialog({
  subjectId,
  topic,
  addMistake,
}: {
  subjectId: string;
  topic: string;
  addMistake: any;
}) {
  const [open, setOpen] = useState(false);
  const [what, setWhat] = useState("");
  const [type, setType] = useState("concept");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" title="Add mistake">
          <AlertCircle className="size-3.5 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Mistake</DialogTitle>
          <DialogDescription>{topic}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "concept",
                  "formula",
                  "calculation",
                  "silly",
                  "misread",
                  "time-pressure",
                  "forgot-property",
                ].map((t) => (
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
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              addMistake({
                date: todayKey(),
                subjectId,
                topic,
                mistakeType: type,
                whatWentWrong: what,
                status: "open",
                priority: "medium",
              });
              toast.success("Mistake logged");
              setOpen(false);
              setWhat("");
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DoubtDialog({
  subjectId,
  topic,
  addDoubt,
}: {
  subjectId: string;
  topic: string;
  addDoubt: any;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" title="Add doubt">
          <HelpCircle className="size-3.5 text-saffron" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Doubt</DialogTitle>
          <DialogDescription>{topic}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your doubt..."
        />
        <DialogFooter>
          <Button
            onClick={() => {
              addDoubt({
                date: todayKey(),
                subjectId,
                topic,
                doubtText: text,
                priority: "medium",
                status: "unresolved",
              });
              toast.success("Doubt added");
              setOpen(false);
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

function BulkImportButton({
  subjectId,
  addChapter,
  importLectures,
}: {
  subjectId: string;
  addChapter: any;
  importLectures: any;
}) {
  const { state } = useStore();
  const chapters = state.chapters.filter((c) => c.subjectId === subjectId);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chapterId, setChapterId] = useState(chapters[0]?.id || "");
  const [newChapter, setNewChapter] = useState("");

  const parsed = parseImportText(text);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="size-3.5 mr-1" />
          Import Lectures
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Lectures</DialogTitle>
          <DialogDescription>
            Paste lines like: <code>Video 1: Title = 00:59:26</code> or{" "}
            <code>Lecture 2 - 1:10:39</code>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Target chapter</Label>
              <Select value={chapterId} onValueChange={setChapterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Or new chapter</Label>
              <div className="flex gap-2">
                <Input
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="Chapter title"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (newChapter.trim()) {
                      const id = addChapter(subjectId, newChapter.trim());
                      setChapterId(id);
                      setNewChapter("");
                      toast.success("Chapter created");
                    }
                  }}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
          <Textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your lecture list..."
          />
          {parsed.length > 0 && (
            <div className="max-h-40 overflow-auto scrollbar-thin border border-white/10 rounded-lg">
              <table className="w-full text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Title</th>
                    <th className="text-right p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((p, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">{p.title}</td>
                      <td className="p-2 text-right">{formatHuman(p.rawSeconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="text-xs text-muted-foreground">{parsed.length} lectures parsed</div>
        </div>
        <DialogFooter>
          <Button
            disabled={!chapterId || parsed.length === 0}
            onClick={() => {
              importLectures(subjectId, chapterId, parsed);
              toast.success(`${parsed.length} lectures imported`);
              setOpen(false);
              setText("");
            }}
          >
            Import {parsed.length}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function parseImportText(text: string): { title: string; rawSeconds: number }[] {
  const out: { title: string; rawSeconds: number }[] = [];
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines) {
    const m = line.match(/(.+?)\s*[=\-]\s*((?:\d+:)?\d+:\d+)\s*$/);
    if (m) {
      out.push({ title: m[1].trim(), rawSeconds: parseHMS(m[2]) });
    } else {
      const m2 = line.match(/((?:\d+:)?\d+:\d+)\s*$/);
      if (m2)
        out.push({
          title: line.replace(m2[0], "").trim() || `Lecture ${out.length + 1}`,
          rawSeconds: parseHMS(m2[1]),
        });
    }
  }
  return out;
}
