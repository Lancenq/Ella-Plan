
export interface Task {
  id: string;
  text: string;
  hour: number; // 0-23
  completed: boolean;
  date: string; // YYYY-MM-DD
  imageUrl?: string; // Base64 image string
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

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
  syncId?: string; // Shared ID for cloud sync
}

export type View = 'dashboard' | 'habits' | 'focus' | 'sync';
