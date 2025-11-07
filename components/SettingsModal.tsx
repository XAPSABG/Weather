
import React, { useState, useEffect } from 'react';

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 text-white rounded-lg shadow-xl p-8 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <p className="text-gray-400 mb-6">
          Enter your API key from a provider like{' '}
          <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            WeatherAPI.com
          </a>{' '}
          to fetch live weather data. The free tier is sufficient for this app.
        </p>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
              Weather API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="effectsToggle" className="text-sm font-medium text-gray-300">
              Enable Special Effects
              <p className="text-xs text-gray-400 font-normal">Auroras, sun rays, shooting stars</p>
            </label>
            <button
              id="effectsToggle"
              onClick={onToggleEffects}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${showEffects ? 'bg-cyan-600' : 'bg-gray-600'}`}
              aria-label={`Special effects are currently ${showEffects ? 'enabled' : 'disabled'}`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${showEffects ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;