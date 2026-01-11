
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Settings2, Check } from 'lucide-react';

type TimerMode = 'work' | 'break';

const Pomodoro: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [workMinutes, setWorkMinutes] = useState(() => Number(localStorage.getItem('pomodoro_work')) || 25);
  const [breakMinutes, setBreakMinutes] = useState(() => Number(localStorage.getItem('pomodoro_break')) || 5);
  const [timeLeft, setTimeLeft] = useState((mode === 'work' ? workMinutes : breakMinutes) * 60);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Sync timeLeft when minutes change via settings
  useEffect(() => {
    if (!isActive) {
      setTimeLeft((mode === 'work' ? workMinutes : breakMinutes) * 60);
    }
  }, [workMinutes, breakMinutes, mode]);

  useEffect(() => {
    localStorage.setItem('pomodoro_work', workMinutes.toString());
    localStorage.setItem('pomodoro_break', breakMinutes.toString());
  }, [workMinutes, breakMinutes]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isActive) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play();
        } catch (e) { console.log('Audio playback failed'); }
        handleSwitch();
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const handleSwitch = () => {
    const nextMode = mode === 'work' ? 'break' : 'work';
    setMode(nextMode);
    setTimeLeft((nextMode === 'work' ? workMinutes : breakMinutes) * 60);
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft((mode === 'work' ? workMinutes : breakMinutes) * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-md mx-auto h-[75vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-black text-pink-500">Focus Hub</h2>
        <p className="text-pink-300 mt-2 uppercase tracking-widest text-[10px] font-bold">Pure concentration, soft rhythm.</p>
      </div>

      {/* Mode Toggle & Settings Trigger */}
      <div className="flex gap-2 w-full items-center">
        <div className="flex flex-1 bg-white p-1.5 rounded-[24px] border border-pink-100 shadow-sm">
          <button
            onClick={() => { setMode('work'); setIsActive(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] transition-all text-xs font-black ${
              mode === 'work' ? 'bg-pink-400 text-white shadow-lg shadow-pink-100' : 'text-pink-200 hover:text-pink-400'
            }`}
          >
            <Zap size={14} /> Focus
          </button>
          <button
            onClick={() => { setMode('break'); setIsActive(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] transition-all text-xs font-black ${
              mode === 'break' ? 'bg-pink-200 text-white shadow-lg shadow-pink-50' : 'text-pink-200 hover:text-pink-400'
            }`}
          >
            <Coffee size={14} /> Break
          </button>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`p-4 rounded-[20px] transition-all ${isEditing ? 'bg-pink-500 text-white shadow-pink-200' : 'bg-white text-pink-300 border border-pink-100 hover:bg-pink-50'}`}
        >
          <Settings2 size={20} />
        </button>
      </div>

      {/* Customization Panel */}
      {isEditing && (
        <div className="w-full bg-white p-6 rounded-[32px] border border-pink-100 shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-black text-pink-400 uppercase tracking-widest">Custom Timer</h4>
            <button onClick={() => setIsEditing(false)} className="text-emerald-500 p-1 hover:bg-emerald-50 rounded-lg"><Check size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-pink-300 uppercase pl-1">Focus (min)</label>
              <input 
                type="number" 
                value={workMinutes} 
                onChange={(e) => setWorkMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-pink-50/50 border-none rounded-2xl px-4 py-3 text-pink-700 font-bold focus:ring-2 focus:ring-pink-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-pink-300 uppercase pl-1">Break (min)</label>
              <input 
                type="number" 
                value={breakMinutes} 
                onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-pink-50/50 border-none rounded-2xl px-4 py-3 text-pink-700 font-bold focus:ring-2 focus:ring-pink-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="relative group py-4">
        <div className={`absolute -inset-10 blur-[60px] opacity-20 transition-all duration-1000 rounded-full ${isActive ? (mode === 'work' ? 'bg-pink-400' : 'bg-pink-200') : 'bg-pink-50'}`}></div>
        
        <div className="relative flex flex-col items-center justify-center bg-white w-72 h-72 rounded-full border border-pink-100 shadow-xl">
          <div className="flex flex-col items-center justify-center">
            <span className="text-7xl font-light text-pink-500 tabular-nums tracking-tighter">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest mt-4 ${mode === 'work' ? 'text-pink-400' : 'text-pink-300'}`}>
              {isActive ? (mode === 'work' ? 'Breathe & Work' : 'Time to Rest') : 'Ready to bloom?'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <button
          onClick={resetTimer}
          className="p-4 rounded-full border border-pink-100 text-pink-200 hover:text-pink-400 hover:bg-white hover:shadow-md transition-all active:scale-95"
          title="Reset Timer"
        >
          <RotateCcw size={24} />
        </button>

        <button
          onClick={toggleTimer}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 ${
            isActive ? 'bg-white text-pink-500 border border-pink-50' : 'bg-pink-400 text-white hover:bg-pink-500 shadow-pink-200'
          }`}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
        <div className="w-14"></div>
      </div>

      <p className="text-pink-200 italic text-xs text-center max-w-xs px-4">
        {mode === 'work' 
          ? "“Do one thing at a time, but do it beautifully.”"
          : "“Resting is a part of growing.”"}
      </p>
    </div>
  );
};

export default Pomodoro;
