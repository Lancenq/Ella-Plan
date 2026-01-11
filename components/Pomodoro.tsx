
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';

type TimerMode = 'work' | 'break';

const Pomodoro: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<number | null>(null);

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
    setTimeLeft(nextMode === 'work' ? 25 * 60 : 5 * 60);
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-md mx-auto h-[70vh] flex flex-col items-center justify-center space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-black text-pink-500">Focus Hub</h2>
        <p className="text-pink-300 mt-2 uppercase tracking-widest text-xs font-bold">Pure concentration, soft rhythm.</p>
      </div>

      <div className="flex bg-white p-2 rounded-[24px] border border-pink-100 shadow-sm w-full">
        <button
          onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsActive(false); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] transition-all font-black ${
            mode === 'work' ? 'bg-pink-400 text-white shadow-lg shadow-pink-100' : 'text-pink-200 hover:text-pink-400'
          }`}
        >
          <Zap size={18} /> Focus
        </button>
        <button
          onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] transition-all font-black ${
            mode === 'break' ? 'bg-pink-200 text-white shadow-lg shadow-pink-50' : 'text-pink-200 hover:text-pink-400'
          }`}
        >
          <Coffee size={18} /> Break
        </button>
      </div>

      <div className="relative group">
        <div className={`absolute -inset-10 blur-[60px] opacity-20 transition-all duration-1000 rounded-full ${isActive ? (mode === 'work' ? 'bg-pink-400' : 'bg-pink-200') : 'bg-pink-50'}`}></div>
        
        <div className="relative flex flex-col items-center bg-white w-72 h-72 rounded-full border border-pink-100 shadow-xl flex items-center justify-center">
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

      <p className="text-pink-200 italic text-sm text-center max-w-xs px-4">
        {mode === 'work' 
          ? "“Do one thing at a time, but do it beautifully.”"
          : "“Resting is a part of growing.”"}
      </p>
    </div>
  );
};

export default Pomodoro;
