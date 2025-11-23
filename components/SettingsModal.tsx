import React, { useState, useEffect } from 'react';
import { Settings } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentKey: string | null;
  showEffects: boolean;
  onToggleEffects: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentKey, showEffects, onToggleEffects }) => {
  const [apiKey, setApiKey] = useState(currentKey || '');

  useEffect(() => {
    setApiKey(currentKey || '');
  }, [currentKey]);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] animate-fadeIn p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900/90 border border-white/10 text-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <Settings className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold">Preferences</h2>
            </div>
            
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Configure your API access and visual preferences. Get a free API key from{' '}
            <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-medium hover:underline hover:text-cyan-300 transition-colors">
                WeatherAPI.com
            </a>.
            </p>
            
            <div className="space-y-6">
            <div>
                <label htmlFor="apiKey" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                API Key
                </label>
                <input
                type="text"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your key here..."
                className="w-full bg-black/30 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-mono text-sm"
                />
            </div>
            
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">Visual Effects</span>
                    <span className="text-xs text-slate-400">Rain, snow, clouds, and lighting animations</span>
                </div>
                <button
                onClick={onToggleEffects}
                className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 ${showEffects ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                <span
                    className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${showEffects ? 'translate-x-6' : 'translate-x-1'}`}
                />
                </button>
            </div>
            </div>
        </div>

        <div className="bg-black/20 p-6 flex justify-end space-x-3 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;