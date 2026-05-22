import type { AppState, Subject, Chapter, Lecture, Phase, DSATopic } from "./types";
import { parseHMS } from "./time";

let _id = 0;
const uid = (p: string) => `${p}_${++_id}_${Math.random().toString(36).slice(2, 7)}`;

interface SubjectSeed {
  name: string;
  shortName: string;
  icon: string;
  themeColor: string;
  expectedLectureCount: number;
  duration: string;
}

const SUBJECT_SEEDS: SubjectSeed[] = [
  {
    name: "Computer Networks",
    shortName: "CN",
    icon: "Network",
    themeColor: "#22d3a8",
    expectedLectureCount: 85,
    duration: "158:50:42",
  },
  {
    name: "Engineering Mathematics",
    shortName: "EM",
    icon: "Sigma",
    themeColor: "#fbbf24",
    expectedLectureCount: 60,
    duration: "147:10:31",
  },
  {
    name: "DBMS",
    shortName: "DBMS",
    icon: "Database",
    themeColor: "#60a5fa",
    expectedLectureCount: 42,
    duration: "96:50:44",
  },
  {
    name: "Digital Logic",
    shortName: "DL",
    icon: "CircuitBoard",
    themeColor: "#a78bfa",
    expectedLectureCount: 38,
    duration: "95:40:59",
  },
  {
    name: "Theory of Computation",
    shortName: "TOC",
    icon: "Infinity",
    themeColor: "#f472b6",
    expectedLectureCount: 37,
    duration: "85:48:52",
  },
  {
    name: "Discrete Mathematics",
    shortName: "DM",
    icon: "Calculator",
    themeColor: "#34d399",
    expectedLectureCount: 37,
    duration: "85:48:52",
  },
  {
    name: "COA",
    shortName: "COA",
    icon: "Cpu",
    themeColor: "#fb923c",
    expectedLectureCount: 70,
    duration: "66:40:34",
  },
  {
    name: "Operating System",
    shortName: "OS",
    icon: "MonitorCog",
    themeColor: "#f59e0b",
    expectedLectureCount: 62,
    duration: "52:39:47",
  },
  {
    name: "Compiler Design",
    shortName: "CD",
    icon: "Code2",
    themeColor: "#ef4444",
    expectedLectureCount: 18,
    duration: "41:28:34",
  },
  {
    name: "Algorithms",
    shortName: "DSA",
    icon: "GitBranch",
    themeColor: "#06b6d4",
    expectedLectureCount: 0,
    duration: "0:00:00",
  },
];

interface ChapterSeed {
  shortName: string; // subject short
  title: string;
  expectedLectureCount: number;
  duration: string;
  lectures?: { title: string; duration: string }[];
}

