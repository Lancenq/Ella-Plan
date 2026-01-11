
import React, { useState } from 'react';
import { Copy, Download, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { AppState } from '../types';

interface SyncProps {
  state: AppState;
  onImport: (newState: AppState) => void;
}

const Sync: React.FC<SyncProps> = ({ state, onImport }) => {
  const [importCode, setImportCode] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ type: 'none', message: '' });
  const [copied, setCopied] = useState(false);

  // Unicode safe base64 encoding
  const encodeData = (data: AppState) => {
    try {
      const jsonString = JSON.stringify(data);
      // We use encodeURIComponent to handle special characters, then unescape to get a string btoa can handle
      return btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (_, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      ));
    } catch (e) {
      console.error("Export error:", e);
      return "";
    }
  };

  const decodeData = (base64: string): AppState | null => {
    try {
      // Inverse of the encode logic
      const decoded = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(decoded);
    } catch (e) {
      console.error("Import error:", e);
      return null;
    }
  };

  const exportCode = encodeData(state);

  const handleCopy = () => {
    if (!exportCode) return;
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ella_planner_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = () => {
    const decoded = decodeData(importCode);
    if (decoded && decoded.tasks && decoded.habits) {
      if (window.confirm("This will overwrite your current data. Are you sure?")) {
        onImport(decoded);
        setStatus({ type: 'success', message: 'Data synced successfully!' });
        setImportCode('');
        setTimeout(() => setStatus({ type: 'none', message: '' }), 3000);
      }
    } else {
      setStatus({ type: 'error', message: 'Invalid Sync Code. Please check and try again.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (window.confirm("Import data from file? Current data will be replaced.")) {
          onImport(json);
          setStatus({ type: 'success', message: 'File imported successfully!' });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Error reading file.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-pink-500">Sync & Backup</h2>
        <p className="text-pink-300 mt-2 uppercase tracking-widest text-[10px] font-bold">Connect your devices and protect your data.</p>
      </div>

      {status.type !== 'none' && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
        }`}>
          {status.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Export Card */}
        <section className="bg-white p-8 rounded-[40px] border border-pink-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400">
              <RefreshCw size={24} />
            </div>
            <div>
              <h3 className="font-black text-pink-600">Export from this device</h3>
              <p className="text-[10px] text-pink-300 font-bold uppercase tracking-wider">Generate a code to use on another device.</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="bg-pink-50/50 rounded-2xl p-4 pr-12 text-[10px] font-mono text-pink-300 break-all h-24 overflow-hidden select-none">
              {exportCode || "Loading code..."}
            </div>
            <button 
              onClick={handleCopy}
              className="absolute right-2 top-2 p-3 bg-white border border-pink-100 rounded-xl text-pink-400 hover:text-pink-600 hover:shadow-md transition-all active:scale-95"
            >
              {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
            </button>
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none rounded-2xl"></div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCopy}
              className="flex-1 bg-pink-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-500 transition-all flex items-center justify-center gap-2"
            >
              <Copy size={20} /> {copied ? 'Copied!' : 'Copy Sync Code'}
            </button>
            <button
              onClick={handleDownload}
              className="px-6 border-2 border-pink-100 text-pink-400 font-bold rounded-2xl hover:bg-pink-50 transition-all"
              title="Download backup file"
            >
              <Download size={20} />
            </button>
          </div>
        </section>

        {/* Import Card */}
        <section className="bg-white p-8 rounded-[40px] border border-pink-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-400">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="font-black text-pink-600">Import to this device</h3>
              <p className="text-[10px] text-pink-300 font-bold uppercase tracking-wider">Paste a code or upload a file from your other device.</p>
            </div>
          </div>

          <textarea
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Paste your Sync Code here..."
            className="w-full h-32 bg-pink-50/30 border-2 border-dashed border-pink-100 rounded-2xl p-4 text-xs font-mono text-pink-700 focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all resize-none"
          />

          <div className="flex gap-4">
            <button
              onClick={handleImport}
              disabled={!importCode.trim()}
              className="flex-1 bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} /> Sync Now
            </button>
            <label className="px-6 border-2 border-pink-100 text-pink-400 font-bold rounded-2xl hover:bg-pink-50 transition-all flex items-center justify-center cursor-pointer">
              <Upload size={20} />
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </section>
      </div>

      <div className="p-6 bg-pink-50/50 rounded-[32px] border border-pink-100 border-dashed text-center">
        <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest leading-relaxed">
          💡 Pro Tip: Send code via Zalo/Messenger to sync quickly between devices.
        </p>
      </div>
    </div>
  );
};

export default Sync;
