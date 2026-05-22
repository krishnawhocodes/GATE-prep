export type LectureStatus =
  | "not_started"
  | "watching"
  | "lecture_done"
  | "notes_done"
  | "practice_done"
  | "revised";

export interface Lecture {
  id: string;
  subjectId: string;
  chapterId: string;
  order: number;
  title: string;
  rawSeconds: number; // 0 if unknown
  sourceType?: "telegram" | "youtube" | "manual";
  sourceUrl?: string;
  status: LectureStatus;
  completedAt?: string;
  notesDone: boolean;
  practiceDone: boolean;
  revised: boolean;
  difficulty?: "easy" | "medium" | "hard";
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  expectedLectureCount?: number;
  expectedRawSeconds?: number;
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  icon: string; // lucide icon name
  themeColor: string; // tailwind class hex-ish accent
  expectedLectureCount: number;
  expectedRawSeconds: number;
}

export type TaskType =
  | "lecture"
  | "practice"
  | "revision"
  | "test"
  | "dsa"
  | "running"
  | "reading"
  | "custom";

export type TaskStatus = "pending" | "completed" | "backlog" | "skipped";

export interface DailyTask {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: TaskType;
  subjectId?: string;
  chapterId?: string;
  lectureId?: string;
  plannedSeconds: number;
  completed: boolean;
  completedAt?: string;
  priority: "low" | "medium" | "high";
  status: TaskStatus;
  notes?: string;
}

export interface StudySession {
  id: string;
  taskId?: string;
  subjectId?: string;
  lectureId?: string;
  type: TaskType;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  focusRating?: number;
  mood?: "low" | "medium" | "high";
  notes?: string;
}

export interface PracticeLog {
  id: string;
  date: string;
  subjectId: string;
  chapterId?: string;
  topic: string;
  source: "PYQ" | "DPP" | "test" | "custom";
  questionsSolved: number;
  correct: number;
  wrong: number;
  timeSpentSeconds: number;
  remarks?: string;
}

export interface Mistake {
  id: string;
  date: string;
  subjectId: string;
  chapterId?: string;
  topic: string;
  mistakeType:
    | "concept"
    | "formula"
    | "calculation"
    | "silly"
    | "misread"
    | "time-pressure"
    | "forgot-property";
  questionText?: string;
  whatWentWrong: string;
  correctLogic?: string;
  reattemptDate?: string;
  status: "open" | "revised" | "fixed";
  priority: "low" | "medium" | "high";
}

export interface Doubt {
  id: string;
  date: string;
  subjectId: string;
  topic: string;
  doubtText: string;
  priority: "low" | "medium" | "high";
  status: "unresolved" | "resolved";
  resolutionNote?: string;
}

export interface Resource {
  id: string;
  subjectId: string;
  title: string;
  type: "youtube" | "telegram" | "pdf" | "book" | "notes" | "test-series" | "other";
  url?: string;
  description?: string;
}

export interface DailyReflection {
  date: string;
  wentWell?: string;
  distractions?: string;
  topPriorityTomorrow?: string;
  focusRating?: number;
}

export interface RevisionItem {
  id: string;
  lectureId: string;
  subjectId: string;
  dueDate: string;
  interval: number; // 1, 3, 7, 15, 30
  done: boolean;
  doneAt?: string;
  notes?: string;
}

export interface DSATopic {
  id: string;
  name: string;
  conceptDone: boolean;
  notesDone: boolean;
  problemsSolved: number;
  pyqsDone: number;
  revised: boolean;
  difficulty?: "easy" | "medium" | "hard";
}

export interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  subjectIds: string[];
}

export interface Settings {
  targetDate: string;
  planningFactor: number;
  dailyStudyHourTarget: number;
  theme: "dark" | "light";
  showQuotes: boolean;
}

export interface AppState {
  subjects: Subject[];
  chapters: Chapter[];
  lectures: Lecture[];
  tasks: DailyTask[];
  sessions: StudySession[];
  practice: PracticeLog[];
  mistakes: Mistake[];
  doubts: Doubt[];
  resources: Resource[];
  reflections: DailyReflection[];
  revisions: RevisionItem[];
  dsaTopics: DSATopic[];
  phases: Phase[];
  settings: Settings;
}
