import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { WeatherData, Location } from './types';
import { fetchWeatherData, searchLocations } from './services/api';
import WeatherDisplay from './components/WeatherDisplay';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import WeatherEffects from './components/WeatherEffects';
import { Sun } from './components/icons';

export interface Theme {
  name: string;
  bgClass: string;
  gradientCss: string;
  darkText: boolean;
}

export const themes: Theme[] = [
  { name: 'Sunny Day', bgClass: 'from-blue-400 via-sky-400 to-cyan-300', gradientCss: 'linear-gradient(to bottom right, #60a5fa, #38bdf8, #67e8f9)', darkText: false },
  { name: 'Misty Morning', bgClass: 'from-slate-300 via-gray-300 to-slate-400', gradientCss: 'linear-gradient(to bottom right, #cbd5e1, #d1d5db, #94a3b8)', darkText: true },
  { name: 'Stormy Sky', bgClass: 'from-slate-800 via-slate-700 to-indigo-900', gradientCss: 'linear-gradient(to bottom right, #1e293b, #334155, #312e81)', darkText: false },
  { name: 'Starry Night', bgClass: 'from-indigo-950 via-slate-900 to-black', gradientCss: 'linear-gradient(to bottom right, #1e1b4b, #0f172a, #000000)', darkText: false },
  { name: 'Crimson Sunset', bgClass: 'from-orange-500 via-red-500 to-pink-600', gradientCss: 'linear-gradient(to bottom right, #f97316, #ef4444, #db2777)', darkText: false },
  { name: 'Aurora Borealis', bgClass: 'from-teal-800 via-emerald-800 to-indigo-900', gradientCss: 'linear-gradient(to bottom right, #115e59, #065f46, #312e81)', darkText: false },
  { name: 'Cyberpunk City', bgClass: 'from-fuchsia-900 via-violet-900 to-blue-900', gradientCss: 'linear-gradient(to bottom right, #701a75, #4c1d95, #1e3a8a)', darkText: false },
  { name: 'Ocean Deep', bgClass: 'from-blue-900 via-sky-800 to-slate-900', gradientCss: 'linear-gradient(to bottom right, #1e3a8a, #075985, #0f172a)', darkText: false },
  { name: 'Minty Fresh', bgClass: 'from-emerald-300 via-teal-200 to-cyan-200', gradientCss: 'linear-gradient(to bottom right, #6ee7b7, #99f6e4, #a5f3fc)', darkText: true },
];

