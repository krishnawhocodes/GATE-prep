import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import type {
  AppState,
  DailyTask,
  StudySession,
  PracticeLog,
  Mistake,
  Doubt,
  Resource,
  Lecture,
  RevisionItem,
  DSATopic,
  Phase,
  Settings,
  DailyReflection,
  Chapter,
  LectureStatus,
} from "./types";
import { buildSeed, newId } from "./seed";
import { addDaysKey, todayKey } from "./time";
import {
  isFirebaseConfigured,
  loadCloudState,
  saveCloudState,
  signInWithGoogle,
  signOutFromFirebase,
  subscribeToCloudAuth,
  type CloudUser,
} from "./firebase";

const STORAGE_KEY = "gate-mission-control:v1";

function loadInitial(): AppState {
  if (typeof window === "undefined") return buildSeed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeed();
    const parsed = JSON.parse(raw) as AppState;
    // Ensure new fields exist
    const seed = buildSeed();
    return {
      ...seed,
      ...parsed,
      settings: { ...seed.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return buildSeed();
  }
}

type CloudStatus = "disabled" | "signed_out" | "loading" | "syncing" | "synced" | "error";

interface CloudApi {
  enabled: boolean;
  user: CloudUser | null;
  status: CloudStatus;
  message?: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

interface StoreApi {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  cloud: CloudApi;
  // tasks
  addTask: (t: Omit<DailyTask, "id" | "completed" | "status" | "completedAt">) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  moveToBacklog: (id: string) => void;
  rescheduleBacklog: (days?: number) => void;
  rolloverYesterday: () => void;
  // lectures
  setLectureStatus: (id: string, status: LectureStatus) => void;
  toggleLectureFlag: (id: string, flag: "notesDone" | "practiceDone" | "revised") => void;
  // sessions
  addSession: (s: Omit<StudySession, "id">) => string;
  // practice/mistakes/doubts/resources
  addPractice: (p: Omit<PracticeLog, "id">) => void;
  addMistake: (m: Omit<Mistake, "id">) => void;
  updateMistake: (id: string, patch: Partial<Mistake>) => void;
  addDoubt: (d: Omit<Doubt, "id">) => void;
  updateDoubt: (id: string, patch: Partial<Doubt>) => void;
  addResource: (r: Omit<Resource, "id">) => void;
  removeResource: (id: string) => void;
  // revisions
  toggleRevision: (id: string) => void;
  // dsa
  updateDSA: (id: string, patch: Partial<DSATopic>) => void;
  // phases
  upsertPhase: (p: Phase) => void;
  removePhase: (id: string) => void;
  // reflection
  setReflection: (r: DailyReflection) => void;
  // chapters/lectures bulk import
  addChapter: (subjectId: string, title: string) => string;
  importLectures: (
    subjectId: string,
    chapterId: string,
    items: { title: string; rawSeconds: number }[],
  ) => void;
  // settings
  updateSettings: (patch: Partial<Settings>) => void;
  // data
  exportJSON: () => string;
  importJSON: (json: string) => void;
  resetAll: () => void;
}

const Ctx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadInitial());
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>(
    isFirebaseConfigured ? "signed_out" : "disabled",
  );
  const [cloudMessage, setCloudMessage] = useState<string | undefined>(undefined);
  const cloudReadyRef = useRef(false);
  const latestStateRef = useRef(state);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(state.settings.theme === "light" ? "light" : "dark");
  }, [state.settings.theme]);

  // Optional Firebase cloud sync. The app remains fully usable offline/localStorage-only.
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToCloudAuth(async (user) => {
      setCloudUser(user);
      cloudReadyRef.current = false;
      if (!user) {
        setCloudStatus("signed_out");
        setCloudMessage(undefined);
        return;
      }
      try {
        setCloudStatus("loading");
        setCloudMessage("Loading cloud backup...");
        const remote = await loadCloudState(user.uid);
        if (remote) {
          const seed = buildSeed();
          setState({
            ...seed,
            ...remote,
            settings: { ...seed.settings, ...(remote.settings || {}) },
          });
          setCloudMessage("Cloud backup loaded");
        } else {
          await saveCloudState(user.uid, latestStateRef.current);
          setCloudMessage("Cloud backup created");
        }
        cloudReadyRef.current = true;
        setCloudStatus("synced");
      } catch (error) {
        console.error(error);
        setCloudStatus("error");
        setCloudMessage(error instanceof Error ? error.message : "Cloud sync failed");
      }
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !cloudUser || !cloudReadyRef.current) return;
    setCloudStatus("syncing");
    const handle = window.setTimeout(async () => {
      try {
        await saveCloudState(cloudUser.uid, state);
        setCloudStatus("synced");
        setCloudMessage(`Last synced ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error(error);
        setCloudStatus("error");
        setCloudMessage(error instanceof Error ? error.message : "Cloud save failed");
      }
    }, 1200);
    return () => window.clearTimeout(handle);
  }, [state, cloudUser]);

  const generateRevisions = useCallback(
    (lectureId: string, subjectId: string, baseDate: string): RevisionItem[] => {
      const intervals = [1, 3, 7, 15, 30];
      return intervals.map((iv) => ({
        id: newId("rev"),
        lectureId,
        subjectId,
        dueDate: addDaysKey(baseDate, iv),
        interval: iv,
        done: false,
      }));
    },
    [],
  );

  const setLectureStatus = useCallback(
    (id: string, status: LectureStatus) => {
      setState((s) => {
        const lec = s.lectures.find((l) => l.id === id);
        if (!lec) return s;
        const wasDone = lec.status !== "not_started" && lec.status !== "watching";
        const isDone = status !== "not_started" && status !== "watching";
        const today = todayKey();
        const updated: Lecture = {
          ...lec,
          status,
          completedAt: isDone ? lec.completedAt || new Date().toISOString() : undefined,
          notesDone:
            status === "notes_done" ||
            status === "practice_done" ||
            status === "revised" ||
            lec.notesDone,
          practiceDone: status === "practice_done" || status === "revised" || lec.practiceDone,
          revised: status === "revised" || lec.revised,
        };
        let revisions = s.revisions;
        if (!wasDone && isDone) {
          const existing = s.revisions.some((r) => r.lectureId === id);
          if (!existing)
            revisions = [...s.revisions, ...generateRevisions(id, lec.subjectId, today)];
        }
        // sync linked task if any
        const tasks = s.tasks.map((t) =>
          t.lectureId === id && isDone && !t.completed
            ? {
                ...t,
                completed: true,
                completedAt: new Date().toISOString(),
                status: "completed" as const,
              }
            : t,
        );
        return {
          ...s,
          lectures: s.lectures.map((l) => (l.id === id ? updated : l)),
          revisions,
          tasks,
        };
      });
    },
    [generateRevisions],
  );

  const cloud: CloudApi = useMemo(
    () => ({
      enabled: isFirebaseConfigured,
      user: cloudUser,
      status: cloudStatus,
      message: cloudMessage,
      signIn: async () => {
        if (!isFirebaseConfigured)
          throw new Error("Firebase is not configured. Add VITE_FIREBASE_* env vars.");
        setCloudStatus("loading");
        setCloudMessage("Opening Google sign-in...");
        await signInWithGoogle();
      },
      signOut: async () => {
        await signOutFromFirebase();
        setCloudUser(null);
        cloudReadyRef.current = false;
        setCloudStatus(isFirebaseConfigured ? "signed_out" : "disabled");
        setCloudMessage(undefined);
      },
      syncNow: async () => {
        if (!cloudUser) throw new Error("Sign in first");
        setCloudStatus("syncing");
        await saveCloudState(cloudUser.uid, latestStateRef.current);
        setCloudStatus("synced");
        setCloudMessage(`Last synced ${new Date().toLocaleTimeString()}`);
      },
    }),
    [cloudUser, cloudStatus, cloudMessage],
  );

  const api: StoreApi = useMemo(
    () => ({
      state,
      setState,
      cloud,

      addTask: (t) =>
        setState((s) => ({
          ...s,
          tasks: [...s.tasks, { ...t, id: newId("task"), completed: false, status: "pending" }],
        })),

      toggleTask: (id) =>
        setState((s) => {
          const t = s.tasks.find((x) => x.id === id);
          if (!t) return s;
          const completed = !t.completed;
          const updated: DailyTask = {
            ...t,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
            status: completed ? "completed" : "pending",
          };
          // Sync linked lecture
          let lectures = s.lectures;
          let revisions = s.revisions;
          if (t.lectureId) {
            const lec = s.lectures.find((l) => l.id === t.lectureId);
            if (lec) {
              if (completed && lec.status === "not_started") {
                const newStatus: LectureStatus = t.type === "revision" ? "revised" : "lecture_done";
                lectures = s.lectures.map((l) =>
                  l.id === lec.id
                    ? {
                        ...l,
                        status: newStatus,
                        completedAt: new Date().toISOString(),
                        revised: newStatus === "revised" || l.revised,
                      }
                    : l,
                );
                if (newStatus === "lecture_done") {
                  const existing = s.revisions.some((r) => r.lectureId === lec.id);
                  if (!existing)
                    revisions = [
                      ...s.revisions,
                      ...generateRevisions(lec.id, lec.subjectId, todayKey()),
                    ];
                }
              }
            }
          }
          return {
            ...s,
            tasks: s.tasks.map((x) => (x.id === id ? updated : x)),
            lectures,
            revisions,
          };
        }),

      removeTask: (id) => setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),

      moveToBacklog: (id) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: "backlog" } : t)),
        })),

      rescheduleBacklog: (days = 5) =>
        setState((s) => {
          const backlog = s.tasks.filter((t) => t.status === "backlog" && !t.completed);
          if (backlog.length === 0) return s;
          const today = todayKey();
          const tasks = s.tasks.map((t) => {
            if (t.status !== "backlog" || t.completed) return t;
            const idx = backlog.indexOf(t);
            const day = idx % days;
            return { ...t, date: addDaysKey(today, day), status: "pending" as const };
          });
          return { ...s, tasks };
        }),

      rolloverYesterday: () =>
        setState((s) => {
          const today = todayKey();
          const yest = addDaysKey(today, -1);
          const tasks = s.tasks.map((t) => {
            if (t.date === yest && !t.completed && t.status === "pending") {
              return { ...t, status: "backlog" as const };
            }
            return t;
          });
          return { ...s, tasks };
        }),

      setLectureStatus,

      toggleLectureFlag: (id, flag) =>
        setState((s) => ({
          ...s,
          lectures: s.lectures.map((l) => (l.id === id ? { ...l, [flag]: !l[flag] } : l)),
        })),

      addSession: (sess) => {
        const id = newId("sess");
        setState((s) => ({ ...s, sessions: [...s.sessions, { ...sess, id }] }));
        return id;
      },

      addPractice: (p) =>
        setState((s) => ({ ...s, practice: [...s.practice, { ...p, id: newId("pr") }] })),
      addMistake: (m) =>
        setState((s) => ({ ...s, mistakes: [...s.mistakes, { ...m, id: newId("mi") }] })),
      updateMistake: (id, patch) =>
        setState((s) => ({
          ...s,
          mistakes: s.mistakes.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      addDoubt: (d) =>
        setState((s) => ({ ...s, doubts: [...s.doubts, { ...d, id: newId("dt") }] })),
      updateDoubt: (id, patch) =>
        setState((s) => ({
          ...s,
          doubts: s.doubts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      addResource: (r) =>
        setState((s) => ({ ...s, resources: [...s.resources, { ...r, id: newId("res") }] })),
      removeResource: (id) =>
        setState((s) => ({ ...s, resources: s.resources.filter((r) => r.id !== id) })),

      toggleRevision: (id) =>
        setState((s) => ({
          ...s,
          revisions: s.revisions.map((r) =>
            r.id === id
              ? { ...r, done: !r.done, doneAt: !r.done ? new Date().toISOString() : undefined }
              : r,
          ),
        })),

      updateDSA: (id, patch) =>
        setState((s) => ({
          ...s,
          dsaTopics: s.dsaTopics.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),

      upsertPhase: (p) =>
        setState((s) => {
          const exists = s.phases.some((x) => x.id === p.id);
          return {
            ...s,
            phases: exists ? s.phases.map((x) => (x.id === p.id ? p : x)) : [...s.phases, p],
          };
        }),

      removePhase: (id) => setState((s) => ({ ...s, phases: s.phases.filter((p) => p.id !== id) })),

      setReflection: (r) =>
        setState((s) => {
          const others = s.reflections.filter((x) => x.date !== r.date);
          return { ...s, reflections: [...others, r] };
        }),

      addChapter: (subjectId, title) => {
        const id = newId("ch");
        setState((s) => ({
          ...s,
          chapters: [
            ...s.chapters,
            {
              id,
              subjectId,
              title,
              order: s.chapters.filter((c) => c.subjectId === subjectId).length + 1,
            },
          ],
        }));
        return id;
      },

      importLectures: (subjectId, chapterId, items) =>
        setState((s) => {
          const existingCount = s.lectures.filter((l) => l.chapterId === chapterId).length;
          const newLecs: Lecture[] = items.map((it, i) => ({
            id: newId("lec"),
            subjectId,
            chapterId,
            order: existingCount + i + 1,
            title: it.title || `Lecture ${existingCount + i + 1}`,
            rawSeconds: it.rawSeconds,
            status: "not_started",
            notesDone: false,
            practiceDone: false,
            revised: false,
          }));
          return { ...s, lectures: [...s.lectures, ...newLecs] };
        }),

      updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),

      exportJSON: () => JSON.stringify(state, null, 2),
      importJSON: (json) => {
        try {
          const data = JSON.parse(json) as AppState;
          const seed = buildSeed();
          setState({ ...seed, ...data, settings: { ...seed.settings, ...(data.settings || {}) } });
        } catch (e) {
          throw e;
        }
      },
      resetAll: () => setState(buildSeed()),
    }),
    [state, cloud, generateRevisions, setLectureStatus],
  );

  // Daily rollover on mount
  useEffect(() => {
    api.rolloverYesterday();
  }, []);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
}

// Derived selectors
export function getPlannedSeconds(rawSeconds: number, factor: number) {
  return Math.round(rawSeconds * factor);
}

export function useDerived() {
  const { state } = useStore();
  const f = state.settings.planningFactor;
  return useMemo(() => {
    const bySubject = new Map<
      string,
      {
        lectureCount: number;
        rawSeconds: number;
        completedLectures: number;
        completedRawSeconds: number;
        plannedSeconds: number;
        completedPlannedSeconds: number;
      }
    >();
    for (const sub of state.subjects) {
      bySubject.set(sub.id, {
        lectureCount: sub.expectedLectureCount,
        rawSeconds: sub.expectedRawSeconds,
        completedLectures: 0,
        completedRawSeconds: 0,
        plannedSeconds: Math.round(sub.expectedRawSeconds * f),
        completedPlannedSeconds: 0,
      });
    }
    for (const lec of state.lectures) {
      const b = bySubject.get(lec.subjectId);
      if (!b) continue;
      const done = lec.status !== "not_started" && lec.status !== "watching";
      if (done) {
        b.completedLectures += 1;
        b.completedRawSeconds += lec.rawSeconds;
        b.completedPlannedSeconds += Math.round(lec.rawSeconds * f);
      }
    }
    const totalRaw = state.subjects.reduce((a, s) => a + s.expectedRawSeconds, 0);
    const totalLectures = state.subjects.reduce((a, s) => a + s.expectedLectureCount, 0);
    let completedRaw = 0,
      completedLectures = 0;
    bySubject.forEach((b) => {
      completedRaw += b.completedRawSeconds;
      completedLectures += b.completedLectures;
    });
    const overallPercent = totalRaw > 0 ? Math.min(100, (completedRaw / totalRaw) * 100) : 0;

    return {
      bySubject,
      totalRaw,
      totalLectures,
      completedRaw,
      completedLectures,
      overallPercent,
      factor: f,
    };
  }, [state, f]);
}