const CHAPTER_SEEDS: ChapterSeed[] = [
  // Computer Networks
  { shortName: "CN", title: "CH1 IPv4 Addressing", expectedLectureCount: 22, duration: "45:03:21" },
  { shortName: "CN", title: "CH2 Error Control", expectedLectureCount: 6, duration: "13:47:51" },
  { shortName: "CN", title: "CH3 Flow Control", expectedLectureCount: 10, duration: "24:01:16" },
  {
    shortName: "CN",
    title: "CH4 IPv4 Header & Fragmentation",
    expectedLectureCount: 8,
    duration: "16:18:13",
  },
  { shortName: "CN", title: "CH5 TCP & UDP", expectedLectureCount: 17, duration: "26:11:04" },
  {
    shortName: "CN",
    title: "CH6 Medium Access Control",
    expectedLectureCount: 7,
    duration: "12:12:11",
  },
  { shortName: "CN", title: "CH7 Routing Protocols", expectedLectureCount: 4, duration: "6:54:44" },
  { shortName: "CN", title: "CH8 Switching", expectedLectureCount: 3, duration: "3:47:55" },
  {
    shortName: "CN",
    title: "CH9 Application Layer Protocol",
    expectedLectureCount: 3,
    duration: "4:19:40",
  },
  {
    shortName: "CN",
    title: "CH10 Remaining chapter 10",
    expectedLectureCount: 3,
    duration: "4:05:30",
  },
  {
    shortName: "CN",
    title: "CH11 Remaining chapter 11",
    expectedLectureCount: 1,
    duration: "1:13:14",
  },
  {
    shortName: "CN",
    title: "CH12 Remaining chapter 12",
    expectedLectureCount: 1,
    duration: "0:55:43",
  },
  // DBMS
  {
    shortName: "DBMS",
    title: "CH1 FDs & Normalization",
    expectedLectureCount: 15,
    duration: "30:06:10",
  },
  {
    shortName: "DBMS",
    title: "CH2 Transaction & Concurrency Control",
    expectedLectureCount: 8,
    duration: "19:42:12",
  },
  { shortName: "DBMS", title: "CH3 ER Model", expectedLectureCount: 4, duration: "9:06:13" },
  { shortName: "DBMS", title: "CH4 Query Language", expectedLectureCount: 9, duration: "22:32:22" },
  {
    shortName: "DBMS",
    title: "CH5 File Organization & Indexing",
    expectedLectureCount: 6,
    duration: "15:23:47",
  },
  // TOC
  {
    shortName: "TOC",
    title: "CH1 Finite Automata",
    expectedLectureCount: 23,
    duration: "52:51:37",
    lectures: [
      { title: "Lecture 1", duration: "02:21:23" },
      { title: "Lecture 2", duration: "02:24:17" },
      { title: "Lecture 3", duration: "02:22:26" },
      { title: "Lecture 4", duration: "02:29:24" },
      { title: "Lecture 5", duration: "01:37:12" },
      { title: "Lecture 6", duration: "02:16:29" },
      { title: "Lecture 7", duration: "02:21:12" },
      { title: "Lecture 8", duration: "02:25:17" },
      { title: "Lecture 9", duration: "02:24:55" },
      { title: "Lecture 10", duration: "02:15:43" },
      { title: "Lecture 11", duration: "02:26:48" },
      { title: "Lecture 12", duration: "02:19:31" },
      { title: "Lecture 13", duration: "02:17:33" },
      { title: "Lecture 14", duration: "02:31:35" },
      { title: "Lecture 15", duration: "01:36:00" },
      { title: "Lecture 16", duration: "01:52:29" },
      { title: "Lecture 17", duration: "01:54:02" },
      { title: "Lecture 18", duration: "02:17:17" },
      { title: "Lecture 19", duration: "02:17:04" },
      { title: "Lecture 20", duration: "03:33:46" },
      { title: "Lecture 21", duration: "02:13:16" },
      { title: "Lecture 22", duration: "02:09:51" },
      { title: "Lecture 23", duration: "02:24:07" },
    ],
  },
  {
    shortName: "TOC",
    title: "CH2 Push Down Automata / CFL",
    expectedLectureCount: 8,
    duration: "18:46:09",
    lectures: [
      { title: "Lecture 1", duration: "02:12:29" },
      { title: "Lecture 2", duration: "02:15:51" },
      { title: "Lecture 3", duration: "02:43:10" },
      { title: "Lecture 4", duration: "02:29:58" },
      { title: "Lecture 5", duration: "02:27:43" },
      { title: "Lecture 6", duration: "02:13:08" },
      { title: "Lecture 7", duration: "02:09:14" },
      { title: "Lecture 8", duration: "02:14:36" },
    ],
  },
  {
    shortName: "TOC",
    title: "CH3 Turing Machine / Recursively Enumerable",
    expectedLectureCount: 3,
    duration: "6:25:19",
    lectures: [
      { title: "Lecture 1", duration: "02:17:37" },
      { title: "Lecture 2", duration: "01:47:31" },
      { title: "Lecture 3", duration: "02:20:11" },
    ],
  },
  {
    shortName: "TOC",
    title: "CH4 Decidability",
    expectedLectureCount: 3,
    duration: "7:45:47",
    lectures: [
      { title: "Lecture 1", duration: "02:19:57" },
      { title: "Lecture 2", duration: "02:27:01" },
      { title: "Lecture 3", duration: "02:58:49" },
    ],
  },
  // Compiler Design
  {
    shortName: "CD",
    title: "CH1 Lexical Analysis & Syntax Analysis",
    expectedLectureCount: 11,
    duration: "25:50:59",
  },
  {
    shortName: "CD",
    title: "CH2 Syntax Directed Translation",
    expectedLectureCount: 3,
    duration: "5:19:48",
  },
  {
    shortName: "CD",
    title: "CH3 Intermediate Code & Code Optimization",
    expectedLectureCount: 4,
    duration: "10:17:47",
  },
  // EM
  {
    shortName: "EM",
    title: "CH1 Permutation & Combination",
    expectedLectureCount: 5,
    duration: "11:28:46",
  },
  { shortName: "EM", title: "CH2 Probability", expectedLectureCount: 6, duration: "13:37:33" },
  { shortName: "EM", title: "CH3 Statistics-01", expectedLectureCount: 9, duration: "20:40:16" },
  { shortName: "EM", title: "CH4 Statistics-02", expectedLectureCount: 9, duration: "20:52:40" },
  { shortName: "EM", title: "CH5 Calculus", expectedLectureCount: 13, duration: "35:30:42" },
  { shortName: "EM", title: "CH6 Linear-01", expectedLectureCount: 13, duration: "33:04:23" },
  { shortName: "EM", title: "CH7 Linear-02", expectedLectureCount: 5, duration: "11:56:11" },
  // Digital Logic
  {
    shortName: "DL",
    title: "CH1",
    expectedLectureCount: 9,
    duration: "20:11:50",
    lectures: [
      { title: "Lecture 1", duration: "02:07:00" },
      { title: "Lecture 2", duration: "02:07:00" },
      { title: "Lecture 3", duration: "02:07:00" },
      { title: "Lecture 4", duration: "02:07:00" },
      { title: "Lecture 5", duration: "02:07:00" },
      { title: "Lecture 6", duration: "02:07:00" },
      { title: "Lecture 7", duration: "02:30:30" },
      { title: "Lecture 8", duration: "02:28:28" },
      { title: "Lecture 9", duration: "02:30:52" },
    ],
  },
  {
    shortName: "DL",
    title: "CH2",
    expectedLectureCount: 13,
    duration: "32:35:34",
    lectures: [
      { title: "Lecture 1", duration: "02:20:00" },
      { title: "Lecture 2", duration: "02:29:30" },
      { title: "Lecture 3", duration: "02:54:00" },
      { title: "Lecture 4", duration: "02:38:49" },
      { title: "Lecture 5", duration: "02:01:07" },
      { title: "Lecture 6", duration: "03:05:06" },
      { title: "Lecture 7", duration: "02:00:00" },
      { title: "Lecture 8", duration: "02:28:28" },
      { title: "Lecture 9", duration: "02:23:52" },
      { title: "Lecture 10", duration: "02:54:00" },
      { title: "Lecture 11", duration: "02:24:07" },
      { title: "Lecture 12", duration: "02:30:49" },
      { title: "Lecture 13", duration: "02:25:46" },
    ],
  },
  {
    shortName: "DL",
    title: "CH3",
    expectedLectureCount: 8,
    duration: "21:27:10",
    lectures: [
      { title: "Lecture 1", duration: "02:32:09" },
      { title: "Lecture 2", duration: "02:29:30" },
      { title: "Lecture 3", duration: "02:54:00" },
      { title: "Lecture 4", duration: "02:38:49" },
      { title: "Lecture 5", duration: "03:01:07" },
      { title: "Lecture 6", duration: "02:34:43" },
      { title: "Lecture 7", duration: "02:33:06" },
      { title: "Lecture 8", duration: "02:43:46" },
    ],
  },
  {
    shortName: "DL",
    title: "CH4",
    expectedLectureCount: 8,
    duration: "21:26:25",
    lectures: [
      { title: "Lecture 1", duration: "02:52:47" },
      { title: "Lecture 2", duration: "02:18:19" },
      { title: "Lecture 3", duration: "02:35:54" },
      { title: "Lecture 4", duration: "02:40:54" },
      { title: "Lecture 5", duration: "03:48:20" },
      { title: "Lecture 6", duration: "01:51:37" },
      { title: "Lecture 7", duration: "02:37:51" },
      { title: "Lecture 8", duration: "02:40:43" },
    ],
  },
];

