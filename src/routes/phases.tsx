import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { daysBetween, todayKey } from "@/lib/time";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useDerived } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/phases")({ component: PhasesPage });

function PhasesPage() {
  const { state, upsertPhase, removePhase } = useStore();
  const d = useDerived();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Phase Planner</h1>
          <p className="text-sm text-muted-foreground">
            From foundation to victory — phase by phase.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            upsertPhase({
              id: `phase_${Date.now()}`,
              name: "New Phase",
              startDate: todayKey(),
              endDate: todayKey(),
              subjectIds: [],
            })
          }
        >
          <Plus className="size-3.5 mr-1" />
          Add phase
        </Button>
      </header>
      {state.phases.map((p) => {
        const days = Math.max(1, daysBetween(p.startDate, p.endDate));
        const phaseRaw = p.subjectIds.reduce(
          (a, sid) => a + (state.subjects.find((s) => s.id === sid)?.expectedRawSeconds || 0),
          0,
        );
        const phaseDone = p.subjectIds.reduce(
          (a, sid) => a + (d.bySubject.get(sid)?.completedRawSeconds || 0),
          0,
        );
        const pct = phaseRaw > 0 ? (phaseDone / phaseRaw) * 100 : 0;
        return (
          <Card key={p.id} className="glass p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input
                  className="text-base font-semibold mb-2"
                  value={p.name}
                  onChange={(e) => upsertPhase({ ...p, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start</Label>
                    <Input
                      type="date"
                      value={p.startDate}
                      onChange={(e) => upsertPhase({ ...p, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End</Label>
                    <Input
                      type="date"
                      value={p.endDate}
                      onChange={(e) => upsertPhase({ ...p, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {state.subjects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        const ids = p.subjectIds.includes(s.id)
                          ? p.subjectIds.filter((x) => x !== s.id)
                          : [...p.subjectIds, s.id];
                        upsertPhase({ ...p, subjectIds: ids });
                      }}
                      className={`text-xs px-2 py-1 rounded border ${p.subjectIds.includes(s.id) ? "bg-saffron text-[oklch(0.15_0.04_280)] border-saffron" : "border-white/10 text-muted-foreground"}`}
                    >
                      {s.shortName}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="outline">{days} days</Badge>
                <div className="text-2xl font-semibold">{Math.round(pct)}%</div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    removePhase(p.id);
                    toast.success("Phase removed");
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[--saffron] to-[--emerald-glow]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
