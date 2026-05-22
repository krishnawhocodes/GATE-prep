import { createFileRoute } from "@tanstack/react-router";
import { useStore, useDerived } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { addDaysKey, formatShort, todayKey, daysBetween } from "@/lib/time";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/analytics")({ component: AnalyticsPage });

const PALETTE = [
  "var(--saffron)",
  "var(--gold)",
  "var(--emerald-glow)",
  "#a78bfa",
  "#60a5fa",
  "#f472b6",
  "#34d399",
  "#fb923c",
  "#ef4444",
  "#06b6d4",
];

function AnalyticsPage() {
  const { state } = useStore();
  const d = useDerived();

  const last30 = useMemo(() => {
    const arr = [];
    for (let i = 29; i >= 0; i--) {
      const k = addDaysKey(todayKey(), -i);
      const sec = state.sessions
        .filter((s) => s.startTime.startsWith(k))
        .reduce((a, s) => a + s.durationSeconds, 0);
      arr.push({ date: k.slice(5), hours: +(sec / 3600).toFixed(2) });
    }
    return arr;
  }, [state.sessions]);

  const subjectProgress = useMemo(
    () =>
      state.subjects.map((s) => {
        const b = d.bySubject.get(s.id)!;
        return {
          name: s.shortName,
          pct: b.rawSeconds > 0 ? Math.round((b.completedRawSeconds / b.rawSeconds) * 100) : 0,
        };
      }),
    [state.subjects, d],
  );

  const typeDist = useMemo(() => {
    const m = new Map<string, number>();
    state.sessions.forEach((s) => m.set(s.type, (m.get(s.type) || 0) + s.durationSeconds));
    return Array.from(m.entries()).map(([name, v]) => ({ name, value: Math.round(v / 60) }));
  }, [state.sessions]);

  const daysLeft = daysBetween(todayKey(), state.settings.targetDate);
  const remainingPlanned = (d.totalRaw - d.completedRaw) * state.settings.planningFactor;
  const required = daysLeft > 0 ? remainingPlanned / 3600 / daysLeft : 0;
  const avgPace =
    last30.reduce((a, x) => a + x.hours, 0) /
    Math.max(1, last30.filter((x) => x.hours > 0).length || 1);
  const projectedDays = avgPace > 0 ? Math.ceil(remainingPlanned / 3600 / avgPace) : null;
  const projectedDate = projectedDays !== null ? addDaysKey(todayKey(), projectedDays) : "—";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Numbers do not lie — they motivate.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Required pace</div>
          <div className="text-2xl font-semibold">{required.toFixed(2)}h/day</div>
        </Card>
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Avg pace (30d)</div>
          <div className="text-2xl font-semibold">{avgPace.toFixed(2)}h/day</div>
        </Card>
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Projected finish</div>
          <div className="text-2xl font-semibold">{projectedDate}</div>
        </Card>
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Completed</div>
          <div className="text-2xl font-semibold">{formatShort(d.completedRaw)}</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass p-4">
          <div className="text-sm font-semibold mb-3">Daily study (30d)</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={last30}>
              <CartesianGrid stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,40,0.95)",
                  border: "1px solid #ffffff20",
                  borderRadius: 8,
                }}
              />
              <Line dataKey="hours" stroke="var(--saffron)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="glass p-4">
          <div className="text-sm font-semibold mb-3">Subject progress</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={subjectProgress}>
              <CartesianGrid stroke="#ffffff10" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,40,0.95)",
                  border: "1px solid #ffffff20",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="pct" fill="var(--emerald-glow)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="glass p-4 lg:col-span-2">
          <div className="text-sm font-semibold mb-3">Time distribution (minutes)</div>
          {typeDist.length === 0 ? (
            <div className="text-sm text-muted-foreground italic text-center py-6">
              No sessions yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={typeDist} dataKey="value" nameKey="name" outerRadius={90} label>
                  {typeDist.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
