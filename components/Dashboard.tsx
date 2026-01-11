
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ListTodo, FileText, ChevronRight, Search, Filter, SortAsc } from 'lucide-react';
import { Task, ChecklistItem } from '../types';

interface DashboardProps {
  tasks: Task[];
  onAddTask: (text: string, hour: number) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  notes: string;
  onUpdateNotes: (text: string) => void;
  checklist: ChecklistItem[];
  onAddChecklistItem: (text: string) => void;
  onToggleChecklistItem: (id: string) => void;
  onDeleteChecklistItem: (id: string) => void;
}

type StatusFilter = 'all' | 'completed' | 'pending';
type SortOption = 'none' | 'text' | 'status';

const Dashboard: React.FC<DashboardProps> = ({ 
  tasks, onAddTask, onToggleTask, onDeleteTask,
  notes, onUpdateNotes,
  checklist, onAddChecklistItem, onToggleChecklistItem, onDeleteChecklistItem
}) => {
  const [activeHourInput, setActiveHourInput] = useState<number | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [checkInput, setCheckInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filtering and Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('none');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const day = currentTime.getDate();
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(currentTime);
  const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentTime);

  const handleTaskSubmit = (hour: number) => {
    if (!taskInput.trim()) return;
    onAddTask(taskInput, hour);
    setTaskInput('');
    setActiveHourInput(null);
  };

  const handleCheckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInput.trim()) return;
    onAddChecklistItem(checkInput);
    setCheckInput('');
  };

  const formatHour = (h: number) => {
    const period = h < 12 ? 'AM' : 'PM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${period}`;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filtered and Sorted Tasks Logic
  const getProcessedTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'completed' ? task.completed :
        !task.completed;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'text') return a.text.localeCompare(b.text);
      if (sortBy === 'status') return Number(a.completed) - Number(b.completed);
      return 0;
    });
  }, [tasks, searchTerm, statusFilter, sortBy]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Prominent Date Header */}
      <header className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 bg-white/50 p-8 rounded-[40px] border border-pink-100/50 shadow-sm">
        <div className="text-center md:text-left">
          <div className="text-7xl font-black text-pink-400 leading-none">{day}</div>
          <div className="mt-2">
            <div className="text-xl font-bold text-pink-300 uppercase tracking-[0.2em]">{weekday}</div>
            <div className="text-sm font-medium text-pink-200 uppercase tracking-widest">{monthYear}</div>
          </div>
        </div>
        <div className="hidden md:block h-24 w-[1px] bg-pink-100 self-center opacity-50"></div>
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-bold text-pink-500 italic">"Glow with the flow today, Ella."</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-pink-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-pink-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(244,114,182,0.3)]"
                style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-pink-400 font-bold text-sm">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}% Done
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 24-Hour Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-2 text-pink-400 font-bold uppercase tracking-widest text-xs">
              <ChevronRight size={14} /> My Schedule
            </div>

            {/* Controls: Search, Filter, Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-200" size={14} />
                <input 
                  type="text" 
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs bg-white border border-pink-100 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-200 text-pink-700 placeholder:text-pink-200 w-40 sm:w-48"
                />
              </div>

              {/* Status Filter */}
              <div className="flex bg-white border border-pink-100 rounded-full p-1 shadow-sm">
                {(['all', 'pending', 'completed'] as StatusFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${
                      statusFilter === f ? 'bg-pink-400 text-white' : 'text-pink-200 hover:text-pink-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Sort Toggle */}
              <button 
                onClick={() => setSortBy(prev => prev === 'none' ? 'text' : prev === 'text' ? 'status' : 'none')}
                className={`p-2 rounded-full border transition-all ${
                  sortBy !== 'none' ? 'bg-pink-50 border-pink-200 text-pink-500' : 'bg-white border-pink-100 text-pink-200'
                }`}
                title={`Sorting: ${sortBy === 'none' ? 'None' : sortBy === 'text' ? 'Alphabetical' : 'Completion Status'}`}
              >
                <SortAsc size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-pink-100 shadow-sm overflow-hidden">
            <div className="h-[600px] overflow-y-auto scrollbar-hide divide-y divide-pink-50">
              {hours.map(h => {
                const hourTasks = getProcessedTasks.filter(t => t.hour === h);
                const isCurrentHour = currentTime.getHours() === h;

                return (
                  <div key={h} className={`group flex min-h-[70px] transition-all duration-300 ${isCurrentHour ? 'bg-pink-50/50' : 'hover:bg-pink-50/20'}`}>
                    <div className="w-20 flex-shrink-0 flex flex-col items-center justify-start pt-4 border-r border-pink-50">
                      <span className={`text-[10px] font-black ${isCurrentHour ? 'text-pink-500 underline underline-offset-4' : 'text-pink-200'}`}>
                        {formatHour(h)}
                      </span>
                    </div>

                    <div className="flex-1 p-4 flex flex-wrap gap-2 items-center">
                      {hourTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 bg-white border border-pink-100 px-3 py-1.5 rounded-2xl shadow-sm animate-in zoom-in-95">
                          <button onClick={() => onToggleTask(task.id)}>
                            {task.completed ? <CheckCircle2 size={16} className="text-pink-400" /> : <Circle size={16} className="text-pink-100" />}
                          </button>
                          <span className={`text-sm ${task.completed ? 'text-pink-200 line-through' : 'text-pink-700 font-medium'}`}>{task.text}</span>
                          <button onClick={() => onDeleteTask(task.id)} className="text-pink-100 hover:text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      
                      {activeHourInput === h ? (
                        <div className="flex items-center gap-2 bg-pink-50 p-1 rounded-xl border border-pink-200 shadow-inner">
                          <input
                            autoFocus
                            type="text"
                            value={taskInput}
                            onChange={(e) => setTaskInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleTaskSubmit(h);
                              if (e.key === 'Escape') setActiveHourInput(null);
                            }}
                            placeholder="Add task..."
                            className="bg-transparent text-sm px-2 py-0.5 focus:outline-none w-32 text-pink-700 placeholder:text-pink-300"
                          />
                          <button onClick={() => handleTaskSubmit(h)} className="p-1 bg-pink-400 text-white rounded-lg"><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setActiveHourInput(h)} className="opacity-0 group-hover:opacity-100 p-2 text-pink-200 hover:text-pink-400 hover:bg-pink-50 rounded-xl transition-all">
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Panels: Checklist & Notes */}
        <div className="space-y-8">
          {/* Checklist */}
          <section className="bg-white rounded-[32px] border border-pink-100 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-pink-400 flex items-center gap-2">
              <ListTodo size={20} /> Checklist
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {checklist.map(item => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <button onClick={() => onToggleChecklistItem(item.id)} className="flex-shrink-0">
                    {item.completed ? <CheckCircle2 size={18} className="text-pink-400" /> : <Circle size={18} className="text-pink-100" />}
                  </button>
                  <span className={`flex-1 text-sm ${item.completed ? 'text-pink-200 line-through' : 'text-pink-700'}`}>{item.text}</span>
                  <button onClick={() => onDeleteChecklistItem(item.id)} className="opacity-0 group-hover:opacity-100 text-pink-100 hover:text-pink-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleCheckSubmit} className="relative mt-4">
              <input
                type="text"
                value={checkInput}
                onChange={(e) => setCheckInput(e.target.value)}
                placeholder="New item..."
                className="w-full bg-pink-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 text-pink-700 placeholder:text-pink-200"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-pink-400 text-white rounded-xl shadow-md"><Plus size={16} /></button>
            </form>
          </section>

          {/* Notes */}
          <section className="bg-white rounded-[32px] border border-pink-100 p-6 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-lg font-black text-pink-400 flex items-center gap-2 mb-4">
              <FileText size={20} /> Daily Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="Jot down your thoughts, Ella..."
              className="flex-1 bg-pink-50/30 rounded-2xl p-4 text-sm text-pink-700 placeholder:text-pink-200 border-none focus:ring-2 focus:ring-pink-100 resize-none leading-relaxed"
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
