import React, { useState } from 'react';
import type { Location } from '../types';
import type { Theme } from '../App';
import { Sun, Moon, Search, MapPin, Trash2, Settings, Loader, Locate, NavigationArrow } from './icons';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onQueryChange: (query: string) => void;
  suggestions: Location[];
  onSelectSuggestion: (location: Location) => void;
  onGeolocate: () => void;
  isSearching: boolean;
  favorites: Location[];
  onSelectFavorite: (location: Location) => void;
  onRemoveFavorite: (location: Location) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentLocation: Location;
  onOpenSettings: () => void;
  useDarkText: boolean;
  themes: Theme[];
  themeMode: 'auto' | 'manual';
  onSetThemeMode: (mode: 'auto' | 'manual') => void;
  manualTheme: Theme | null;
  onSelectManualTheme: (theme: Theme) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  onQueryChange,
  suggestions,
  onSelectSuggestion,
  onGeolocate,
  isSearching,
  favorites,
  onSelectFavorite,
  onRemoveFavorite,
  isDarkMode,
  toggleTheme,
  currentLocation,
  onOpenSettings,
  useDarkText,
  themes,
  themeMode,
  onSetThemeMode,
  manualTheme,
  onSelectManualTheme,
}) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onQueryChange(newQuery);
  };

  const handleSuggestionClick = (location: Location) => {
    onSelectSuggestion(location);
    setQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
  };
  
  // Dynamic class styling based on background luminance
  const panelBg = useDarkText ? 'bg-white/30 border-white/40' : 'bg-black/20 border-white/10';
  const inputBg = useDarkText ? 'bg-white/50 focus:bg-white/70' : 'bg-white/10 focus:bg-white/20';
  const itemHover = useDarkText ? 'hover:bg-white/40' : 'hover:bg-white/10';
  const textMuted = useDarkText ? 'text-slate-600' : 'text-white/60';
  const divider = useDarkText ? 'border-slate-500/10' : 'border-white/10';

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed lg:relative z-50 top-0 left-0 h-full w-80 lg:w-96 flex-shrink-0 transition-transform duration-500 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:bg-transparent lg:p-6`}>
        <div className={`h-full w-full flex flex-col p-6 lg:rounded-3xl backdrop-blur-xl border-r lg:border border-transparent ${panelBg} shadow-2xl overflow-hidden`}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Weather AI</h1>
            <div className="flex gap-2">
                <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${itemHover}`}>
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button onClick={onOpenSettings} className={`p-2 rounded-full transition-colors ${itemHover}`}>
                    <Settings className="w-5 h-5" />
                </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative z-20 mb-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search city..."
                className={`w-full ${inputBg} backdrop-blur-md rounded-2xl py-3 pl-11 pr-10 outline-none transition-all placeholder:text-current/40 shadow-sm`}
              />
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 opacity-50" />
              <div className="absolute right-2 top-2 flex items-center">
                 {isSearching && <Loader className="w-4 h-4 mr-2 opacity-50" />}
                 <button type="button" onClick={onGeolocate} className={`p-1.5 rounded-xl ${itemHover} transition-colors`} title="Use my location">
                    <Locate className="w-4 h-4 opacity-70" />
                 </button>
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className={`absolute top-full mt-2 w-full ${useDarkText ? 'bg-white/80' : 'bg-slate-900/80'} backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden animate-slideIn border border-white/10`}>
                {suggestions.map((s) => (
                  <button
                    key={`${s.name}-${s.lat}`}
                    onClick={() => handleSuggestionClick(s)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors border-b last:border-0 ${divider} ${itemHover}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites List */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1 scrollbar-thin scrollbar-thumb-white/20">
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">Saved Locations</h2>
            <div className="space-y-2">
              {favorites.map((fav) => (
                <div
                  key={fav.name}
                  onClick={() => onSelectFavorite(fav)}
                  className={`group relative p-3 rounded-2xl cursor-pointer transition-all border border-transparent ${
                    currentLocation.name === fav.name
                      ? (useDarkText ? 'bg-white/60 shadow-lg' : 'bg-white/10 shadow-lg border-white/10')
                      : itemHover
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${useDarkText ? 'bg-slate-200/50' : 'bg-white/10'}`}>
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{fav.name}</p>
                        <p className={`text-xs truncate ${textMuted}`}>{fav.lat.toFixed(2)}, {fav.lon.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveFavorite(fav); }}
                    className="absolute right-3 top-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {favorites.length === 0 && (
                <div className={`p-6 text-center rounded-2xl border border-dashed ${divider} ${textMuted}`}>
                    <p className="text-sm">No favorites added yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Theme Selector Footer */}
          <div className={`mt-6 pt-6 border-t ${divider}`}>
            <div className={`flex p-1 rounded-xl ${useDarkText ? 'bg-slate-200/50' : 'bg-black/20'}`}>
                <button 
                    onClick={() => onSetThemeMode('auto')} 
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${themeMode === 'auto' ? (useDarkText ? 'bg-white shadow-sm' : 'bg-white/20 shadow-sm') : 'opacity-50 hover:opacity-100'}`}
                >
                    Auto
                </button>
                <button 
                    onClick={() => onSetThemeMode('manual')} 
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${themeMode === 'manual' ? (useDarkText ? 'bg-white shadow-sm' : 'bg-white/20 shadow-sm') : 'opacity-50 hover:opacity-100'}`}
                >
                    Themes
                </button>
            </div>
            
            {themeMode === 'manual' && (
                <div className="grid grid-cols-5 gap-2 mt-4 animate-fadeIn">
                    {themes.map(t => (
                        <button
                            key={t.name}
                            onClick={() => onSelectManualTheme(t)}
                            className={`w-full aspect-square rounded-full shadow-inner transition-transform hover:scale-110 ${manualTheme?.name === t.name ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : ''}`}
                            style={{ background: t.gradientCss }}
                            title={t.name}
                        />
                    ))}
                </div>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;