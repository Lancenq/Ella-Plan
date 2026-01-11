
import React, { useState } from 'react';
import { Plus, Flame, Check, Trash2, CheckSquare } from 'lucide-react';
import { Habit } from '../types';
import { getWeekDays, calculateStreak, getTodayDateString } from '../utils';

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit: (name: string) => void;
  onToggleDate: (id: string, date: string) => void;
  onDeleteHabit: (id: string) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onAddHabit, onToggleDate, onDeleteHabit }) => {
  const [newHabitName, setNewHabitName] = useState('');
  const weekDays = getWeekDays();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    onAddHabit(newHabitName);
    setNewHabitName('');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-pink-500">Glow Daily</h2>
        <p className="text-pink-300 mt-1 uppercase tracking-widest text-xs font-bold">Small steps lead to big change.</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="New habit (e.g., Morning Matcha)"
          className="flex-1 bg-white border border-pink-100 rounded-[24px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all shadow-sm text-pink-700"
        />
        <button className="bg-pink-400 text-white p-4 rounded-[24px] hover:bg-pink-500 transition-all shadow-lg shadow-pink-200">
          <Plus size={24} />
        </button>
      </form>

      <div className="bg-white border border-pink-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1fr_repeat(7,48px)_80px] border-b border-pink-50 p-6 bg-pink-50/30">
          <div className="text-[10px] font-black text-pink-300 uppercase tracking-widest">Habit</div>
          {weekDays.map(date => {
            const d = new Date(date);
            const isToday = date === getTodayDateString();
            return (
              <div key={date} className="flex flex-col items-center gap-1">
                <span className="text-[8px] text-pink-300 font-bold uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black ${isToday ? 'bg-pink-400 text-white shadow-md' : 'text-pink-200'}`}>
                  {d.getDate()}
                </span>
              </div>
            );
          })}
          <div className="text-center text-[10px] font-black text-pink-300 uppercase tracking-widest flex items-center justify-center gap-1">
            <Flame size={12} className="text-orange-300" />
            Streak
          </div>
        </div>

        <div className="divide-y divide-pink-50">
          {habits.map(habit => {
            const streak = calculateStreak(habit.completions);
            return (
              <div key={habit.id} className="grid grid-cols-[1fr_repeat(7,48px)_80px] items-center p-6 group transition-colors hover:bg-pink-50/10">
                <div className="flex items-center gap-3">
                  <button onClick={() => onDeleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 text-pink-100 hover:text-pink-400">
                    <Trash2 size={14} />
                  </button>
                  <span className="font-bold text-pink-700">{habit.name}</span>
                </div>
                {weekDays.map(date => {
                  const isCompleted = habit.completions.includes(date);
                  return (
                    <div key={date} className="flex justify-center">
                      <button
                        onClick={() => onToggleDate(habit.id, date)}
                        className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-pink-400 border-pink-400 text-white scale-110 shadow-lg shadow-pink-100' 
                            : 'bg-white border-pink-50 hover:border-pink-200'
                        }`}
                      >
                        {isCompleted && <Check size={16} strokeWidth={4} />}
                      </button>
                    </div>
                  );
                })}
                <div className="text-center font-black text-pink-500">{streak}</div>
              </div>
            );
          })}
          {habits.length === 0 && (
            <div className="py-20 text-center text-pink-100">
              <CheckSquare size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-bold uppercase tracking-widest text-xs">Start your first habit journey</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
