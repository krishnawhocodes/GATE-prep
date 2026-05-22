import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dsa")({ component: DSAPage });

function DSAPage() {
  const { state, updateDSA } = useStore();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">DSA / Algorithms</h1>
        <p className="text-sm text-muted-foreground">
          Daily evening sadhana — one topic at a time.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {state.dsaTopics.map((t) => (
          <Card key={t.id} className="glass p-4">
            <div className="font-semibold mb-3">{t.name}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={t.conceptDone}
                  onCheckedChange={(v) => updateDSA(t.id, { conceptDone: !!v })}
                />
                Concept
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={t.notesDone}
                  onCheckedChange={(v) => updateDSA(t.id, { notesDone: !!v })}
                />
                Notes
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={t.revised}
                  onCheckedChange={(v) => updateDSA(t.id, { revised: !!v })}
                />
                Revised
              </label>
              <div />
              <div>
                <div className="text-muted-foreground">Problems</div>
                <Input
                  type="number"
                  value={t.problemsSolved}
                  onChange={(e) =>
                    updateDSA(t.id, { problemsSolved: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <div className="text-muted-foreground">PYQs</div>
                <Input
                  type="number"
                  value={t.pyqsDone}
                  onChange={(e) => updateDSA(t.id, { pyqsDone: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