const App: React.FC = () => {
  const [location, setLocation] = useState<Location>({ name: 'New York', lat: 40.71, lon: -74.00 });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Location[]>(() => {
    const savedFavorites = localStorage.getItem('weatherFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [{ name: 'London, UK', lat: 51.52, lon: -0.11 }];
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('weatherApiKey'));
  const [showEffects, setShowEffects] = useState<boolean>(() => {
    const saved = localStorage.getItem('weatherEffectsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const debounceTimeout = useRef<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  
  const [themeMode, setThemeMode] = useState<'auto' | 'manual'>(() => {
    return (localStorage.getItem('weatherThemeMode') as 'auto' | 'manual') || 'auto';
  });
  const [manualTheme, setManualTheme] = useState<Theme | null>(() => {
    const savedTheme = localStorage.getItem('weatherManualTheme');
    if (savedTheme) {
        try {
            return JSON.parse(savedTheme);
        } catch (e) {
            return null;
        }
    }
    return null;
  });

  // Background transition state
  const [bg1Class, setBg1Class] = useState('from-blue-400 via-sky-400 to-cyan-300');
  const [bg2Class, setBg2Class] = useState('from-blue-400 via-sky-400 to-cyan-300');
  const [isBg1Active, setIsBg1Active] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const loadWeatherData = useCallback(async (loc: Location, key: string) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    try {
      const weather = await fetchWeatherData(loc, key);
      setWeatherData(weather);
    } catch (err: any) {
      if (err.message.includes('401') || err.message.includes('403')) {
        setError('Invalid or expired API key. Please check your settings.');
        setIsSettingsOpen(true);
      } else {
        setError(err.message || 'Failed to fetch weather data.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!apiKey) {
      setError('Welcome! Please configure your Weather API key in the settings.');
      setIsSettingsOpen(true);
      setLoading(false);
    } else {
       loadWeatherData(location, apiKey);
    }
  }, [location, apiKey, loadWeatherData]);

  // Auto refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
        if (apiKey && location) {
            loadWeatherData(location, apiKey);
        }
    }, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [location, apiKey, loadWeatherData]);

  useEffect(() => { localStorage.setItem('weatherFavorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('weatherEffectsEnabled', JSON.stringify(showEffects)); }, [showEffects]);
  useEffect(() => { localStorage.setItem('weatherThemeMode', themeMode); }, [themeMode]);

  useEffect(() => {
    if (manualTheme) {
        localStorage.setItem('weatherManualTheme', JSON.stringify(manualTheme));
    } else {
        localStorage.removeItem('weatherManualTheme');
    }
  }, [manualTheme]);

  useEffect(() => {
    if (themeMode === 'manual' && !manualTheme) {
        setManualTheme(themes[0]);
    }
  }, [themeMode, manualTheme]);

  const handleSaveApiKey = (newKey: string) => {
    localStorage.setItem('weatherApiKey', newKey);
    setApiKey(newKey);
    setIsSettingsOpen(false);
    setError(null);
  };
  
  const handleSelectManualTheme = (theme: Theme) => {
    setManualTheme(theme);
  };

  const handleQueryChange = (query: string) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    debounceTimeout.current = window.setTimeout(async () => {
      if (apiKey) {
        try {
          const results = await searchLocations(query, apiKey);
          setSuggestions(results);
        } catch (e) {
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }
    }, 500);
  };

  const handleSelectSuggestion = (loc: Location) => {
    setLocation(loc);
    setSuggestions([]);
    setIsSidebarOpen(false); // Close mobile sidebar on select
  };

  const handleSelectFavorite = (favLocation: Location) => {
    setLocation(favLocation);
    setIsSidebarOpen(false);
  };
  
  const handleGeolocate = () => {
    if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ name: 'Current Location', lat: latitude, lon: longitude });
            },
            (error) => {
                console.error("Geolocation error:", error);
                setError("Unable to retrieve location. Check permissions.");
                setLoading(false);
            }
        );
    } else {
        setError("Geolocation not supported.");
    }
  };

  const handleAddFavorite = () => {
    if (weatherData && !favorites.some(fav => fav.name === weatherData.location.name)) {
      setFavorites([...favorites, weatherData.location]);
    }
  };

  const handleRemoveFavorite = (favLocation: Location) => {
    setFavorites(favorites.filter(fav => fav.name !== favLocation.name));
  };

  const handleRefresh = () => {
    if (apiKey) loadWeatherData(location, apiKey);
    else setIsSettingsOpen(true);
  };
  
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Background Logic
  const newBackgroundClass = useMemo(() => {
    if (themeMode === 'manual' && manualTheme) return manualTheme.bgClass;
    if (isDarkMode) return 'from-slate-900 via-indigo-950 to-black';
    if (!weatherData) return 'from-blue-400 via-sky-400 to-cyan-300';
    
    const condition = weatherData.current.condition.toLowerCase();
    const isDay = weatherData.current.is_day;

    if (isDay) {
        if (condition.includes('thunder')) return 'from-slate-700 via-slate-600 to-indigo-900';
        if (condition.includes('snow') || condition.includes('sleet')) return 'from-slate-200 via-sky-200 to-blue-200';
        if (condition.includes('rain') || condition.includes('drizzle')) return 'from-sky-700 via-slate-600 to-gray-600';
        if (condition.includes('cloud') || condition.includes('overcast')) return 'from-gray-300 via-slate-300 to-gray-400';
        if (condition.includes('sun') || condition.includes('clear')) return 'from-blue-500 via-cyan-400 to-sky-300';
    } else {
        if (condition.includes('thunder')) return 'from-indigo-950 via-gray-900 to-black';
        if (condition.includes('snow')) return 'from-slate-800 via-cyan-900 to-blue-950';
        if (condition.includes('rain')) return 'from-slate-900 via-indigo-950 to-blue-900';
        if (condition.includes('cloud')) return 'from-slate-800 via-gray-800 to-slate-900';
        if (condition.includes('clear')) return 'from-indigo-950 via-slate-900 to-black';
    }
    return 'from-blue-400 via-sky-400 to-cyan-300';
  }, [weatherData, isDarkMode, themeMode, manualTheme]);

  useEffect(() => {
    const currentActiveClass = isBg1Active ? bg1Class : bg2Class;
    if (newBackgroundClass !== currentActiveClass) {
      if (isBg1Active) setBg2Class(newBackgroundClass);
      else setBg1Class(newBackgroundClass);
      setIsBg1Active(prev => !prev);
    }
  }, [newBackgroundClass, isBg1Active, bg1Class, bg2Class]);

  const useDarkText = useMemo(() => {
    if (themeMode === 'manual' && manualTheme) return manualTheme.darkText;
    if (isDarkMode) return false;
    if (!weatherData) return false; 
    const condition = weatherData.current.condition.toLowerCase();
    const isDay = weatherData.current.is_day;
    return isDay && (condition.includes('snow') || condition.includes('sleet') || condition.includes('mist') || condition.includes('cloud') && !condition.includes('rain'));
  }, [isDarkMode, weatherData, themeMode, manualTheme]);

  return (
    <>
      {/* Background Layers */}
      <div className={`fixed inset-0 bg-gradient-to-br transition-opacity duration-[2000ms] ease-in-out ${bg1Class} ${isBg1Active ? 'opacity-100' : 'opacity-0'} animate-bg-pan`} style={{ backgroundSize: '200% 200%' }} />
      <div className={`fixed inset-0 bg-gradient-to-br transition-opacity duration-[2000ms] ease-in-out ${bg2Class} ${!isBg1Active ? 'opacity-100' : 'opacity-0'} animate-bg-pan`} style={{ backgroundSize: '200% 200%' }} />
      
      {/* Effects Layer */}
      {weatherData && <WeatherEffects condition={weatherData.current.condition} isDay={weatherData.current.is_day} showEffects={showEffects} />}
      
      {/* App Container */}
      <div className={`relative h-screen overflow-hidden flex font-sans ${useDarkText ? 'text-slate-800' : 'text-white'}`}>
        
        {/* Mobile Sidebar Toggle - Visible only on mobile */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-colors ${useDarkText ? 'bg-white/40 text-slate-800' : 'bg-black/30 text-white'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
        </div>

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onQueryChange={handleQueryChange}
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
          onGeolocate={handleGeolocate}
          isSearching={isSearching}
          favorites={favorites}
          onSelectFavorite={handleSelectFavorite}
          onRemoveFavorite={handleRemoveFavorite}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          currentLocation={location}
          onOpenSettings={() => setIsSettingsOpen(true)}
          useDarkText={useDarkText}
          themes={themes}
          themeMode={themeMode}
          onSetThemeMode={setThemeMode}
          manualTheme={manualTheme}
          onSelectManualTheme={handleSelectManualTheme}
        />

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-12 min-h-full flex flex-col justify-center">
            
            {loading && (
              <div className="flex flex-col items-center justify-center h-96 animate-fadeIn">
                <Sun className="w-20 h-20 animate-spin-slow opacity-80" />
                <p className="mt-6 text-xl font-light tracking-widest uppercase opacity-70">Gathering Forecast</p>
              </div>
            )}

            {error && (
                <div className="flex items-center justify-center h-96 animate-fadeIn">
                    <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 p-8 rounded-2xl shadow-2xl max-w-lg text-center">
                        <h2 className="text-3xl font-bold mb-4">Connection Issue</h2>
                        <p className="text-lg opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {!loading && !error && weatherData && (
              <WeatherDisplay
                weatherData={weatherData}
                onAddFavorite={handleAddFavorite}
                isFavorite={favorites.some(fav => fav.name === weatherData.location.name)}
                onRefresh={handleRefresh}
                useDarkText={useDarkText}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
        showEffects={showEffects}
        onToggleEffects={() => setShowEffects(!showEffects)}
      />
    </>
  );
};

export default App;