// Operating System — exact 62 video seed
const OS_LECTURES: { title: string; duration: string }[] = [
  { title: "Introduction & Basics of OS", duration: "00:59:26" },
  { title: "Revise Operating System with Vishvadeep Gothi", duration: "00:00:51" },
  { title: "Types of Operating Systems", duration: "00:58:20" },
  { title: "Process Management: What is the Process?", duration: "00:58:51" },
  { title: "Process Management: Process State Transition Diagram", duration: "00:40:47" },
  { title: "Process Scheduling & Types of Schedulers", duration: "00:57:39" },
  { title: "CPU Scheduling: Scheduling Times and FCFS Algorithm", duration: "01:12:58" },
  { title: "CPU Scheduling: SJF & SRTF", duration: "00:57:52" },
  { title: "CPU Scheduling: SRRN and Priority Based Algorithms", duration: "01:05:47" },
  { title: "CPU Scheduling: Round Robin Algorithm", duration: "01:03:26" },
  { title: "Data Structure: Tree Revision", duration: "01:32:31" },
  { title: "DPP: Scheduling Algorithms", duration: "00:44:34" },
  { title: "CPU Scheduling: Multilevel Queue & Feedback Scheduling", duration: "00:47:31" },
  { title: "Threads & Multithreading", duration: "00:40:22" },
  { title: "Process Synchronization: Race Condition", duration: "00:44:48" },
  { title: "Process Synchronization: Solution for Critical Section Problem", duration: "01:16:01" },
  { title: "Synchronization Hardware: Test & Set, Swap", duration: "00:44:36" },
  { title: "Synchronization Tool: Semaphore", duration: "00:50:27" },
  { title: "Practice Questions on Semaphore", duration: "01:09:47" },
  { title: "Bounded Buffer: Classical Problems on Synchronization", duration: "00:36:46" },
  { title: "Classical Problems on Synchronization: Reader-Writer", duration: "00:39:15" },
  { title: "Classical Problems on Synchronization: Dining Philosopher", duration: "00:38:31" },
  { title: "Deadlock: Introduction", duration: "00:53:34" },
  { title: "Deadlock Prevention", duration: "00:45:07" },
  { title: "Deadlock Avoidance & Banker's Safety Algorithm", duration: "01:00:59" },
  { title: "Banker's Algorithm: Resource Allocation", duration: "01:01:06" },
  { title: "Questions on Deadlock", duration: "00:47:16" },
  { title: "Deadlock Detection & Recovery", duration: "00:55:25" },
  { title: "System Calls & Fork", duration: "00:46:31" },
  { title: "Memory Management: Contiguous Technique", duration: "01:09:18" },
  { title: "Paging: Introduction", duration: "00:52:51" },
  { title: "Paging: Address Translation", duration: "00:58:04" },
  { title: "Paging: Practice Questions", duration: "01:02:41" },
  { title: "Paging: Performance Improvement & TLB", duration: "00:43:53" },
  { title: "Paging: TLB Tags and Direct Mappings", duration: "01:01:26" },
  { title: "Paging: TLB Tags and Set Associative Mappings", duration: "00:39:09" },
  { title: "Multilevel Paging", duration: "00:44:55" },
  { title: "Segmentation", duration: "00:49:15" },
  { title: "Virtual Memory: Introduction", duration: "01:00:40" },
  { title: "Page Replacement Policies: FIFO, Optimal, LRU", duration: "01:05:58" },
  { title: "Page Replacement Policies: LFU, MFU", duration: "00:50:41" },
  { title: "Frame Allocation, Thrashing and Working Set", duration: "00:49:58" },
  { title: "Inverted Page Table, Hashed Page Table", duration: "00:44:05" },
  { title: "Segmented Paging", duration: "00:43:07" },
  { title: "Questions on Paging and Virtual Memory", duration: "00:43:24" },
  { title: "Introduction of File System", duration: "00:35:45" },
  { title: "File System: Disk Structure", duration: "00:58:45" },
  { title: "File System: Disk Formatting & Disk Blocks", duration: "00:39:36" },
  { title: "File System: File Allocation Methods", duration: "00:55:14" },
  { title: "Disk Scheduling", duration: "00:51:26" },
  { title: "All Homework Questions", duration: "00:49:56" },
  { title: "Parts of OS | Basics and Process Management", duration: "00:08:31" },
  { title: "File System: File Allocation Methods - Contiguous Allocation", duration: "00:13:27" },
  { title: "File System: File Allocation Methods - Linked Allocation", duration: "00:10:12" },
  { title: "File System: File Allocation Methods - Operating System", duration: "00:12:55" },
  { title: "Tree Revision Mini-Marathon Part 1", duration: "01:16:47" },
  { title: "Tree Revision Mini-Marathon Part 2", duration: "01:10:48" },
  { title: "GATE 2023 Special Surprise for Self Study Students", duration: "00:20:51" },
  { title: "Paging | OS Brahmastra Batch", duration: "01:01:53" },
  { title: "Paging-2 | OS Brahmastra Batch", duration: "01:18:27" },
  { title: "File System | OS Brahmastra Batch", duration: "01:04:08" },
  { title: "Disk Scheduling | OS Brahmastra Batch", duration: "01:20:37" },
];

