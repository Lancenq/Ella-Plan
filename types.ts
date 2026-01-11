
export interface Task {
  id: string;
  text: string;
  hour: number; // 0-23
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Added JournalEntry to fix import error in components/Journal.tsx
export interface JournalEntry {
  text: string;
  mood: number | null;
  gratitude: string[];
}

export interface DailyData {
  notes: string;
  checklist: ChecklistItem[];
}

export interface Habit {
  id: string;
  name: string;
  completions: string[]; // Array of YYYY-MM-DD
}

export interface AppState {
  tasks: Task[];
  habits: Habit[];
  dailyData: Record<string, DailyData>; // Keyed by YYYY-MM-DD
}

export type View = 'dashboard' | 'habits' | 'focus';
