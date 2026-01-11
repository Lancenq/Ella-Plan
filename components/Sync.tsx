
import React, { useState } from 'react';
import { Copy, Download, Upload, Check, AlertCircle, RefreshCw, Wifi, Link, Info } from 'lucide-react';
import { AppState } from '../types';

interface SyncProps {
  state: AppState;
  onImport: (newState: AppState) => void;
  isSyncing: boolean;
}

const Sync: React.FC<SyncProps> = ({ state, onImport, isSyncing }) => {
  const [importCode, setImportCode] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ type: 'none', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const startLiveSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://jsonblob.com/api/jsonBlob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      const location = res.headers.get('Location');
      if (location) {
        const id = location.split('/').pop();
        if (id) {
          onImport({ ...state, syncId: id });
          setStatus({ type: 'success', message: 'Live session started!' });
        }
      }
    } catch (e) {
      setStatus({ type: 'error', message: 'Failed to connect to cloud.' });
    } finally {
      setIsLoading(false);
    }
  };

  const joinSession = async () => {
    if (!importCode.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://jsonblob.com/api/jsonBlob/${importCode}`);
      if (!res.ok) throw new Error();
      const newState = await res.json();
      onImport({ ...newState, syncId: importCode });
      setStatus({ type: 'success', message: 'Connected to session!' });
      setImportCode('');
    } catch (e) {
      setStatus({ type: 'error', message: 'Invalid Sync ID or connection error.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (state.syncId) {
      navigator.clipboard.writeText(state.syncId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const disconnect = () => {
    if (window.confirm("Disconnect from live session? Your data will remain local.")) {
      onImport({ ...state, syncId: undefined });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-pink-500">Real-time Sync</h2>
        <p className="text-pink-300 mt-2 uppercase tracking-widest text-[10px] font-bold">Connect devices & edit in real-time.</p>
      </div>

      {state.syncId ? (
        <section className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 shadow-sm space-y-6 text-center animate-in zoom-in-95">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
            <Wifi size={14} /> Session Active
          </div>
          <h3 className="text-2xl font-black text-emerald-800">You are Online!</h3>
          <p className="text-sm text-emerald-600 font-medium">Any changes you make now will automatically reflect on other devices using this ID.</p>
          
          <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-inner">
            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mb-2">Your Shareable Sync ID</p>
            <div className="flex items-center justify-between gap-4">
              <code className="text-xl font-mono text-emerald-700 break-all select-all font-bold">{state.syncId}</code>
              <button 
                onClick={handleCopy}
                className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all active:scale-90"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            {isSyncing ? 'Pushing updates...' : 'Cloud in sync'}
          </div>

          <button 
            onClick={disconnect}
            className="w-full py-4 bg-white border border-emerald-200 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all"
          >
            Disconnect Session
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Hướng dẫn nhanh */}
          <div className="bg-pink-50 p-6 rounded-[32px] border border-pink-100 flex gap-4 items-start">
            <div className="bg-white p-2 rounded-xl text-pink-400 shadow-sm flex-shrink-0">
              <Info size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-pink-600 uppercase">How to Sync?</h4>
              <p className="text-xs text-pink-400 leading-relaxed font-medium">
                1. Click <b>Start</b> on your main device to get a <b>Session ID</b>.<br/>
                2. Copy that ID and paste it into the <b>Join</b> section on your other device.
              </p>
            </div>
          </div>

          <section className="bg-white p-8 rounded-[40px] border border-pink-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400">
                <Wifi size={24} />
              </div>
              <div>
                <h3 className="font-black text-pink-600">Step 1: Start Live Session</h3>
                <p className="text-[10px] text-pink-300 font-bold uppercase tracking-wider">Generate a new ID for this device.</p>
              </div>
            </div>
            
            <button
              onClick={startLiveSession}
              disabled={isLoading}
              className="w-full bg-pink-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="animate-spin" /> : <Link size={20} />}
              Start Live Syncing
            </button>
          </section>

          <section className="bg-white p-8 rounded-[40px] border border-pink-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-400">
                <Upload size={24} />
              </div>
              <div>
                <h3 className="font-black text-pink-600">Step 2: Join Existing Session</h3>
                <p className="text-[10px] text-pink-300 font-bold uppercase tracking-wider">Connect using an ID from another device.</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Paste Session ID here..."
                className="w-full bg-pink-50/30 border border-pink-100 rounded-2xl p-4 text-center font-mono text-pink-700 font-bold focus:ring-4 focus:ring-pink-50 outline-none transition-all"
              />

              <button
                onClick={joinSession}
                disabled={!importCode.trim() || isLoading}
                className="w-full bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="animate-spin" /> : <RefreshCw size={20} />}
                Connect & Sync
              </button>
            </div>
          </section>
        </div>
      )}

      {status.type !== 'none' && (
        <div className={`p-4 rounded-2xl text-center animate-in zoom-in-95 font-bold ${
          status.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default Sync;
