
import React, { useState, useEffect } from 'react';
import { Save, Heart } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalProps {
  entry: JournalEntry;
  onSave: (text: string, mood: number | null, gratitude: string[]) => void;
}

const moods = [
  { value: 1, emoji: '😞', label: 'Terrible' },
  { value: 2, emoji: '😕', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '✨', label: 'Amazing' },
];

const Journal: React.FC<JournalProps> = ({ entry, onSave }) => {
  const [text, setText] = useState(entry.text);
  const [mood, setMood] = useState<number | null>(entry.mood);
  const [gratitude, setGratitude] = useState<string[]>(entry.gratitude.length ? entry.gratitude : ['', '', '']);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if entry changes
  useEffect(() => {
    setText(entry.text);
    setMood(entry.mood);
    setGratitude(entry.gratitude.length ? entry.gratitude : ['', '', '']);
  }, [entry]);

  const handleGratitudeChange = (index: number, val: string) => {
    const next = [...gratitude];
    next[index] = val;
    setGratitude(next);
  };

  const handleSave = () => {
    setIsSaving(true);
    onSave(text, mood, gratitude);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-pink-500">Mindful Reflection</h2>
        <p className="text-pink-300 mt-1 uppercase tracking-widest text-xs font-bold">Take a moment to clear your mind.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mood Section */}
        <section className="bg-white p-8 rounded-[32px] border border-pink-100 shadow-sm space-y-4">
          <h3 className="font-bold text-pink-700 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-pink-400 rounded-full"></div>
            How are you feeling today?
          </h3>
          <div className="flex justify-between items-center gap-2 pt-2">
            {moods.map(m => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all ${
                  mood === m.value 
                    ? 'bg-pink-50 border-2 border-pink-400 scale-105 shadow-md shadow-pink-100' 
                    : 'bg-white border-2 border-pink-50 hover:bg-pink-50/50'
                }`}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${mood === m.value ? 'text-pink-600' : 'text-pink-200'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Gratitude Section */}
        <section className="bg-white p-8 rounded-[32px] border border-pink-100 shadow-sm space-y-4">
          <h3 className="font-bold text-pink-700 flex items-center gap-2">
            <Heart size={20} className="text-pink-400" />
            Three things you're grateful for
          </h3>
          <div className="space-y-3">
            {gratitude.map((item, i) => (
              <div key={i} className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-pink-200 font-bold italic w-6 text-center">{i + 1}</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleGratitudeChange(i, e.target.value)}
                  placeholder="Focus on the small joys..."
                  className="w-full bg-transparent border-b border-pink-50 pl-8 pr-2 py-2 focus:outline-none focus:border-pink-300 text-pink-700 placeholder:text-pink-100 placeholder:italic transition-all"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Reflection Area */}
      <section className="bg-white p-8 rounded-[32px] border border-pink-100 shadow-sm space-y-4">
        <h3 className="font-bold text-pink-700 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-pink-400 rounded-full"></div>
          Daily Reflection
        </h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? No judgments, just flow..."
          className="w-full h-48 bg-pink-50/30 rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all text-pink-700 leading-relaxed resize-none placeholder:text-pink-100"
        />
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-10 py-4 rounded-[24px] font-bold transition-all shadow-lg ${
            isSaving 
              ? 'bg-pink-500 text-white scale-95 shadow-pink-100' 
              : 'bg-pink-400 text-white hover:bg-pink-500 shadow-pink-200 active:scale-95'
          }`}
        >
          {isSaving ? <span className="flex items-center gap-2 animate-pulse">Saved Successfully <Save size={20} /></span> : <>Save Entry <Save size={20} /></>}
        </button>
      </div>
    </div>
  );
};

export default Journal;
