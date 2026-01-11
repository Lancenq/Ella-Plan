
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ListTodo, FileText, ChevronRight, Search, SortAsc, ChevronLeft, Calendar, Image as ImageIcon, X } from 'lucide-react';
import { Task, ChecklistItem } from '../types';
import { getTodayDateString, fileToBase64 } from '../utils';

interface DashboardProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  tasks: Task[];
  onAddTask: (text: string, hour: number, imageUrl?: string) => void;
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
  selectedDate, onDateChange,
  tasks, onAddTask, onToggleTask, onDeleteTask,
  notes, onUpdateNotes,
  checklist, onAddChecklistItem, onToggleChecklistItem, onDeleteChecklistItem
}) => {
  const [activeHourInput, setActiveHourInput] = useState<number | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [taskImage, setTaskImage] = useState<string | null>(null);
  const [checkInput, setCheckInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtering and Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('none');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const viewDate = new Date(selectedDate);
  const day = viewDate.getDate();
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(viewDate);
  const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewDate);

  const handleTaskSubmit = (hour: number) => {
    if (!taskInput.trim()) return;
    onAddTask(taskInput, hour, taskImage || undefined);
    setTaskInput('');
    setTaskImage(null);
    setActiveHourInput(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setTaskImage(base64);
    }
  };

  const handleCheckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInput.trim()) return;
    onAddChecklistItem(checkInput);
    setCheckInput('');
  };

  const changeDate = (offset: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + offset);
    onDateChange(nextDate.toISOString().split('T')[0]);
  };

  const formatHour = (h: number) => {
    const period = h < 12 ? 'AM' : 'PM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${period}`;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

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

  const isToday = selectedDate === getTodayDateString();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Image Preview Modal Overlay */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-white p-2 rounded-[32px] overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
            >
              <X size={20} />
            </button>
            <img src={previewImage} alt="Task preview" className="w-full h-auto max-h-[80vh] object-contain rounded-[24px]" />
          </div>
        </div>
      )}

      {/* Prominent Date Header */}
      <header className="bg-white/50 p-6 md:p-8 rounded-[40px] border border-pink-100/50 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="text-center md:text-left relative group">
              <div className="text-7xl font-black text-pink-400 leading-none">{day}</div>
              <div className="mt-2">
                <div className="text-xl font-bold text-pink-300 uppercase tracking-[0.2em]">{weekday}</div>
                <div className="text-sm font-medium text-pink-200 uppercase tracking-widest">{monthYear}</div>
              </div>
              <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
              />
            </div>

            <div className="hidden md:block h-24 w-[1px] bg-pink-100 self-center opacity-50"></div>

            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2">
                  <button onClick={() => changeDate(-1)} className="p-2 hover:bg-pink-100 rounded-full text-pink-400 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => onDateChange(getTodayDateString())}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      isToday ? 'bg-pink-400 text-white' : 'border border-pink-200 text-pink-300 hover:bg-pink-50'
                    }`}
                  >
                    Today
                  </button>
                  <button onClick={() => changeDate(1)} className="p-2 hover:bg-pink-100 rounded-full text-pink-400 transition-colors">
                    <ChevronRight size={20} />
                  </button>
               </div>
               <div className="relative group flex items-center gap-2 text-pink-300 text-[10px] font-bold uppercase tracking-widest">
                  <Calendar size={14} /> <span>Jump to Date</span>
                  <input 
                    type="date" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                  />
               </div>
            </div>
          </div>

          <div className="flex-1 w-full md:max-w-md space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-pink-500 italic text-center md:text-right">
              {isToday ? '"Glow with the flow today, Ella."' : `"Planning ahead for ${weekday}..."`}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-pink-50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(244,114,182,0.3)]"
                  style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-pink-400 font-bold text-sm">
                {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-2 text-pink-400 font-bold uppercase tracking-widest text-xs">
              <ChevronRight size={14} /> {isToday ? 'My Schedule' : `Schedule for ${day}/${viewDate.getMonth() + 1}`}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-200" size={14} />
                <input 
                  type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs bg-white border border-pink-100 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-200 text-pink-700 placeholder:text-pink-200 w-40 sm:w-48"
                />
              </div>
              <div className="flex bg-white border border-pink-100 rounded-full p-1 shadow-sm">
                {(['all', 'pending', 'completed'] as StatusFilter[]).map((f) => (
                  <button
                    key={f} onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${statusFilter === f ? 'bg-pink-400 text-white' : 'text-pink-200 hover:text-pink-400'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={() => setSortBy(prev => prev === 'none' ? 'text' : prev === 'text' ? 'status' : 'none')} className={`p-2 rounded-full border transition-all ${sortBy !== 'none' ? 'bg-pink-50 border-pink-200 text-pink-500' : 'bg-white border-pink-100 text-pink-200'}`}>
                <SortAsc size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-pink-100 shadow-sm overflow-hidden">
            <div className="h-[600px] overflow-y-auto scrollbar-hide divide-y divide-pink-50">
              {hours.map(h => {
                const hourTasks = getProcessedTasks.filter(t => t.hour === h);
                const isCurrentHour = isToday && currentTime.getHours() === h;

                return (
                  <div key={h} className={`group flex min-h-[70px] transition-all duration-300 ${isCurrentHour ? 'bg-pink-50/50' : 'hover:bg-pink-50/20'}`}>
                    <div className="w-20 flex-shrink-0 flex flex-col items-center justify-start pt-4 border-r border-pink-50">
                      <span className={`text-[10px] font-black ${isCurrentHour ? 'text-pink-500 underline underline-offset-4' : 'text-pink-200'}`}>
                        {formatHour(h)}
                      </span>
                    </div>

                    <div className="flex-1 p-4 flex flex-wrap gap-2 items-center">
                      {hourTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 bg-white border border-pink-100 px-3 py-1.5 rounded-2xl shadow-sm animate-in zoom-in-95 group/task">
                          <button onClick={() => onToggleTask(task.id)}>
                            {task.completed ? <CheckCircle2 size={16} className="text-pink-400" /> : <Circle size={16} className="text-pink-100" />}
                          </button>
                          
                          {task.imageUrl && (
                            <div 
                              className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border border-pink-50 hover:scale-110 transition-transform"
                              onClick={() => setPreviewImage(task.imageUrl || null)}
                            >
                              <img src={task.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}

                          <span className={`text-sm ${task.completed ? 'text-pink-200 line-through' : 'text-pink-700 font-medium'}`}>{task.text}</span>
                          <button onClick={() => onDeleteTask(task.id)} className="text-pink-100 hover:text-pink-400 opacity-0 group-hover/task:opacity-100 transition-opacity">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      
                      {activeHourInput === h ? (
                        <div className="flex flex-col gap-2 animate-in slide-in-from-top-2">
                           <div className="flex items-center gap-2 bg-pink-50 p-1.5 rounded-2xl border border-pink-200 shadow-inner">
                            {taskImage && (
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-pink-300">
                                <img src={taskImage} className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => setTaskImage(null)}
                                  className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                            <input
                              autoFocus type="text" value={taskInput} onChange={(e) => setTaskInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTaskSubmit(h);
                                if (e.key === 'Escape') { setActiveHourInput(null); setTaskImage(null); }
                              }}
                              placeholder="What to do?"
                              className="bg-transparent text-sm px-2 py-0.5 focus:outline-none w-32 text-pink-700 placeholder:text-pink-300"
                            />
                            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                            <button 
                              onClick={() => fileInputRef.current?.click()} 
                              className={`p-1.5 rounded-lg transition-all ${taskImage ? 'text-pink-500 bg-pink-100' : 'text-pink-300 hover:bg-pink-100 hover:text-pink-500'}`}
                            >
                              <ImageIcon size={14} />
                            </button>
                            <button onClick={() => handleTaskSubmit(h)} className="p-1.5 bg-pink-400 text-white rounded-lg"><Plus size={14} /></button>
                          </div>
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

        <div className="space-y-8">
          <section className="bg-white rounded-[32px] border border-pink-100 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-pink-400 flex items-center gap-2"><ListTodo size={20} /> Checklist</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {checklist.map(item => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <button onClick={() => onToggleChecklistItem(item.id)} className="flex-shrink-0">
                    {item.completed ? <CheckCircle2 size={18} className="text-pink-400" /> : <Circle size={18} className="text-pink-100" />}
                  </button>
                  <span className={`flex-1 text-sm ${item.completed ? 'text-pink-200 line-through' : 'text-pink-700'}`}>{item.text}</span>
                  <button onClick={() => onDeleteChecklistItem(item.id)} className="opacity-0 group-hover:opacity-100 text-pink-100 hover:text-pink-400"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <form onSubmit={handleCheckSubmit} className="relative mt-4">
              <input type="text" value={checkInput} onChange={(e) => setCheckInput(e.target.value)} placeholder="New item..." className="w-full bg-pink-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 text-pink-700" />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-pink-400 text-white rounded-xl"><Plus size={16} /></button>
            </form>
          </section>

          <section className="bg-white rounded-[32px] border border-pink-100 p-6 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-lg font-black text-pink-400 flex items-center gap-2 mb-4"><FileText size={20} /> Daily Notes</h3>
            <textarea value={notes} onChange={(e) => onUpdateNotes(e.target.value)} placeholder="Thoughts..." className="flex-1 bg-pink-50/30 rounded-2xl p-4 text-sm text-pink-700 resize-none" />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
