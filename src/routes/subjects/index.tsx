import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, useDerived } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/components/DynamicIcon";
import { ProgressRing } from "@/components/ProgressRing";
import { formatShort } from "@/lib/time";

export const Route = createFileRoute("/subjects/")({ component: SubjectsPage });

function SubjectsPage() {
  const { state } = useStore();
  const d = useDerived();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Subjects</h1>
        <p className="text-sm text-muted-foreground">The ten pillars of your GATE sadhana.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.subjects.map((s) => {
          const b = d.bySubject.get(s.id)!;
          const pct = b.rawSeconds > 0 ? (b.completedRawSeconds / b.rawSeconds) * 100 : 0;
          const practice = state.practice.filter((p) => p.subjectId === s.id);
          const correct = practice.reduce((a, p) => a + p.correct, 0);
          const total = practice.reduce((a, p) => a + p.questionsSolved, 0);
          const acc = total > 0 ? (correct / total) * 100 : 0;
          const pendingRev = state.revisions.filter((r) => r.subjectId === s.id && !r.done).length;
          const mistakes = state.mistakes.filter(
            (m) => m.subjectId === s.id && m.status === "open",
          ).length;
          return (
            <Link to="/subjects/$id" params={{ id: s.id }} key={s.id}>
              <Card className="glass p-5 hover:border-saffron/40 transition-all h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    <div
                      className="size-12 rounded-xl grid place-items-center"
                      style={{ background: `${s.themeColor}22`, color: s.themeColor }}
                    >
                      <DynamicIcon name={s.icon} className="size-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.shortName} · {s.expectedLectureCount} lectures
                      </div>
                    </div>
                  </div>
                  <ProgressRing value={pct} size={64} stroke={6} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Stat label="Lectures" value={`${b.completedLectures}/${b.lectureCount}`} />
                  <Stat
                    label="Duration"
                    value={`${formatShort(b.completedRawSeconds)}/${formatShort(b.rawSeconds)}`}
                  />
                  <Stat label="Accuracy" value={total > 0 ? `${acc.toFixed(0)}%` : "—"} />
                  <Stat label="Pending revisions" value={`${pendingRev}`} />
                </div>
                {mistakes > 0 && (
                  <Badge variant="destructive" className="mt-3 text-[10px]">
                    {mistakes} open mistakes
                  </Badge>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