const DSA_TOPICS = [
  "Arrays",
  "Strings",
  "Recursion",
  "Searching",
  "Sorting",
  "Linked List",
  "Stack",
  "Queue",
  "Trees",
  "BST",
  "Heap",
  "Hashing",
  "Graph BFS/DFS",
  "Shortest Path",
  "Greedy",
  "Dynamic Programming",
  "Backtracking",
  "Complexity Analysis",
];

export function buildSeed(): AppState {
  const subjects: Subject[] = SUBJECT_SEEDS.map((s) => ({
    id: `sub_${s.shortName}`,
    name: s.name,
    shortName: s.shortName,
    icon: s.icon,
    themeColor: s.themeColor,
    expectedLectureCount: s.expectedLectureCount,
    expectedRawSeconds: parseHMS(s.duration),
  }));

  const chapters: Chapter[] = [];
  const lectures: Lecture[] = [];

  // OS single "All Videos" chapter with exact lectures
  const osChId = `ch_OS_all`;
  chapters.push({
    id: osChId,
    subjectId: "sub_OS",
    title: "All Videos",
    order: 1,
    expectedLectureCount: 62,
    expectedRawSeconds: OS_LECTURES.reduce((a, l) => a + parseHMS(l.duration), 0),
  });
  OS_LECTURES.forEach((l, i) => {
    lectures.push({
      id: uid("lec"),
      subjectId: "sub_OS",
      chapterId: osChId,
      order: i + 1,
      title: `${i + 1}. ${l.title}`,
      rawSeconds: parseHMS(l.duration),
      status: "not_started",
      notesDone: false,
      practiceDone: false,
      revised: false,
    });
  });

  CHAPTER_SEEDS.forEach((c, idx) => {
    const subjectId = `sub_${c.shortName}`;
    const chId = uid("ch");
    chapters.push({
      id: chId,
      subjectId,
      title: c.title,
      order: idx + 1,
      expectedLectureCount: c.expectedLectureCount,
      expectedRawSeconds: parseHMS(c.duration),
    });
    if (c.lectures) {
      c.lectures.forEach((l, i) => {
        lectures.push({
          id: uid("lec"),
          subjectId,
          chapterId: chId,
          order: i + 1,
          title: `${i + 1}. ${l.title}`,
          rawSeconds: parseHMS(l.duration),
          status: "not_started",
          notesDone: false,
          practiceDone: false,
          revised: false,
        });
      });
    }
  });

  const phases: Phase[] = [
    {
      id: "phase_1",
      name: "OS + TOC Foundation Phase",
      startDate: "2026-05-07",
      endDate: "2026-06-05",
      subjectIds: ["sub_OS", "sub_TOC"],
    },
    {
      id: "phase_2",
      name: "DBMS + Compiler Design",
      startDate: "2026-06-06",
      endDate: "2026-07-10",
      subjectIds: ["sub_DBMS", "sub_CD"],
    },
    {
      id: "phase_3",
      name: "COA + Digital Logic",
      startDate: "2026-07-11",
      endDate: "2026-08-15",
      subjectIds: ["sub_COA", "sub_DL"],
    },
    {
      id: "phase_4",
      name: "CN + DM",
      startDate: "2026-08-16",
      endDate: "2026-09-20",
      subjectIds: ["sub_CN", "sub_DM"],
    },
    {
      id: "phase_5",
      name: "Engineering Mathematics",
      startDate: "2026-09-21",
      endDate: "2026-10-15",
      subjectIds: ["sub_EM"],
    },
    {
      id: "phase_6",
      name: "Final Revision + Tests",
      startDate: "2026-10-16",
      endDate: "2026-11-14",
      subjectIds: [],
    },
  ];

  const dsaTopics: DSATopic[] = DSA_TOPICS.map((t) => ({
    id: uid("dsa"),
    name: t,
    conceptDone: false,
    notesDone: false,
    problemsSolved: 0,
    pyqsDone: 0,
    revised: false,
  }));

  return {
    subjects,
    chapters,
    lectures,
    tasks: [],
    sessions: [],
    practice: [],
    mistakes: [],
    doubts: [],
    resources: [],
    reflections: [],
    revisions: [],
    dsaTopics,
    phases,
    settings: {
      targetDate: "2026-11-15",
      planningFactor: 0.85,
      dailyStudyHourTarget: 8,
      theme: "dark",
      showQuotes: true,
    },
  };
}

export function newId(p: string) {
  return uid(p);
}
