import { createContext, useContext, useState, ReactNode } from "react";

export type TaskType = "simple" | "complex" | "longterm";

export interface SubTask {
  id: string;
  name: string;
  done: boolean;
}

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  priority?: 1 | 2 | 3 | 4;
  deadline?: string;
  subtasks?: SubTask[];
  estimatedStudyTime?: string; // "HH:MM" — for longterm tasks only
  difficulty?: 1 | 2 | 3;     // 1 = Easy, 2 = Medium, 3 = Hard
  done: boolean;
  quadrant: 1 | 2 | 3 | 4;
}

export interface SleepData {
  sleepTime: string;
  wakeTime: string;
  debtHours: number;
}

export interface SessionStats {
  tasksCompleted: number;
  totalTasks: number;
  focusMinutes: number;
}

interface AppContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  sleepData: SleepData;
  setSleepData: React.Dispatch<React.SetStateAction<SleepData>>;
  currentTask: Task | null;
  setCurrentTask: React.Dispatch<React.SetStateAction<Task | null>>;
  sessionStats: SessionStats;
  setSessionStats: React.Dispatch<React.SetStateAction<SessionStats>>;
  iCalUploaded: boolean;
  setICalUploaded: React.Dispatch<React.SetStateAction<boolean>>;
  smartwatchConnected: boolean;
  setSmartWatchConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

const DEFAULT_TASKS: Task[] = [
  // Earliest deadline is 3 days from now (06/05/2026) -> These should be dynamically categorized as Urgent (Q1 & Q3)
  { id: "t1", name: "Ôn thi cuối kỳ môn Giải tích", type: "complex", priority: 1, deadline: "06/05/2026 14:00", done: false, quadrant: 1, subtasks: [{ id: "s1", name: "Đọc lại lý thuyết", done: true }, { id: "s2", name: "Giải đề cương", done: false }] },
  { id: "t2", name: "Nộp bài tập lớn Mạng máy tính", type: "complex", priority: 1, deadline: "06/05/2026 23:59", done: false, quadrant: 1 },
  { id: "t5", name: "Đăng ký tín chỉ học kỳ 2", type: "simple", priority: 3, deadline: "06/05/2026 09:00", done: false, quadrant: 3 },
  { id: "t6", name: "Trả lời tin nhắn nhóm CLB Truyền thông", type: "simple", priority: 3, deadline: "06/05/2026 18:00", done: false, quadrant: 3 },
  
  // Further deadlines -> These will be Not Urgent (Q2 & Q4)
  { id: "t3", name: "Làm Đồ án môn Chuyên ngành", type: "complex", priority: 2, deadline: "15/05/2026", done: false, quadrant: 2, subtasks: [{ id: "s3", name: "Tìm hiểu tài liệu", done: false }, { id: "s4", name: "Viết code", done: false }] },
  { id: "t4", name: "Học từ vựng TOEIC", type: "longterm", priority: 2, estimatedStudyTime: "10:00", deadline: "20/05/2026", done: false, quadrant: 2 },
  { id: "t7", name: "Dọn dẹp lại thư mục Google Drive", type: "simple", priority: 4, done: false, quadrant: 4 },
  { id: "t8", name: "Lọc và xóa email rác", type: "simple", priority: 4, done: false, quadrant: 4 },
];

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [sleepData, setSleepData] = useState<SleepData>({ sleepTime: "23:30", wakeTime: "06:30", debtHours: 2.5 });
  const [currentTask, setCurrentTask] = useState<Task | null>(DEFAULT_TASKS[0]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({ tasksCompleted: 5, totalTasks: 9, focusMinutes: 252 });
  const [iCalUploaded, setICalUploaded] = useState(false);
  const [smartwatchConnected, setSmartWatchConnected] = useState(false);

  return (
    <AppContext.Provider value={{ tasks, setTasks, sleepData, setSleepData, currentTask, setCurrentTask, sessionStats, setSessionStats, iCalUploaded, setICalUploaded, smartwatchConnected, setSmartWatchConnected }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}