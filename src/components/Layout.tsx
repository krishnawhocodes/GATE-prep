import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Timer,
  RotateCcw,
  Target,
  AlertCircle,
  HelpCircle,
  Calendar,
  BarChart3,
  GitBranch,
  FolderOpen,
  Layers,
  Database,
  Settings as SettingsIcon,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/planner", label: "Daily Planner", icon: CalendarDays },
  { to: "/timer", label: "Study Timer", icon: Timer },
  { to: "/revision", label: "Revision", icon: RotateCcw },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/mistakes", label: "Mistakes", icon: AlertCircle },
  { to: "/doubts", label: "Doubts", icon: HelpCircle },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/phases", label: "Phase Planner", icon: Layers },
  { to: "/dsa", label: "DSA", icon: GitBranch },
  { to: "/resources", label: "Resources", icon: FolderOpen },
  { to: "/data", label: "Data Manager", icon: Database },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [openMobile, setOpenMobile] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
        <div className="size-10 rounded-xl bg-gradient-to-br from-[--saffron] via-[--gold] to-[--emerald-glow] grid place-items-center glow-ring">
          <Sparkles className="size-5 text-[oklch(0.15_0.04_280)]" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">GATE Mission</div>
          <div className="text-xs text-muted-foreground">Sadhana · Focus · Victory</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const active = path === item.to || (item.to !== "/" && path.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpenMobile(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border border-white/10"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className={cn("size-4", active && "text-saffron")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-[10px] text-muted-foreground border-t border-sidebar-border">
        Target: 15 Nov 2026 · IST
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-sidebar border-r border-sidebar-border">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {openMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpenMobile(false)} />
          <aside className="relative w-72 bg-sidebar border-r border-sidebar-border">
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 glass-strong border-b border-white/10 px-4 lg:px-8 py-3 flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() => setOpenMobile((o) => !o)}
          >
            {openMobile ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="text-sm text-muted-foreground hidden sm:block">
            ॐ · Today's sadhana awaits
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/timer"
              className="px-3 py-1.5 rounded-lg bg-saffron text-[oklch(0.15_0.04_280)] text-xs font-medium hover:opacity-90"
            >
              <Timer className="size-3.5 inline mr-1" /> Quick Timer
            </Link>
          </div>
        </header>
        <div className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-10 max-w-[1400px] w-full mx-auto">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-white/10 px-2 py-1.5 flex justify-around">
          {[NAV[0], NAV[1], NAV[2], NAV[3], NAV[9]].map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px]",
                  active ? "text-saffron" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
