
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, Timer, Menu, X, RefreshCw } from 'lucide-react';
import Dashboard from './components/Dashboard';
import HabitTracker from './components/HabitTracker';
import Pomodoro from './components/Pomodoro';
import Sync from './components/Sync';
import { AppState, View, Task, Habit, ChecklistItem } from './types';
import { getTodayDateString } from './utils';

const STORAGE_KEY = 'ella_planner_data_v2';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      tasks: [],
      habits: [],
      dailyData: {}
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const ensureDailyData = (prev: AppState, date: string) => {
    if (!prev.dailyData[date]) {
      return {
        ...prev,
        dailyData: {
          ...prev.dailyData,
          [date]: { notes: '', checklist: [] }
        }
      };
    }
    return prev;
  };

  const importState = (newState: AppState) => {
    setState(newState);
    setActiveView('dashboard');
  };

  const addTask = (text: string, hour: number) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      hour,
      completed: false,
      date: selectedDate,
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const updateNotes = (text: string) => {
    setState(prev => {
      const s = ensureDailyData(prev, selectedDate);
      return {
        ...s,
        dailyData: {
          ...s.dailyData,
          [selectedDate]: { ...s.dailyData[selectedDate], notes: text }
        }
      };
    });
  };

  const addChecklistItem = (text: string) => {
    setState(prev => {
      const s = ensureDailyData(prev, selectedDate);
      const newItem: ChecklistItem = { id: crypto.randomUUID(), text, completed: false };
      return {
        ...s,
        dailyData: {
          ...s.dailyData,
          [selectedDate]: { ...s.dailyData[selectedDate], checklist: [...s.dailyData[selectedDate].checklist, newItem] }
        }
      };
    });
  };

  const toggleChecklistItem = (id: string) => {
    setState(prev => {
      const s = ensureDailyData(prev, selectedDate);
      return {
        ...s,
        dailyData: {
          ...s.dailyData,
          [selectedDate]: {
            ...s.dailyData[selectedDate],
            checklist: s.dailyData[selectedDate].checklist.map(item => 
              item.id === id ? { ...item, completed: !item.completed } : item
            )
          }
        }
      };
    });
  };

  const deleteChecklistItem = (id: string) => {
    setState(prev => {
      const s = ensureDailyData(prev, selectedDate);
      return {
        ...s,
        dailyData: {
          ...s.dailyData,
          [selectedDate]: {
            ...s.dailyData[selectedDate],
            checklist: s.dailyData[selectedDate].checklist.filter(item => item.id !== id)
          }
        }
      };
    });
  };

  const addHabit = (name: string) => {
    const newHabit: Habit = { id: crypto.randomUUID(), name, completions: [] };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  };

  const toggleHabitDate = (habitId: string, date: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id === habitId) {
          const exists = h.completions.includes(date);
          return {
            ...h,
            completions: exists ? h.completions.filter(d => d !== date) : [...h.completions, date]
          };
        }
        return h;
      })
    }));
  };

  const deleteHabit = (id: string) => {
    setState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== id) }));
  };

  const navItems = [
    { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'sync', label: 'Sync', icon: RefreshCw },
  ] as const;

  const currentDailyData = state.dailyData[selectedDate] || { notes: '', checklist: [] };

  return (
    <div className="flex h-screen bg-[#fff5f7] overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-sm border-r border-pink-100">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-pink-500 flex items-center gap-2">
            <CheckSquare className="w-8 h-8" />
            <span>Ella Planner</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveView(id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeView === id 
                  ? 'bg-pink-100 text-pink-600 font-bold shadow-sm' 
                  : 'text-pink-300 hover:bg-pink-50 hover:text-pink-500'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-pink-50">
          <h1 className="text-xl font-bold text-pink-500">Ella Planner</h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-pink-400">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-24 md:pb-0">
            {activeView === 'dashboard' && (
              <Dashboard 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                tasks={state.tasks.filter(t => t.date === selectedDate)}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                notes={currentDailyData.notes}
                onUpdateNotes={updateNotes}
                checklist={currentDailyData.checklist}
                onAddChecklistItem={addChecklistItem}
                onToggleChecklistItem={toggleChecklistItem}
                onDeleteChecklistItem={deleteChecklistItem}
              />
            )}
            {activeView === 'habits' && (
              <HabitTracker 
                habits={state.habits}
                onAddHabit={addHabit}
                onToggleDate={toggleHabitDate}
                onDeleteHabit={deleteHabit}
              />
            )}
            {activeView === 'focus' && <Pomodoro />}
            {activeView === 'sync' && (
              <Sync 
                state={state}
                onImport={importState}
              />
            )}
          </div>
        </div>

        {/* Bottom Nav Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-50 flex justify-around p-3 pb-6 z-50">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeView === id ? 'text-pink-500' : 'text-pink-200'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
