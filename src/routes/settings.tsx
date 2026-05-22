import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Cloud, LogIn, LogOut, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { state, updateSettings, cloud } = useStore();
  const s = state.settings;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Tune your sadhana.</p>
      </header>
      <Card className="glass p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-semibold flex items-center gap-2">
              <Cloud className="size-4 text-emerald-glow" />
              Cloud Sync
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {cloud.enabled
                ? cloud.user
                  ? `Signed in as ${cloud.user.displayName || cloud.user.email || "Google user"}`
                  : "Firebase is configured. Sign in to sync your tracker across devices."
                : "Firebase is not configured yet. The app will still save locally on this browser."}
            </div>
            {cloud.message && (
              <div className="text-xs text-muted-foreground mt-1">
                {cloud.status}: {cloud.message}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!cloud.user ? (
              <button
                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
                disabled={!cloud.enabled || cloud.status === "loading"}
                onClick={() =>
                  cloud.signIn().catch((e) => toast.error(e.message || "Sign-in failed"))
                }
              >
                <LogIn className="size-4 mr-2" />
                Sign in
              </button>
            ) : (
              <>
                <button
                  className="inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
                  disabled={cloud.status === "syncing"}
                  onClick={() =>
                    cloud
                      .syncNow()
                      .then(() => toast.success("Synced"))
                      .catch((e) => toast.error(e.message || "Sync failed"))
                  }
                >
                  <RefreshCw className="size-4 mr-2" />
                  Sync now
                </button>
                <button
                  className="inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                  onClick={() =>
                    cloud.signOut().catch((e) => toast.error(e.message || "Sign-out failed"))
                  }
                >
                  <LogOut className="size-4 mr-2" />
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </Card>
      <Card className="glass p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Target date</Label>
            <Input
              type="date"
              value={s.targetDate}
              onChange={(e) => updateSettings({ targetDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Planning speed factor</Label>
            <Input
              type="number"
              step="0.01"
              min="0.5"
              max="1.5"
              value={s.planningFactor}
              onChange={(e) =>
                updateSettings({ planningFactor: parseFloat(e.target.value) || 0.85 })
              }
            />
            <div className="text-xs text-muted-foreground mt-1">
              Planned = raw × factor (default 0.85 for 1.25× + skip + notes)
            </div>
          </div>
          <div>
            <Label>Daily study target (hours)</Label>
            <Input
              type="number"
              value={s.dailyStudyHourTarget}
              onChange={(e) =>
                updateSettings({ dailyStudyHourTarget: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <Label>Theme</Label>
            <Select
              value={s.theme}
              onValueChange={(v) => updateSettings({ theme: v as "dark" | "light" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Cosmic Dark</SelectItem>
                <SelectItem value="light">Calm Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={s.showQuotes}
            onCheckedChange={(v) => updateSettings({ showQuotes: v })}
          />
          <Label>Show spiritual quotes</Label>
        </div>
      </Card>
    </div>
  );
}
