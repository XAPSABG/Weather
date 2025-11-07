import React, { useState } from 'react';
import type { Location } from '../types';
import type { Theme } from '../App';
import { Sun, Moon, Search, MapPin, Trash2, Settings, Loader, Locate } from './icons';

interface SidebarProps {
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
  
  const buttonHoverClass = useDarkText ? 'hover:bg-black/10' : 'hover:bg-white/15';
  const favoriteBgClass = useDarkText ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/15';
  const activeFavoriteBgClass = useDarkText ? 'bg-black/10' : 'bg-white/20';
  const secondaryTextClass = useDarkText ? 'text-slate-600' : 'text-white/70';
  const tertiaryTextClass = useDarkText ? 'text-slate-500' : 'text-white/60';
  const activeToggleClass = useDarkText ? 'bg-black/10 text-slate-800' : 'bg-white/20 text-white';

  return (
    <aside className={`w-full lg:w-80 xl:w-96 lg:sticky lg:top-0 lg:h-screen ${useDarkText ? 'bg-black/5' : 'bg-white/5'} dark:bg-black/20 backdrop-blur-2xl flex-shrink-0 p-6 flex flex-col space-y-8 border-r ${useDarkText ? 'border-black/10' : 'border-white/10'}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-wider drop-shadow-lg">Weather AI</h1>
        <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-full ${buttonHoverClass} transition-all duration-300`}
              aria-label="Open settings"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${buttonHoverClass} transition-all duration-300`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
        </div>
      </div>

      <div className="relative">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for a city..."
            className={`w-full ${useDarkText ? 'bg-black/5 placeholder-slate-500 focus:ring-slate-800/50' : 'bg-white/10 placeholder-white/70 focus:ring-white/50'} border-none rounded-xl py-3 pl-12 pr-10 focus:ring-2 focus:outline-none transition duration-300`}
          />
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 ${secondaryTextClass} pointer-events-none`} />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {isSearching && <Loader className={`w-5 h-5 ${secondaryTextClass}`} />}
            <button type="button" onClick={onGeolocate} className={`${buttonHoverClass} p-1 rounded-full`} aria-label="Use my location">
              <Locate className={`w-5 h-5 ${secondaryTextClass}`} />
            </button>
          </div>
        </form>
        {suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-black/30 backdrop-blur-lg rounded-lg z-50 max-h-60 overflow-y-auto shadow-2xl">
            {suggestions.map((s) => (
              <button
                key={`${s.name}-${s.lat}`}
                onClick={() => handleSuggestionClick(s)}
                className="block w-full text-left px-4 py-3 text-white hover:bg-white/20 transition-colors text-sm"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col min-h-0">
        <h2 className="text-xl font-semibold mb-4 drop-shadow-md">Favorite Locations</h2>
        <div className="space-y-2 overflow-y-auto pr-2 -mr-2 flex-grow">
          {favorites.length > 0 ? (
            favorites.map((fav) => (
              <div
                key={fav.name}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  currentLocation.name === fav.name
                    ? activeFavoriteBgClass
                    : favoriteBgClass
                }`}
                onClick={() => onSelectFavorite(fav)}
              >
                <div
                  className="flex items-center space-x-3 text-left w-full truncate"
                  aria-label={`Select ${fav.name}`}
                >
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate text-sm font-medium">{fav.name}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveFavorite(fav); }}
                  className={`p-1 rounded-full text-current/70 hover:text-current opacity-0 group-hover:opacity-100 transition-all flex-shrink-0`}
                  aria-label={`Remove ${fav.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className={`${secondaryTextClass} text-sm`}>No favorite locations yet.</p>
          )}
        </div>
      </div>
      
      <div className="flex-shrink-0">
         <h2 className="text-xl font-semibold mb-4 drop-shadow-md">Appearance</h2>
         <div className={`flex items-center ${useDarkText ? 'bg-black/5' : 'bg-white/5'} p-1 rounded-full`}>
            <button 
                onClick={() => onSetThemeMode('auto')}
                className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${themeMode === 'auto' ? activeToggleClass : 'text-current/70'}`}
                aria-pressed={themeMode === 'auto'}
            >
                Auto
            </button>
            <button
                onClick={() => onSetThemeMode('manual')}
                className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${themeMode === 'manual' ? activeToggleClass : 'text-current/70'}`}
                aria-pressed={themeMode === 'manual'}
            >
                Manual
            </button>
        </div>
        {themeMode === 'manual' && (
            <div className="mt-4 grid grid-cols-3 gap-3 animate-fadeIn">
                {themes.map(theme => (
                    <button 
                        key={theme.name}
                        onClick={() => onSelectManualTheme(theme)}
                        className={`aspect-square rounded-xl flex items-end p-2 text-white text-xs font-bold text-left shadow-inner transition-all duration-200 ${manualTheme?.name === theme.name ? 'ring-2 ring-offset-2 ring-offset-current/20 ring-white' : 'hover:scale-105'}`}
                        style={{ background: theme.gradientCss }}
                        aria-label={`Select ${theme.name} theme`}
                        aria-pressed={manualTheme?.name === theme.name}
                    >
                        <span className="drop-shadow-md leading-tight">{theme.name}</span>
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className={`text-center text-xs ${tertiaryTextClass} flex-shrink-0`}>
          <p className="drop-shadow-sm">Powered by React</p>
      </div>
    </aside>
  );
};

export default Sidebar;
