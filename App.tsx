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
  { name: 'Sunny Day', bgClass: 'from-sky-500 via-cyan-400 to-blue-500', gradientCss: 'linear-gradient(to bottom right, #0ea5e9, #22d3ee, #3b82f6)', darkText: false },
  { name: 'Misty Morning', bgClass: 'from-gray-300 via-sky-300 to-slate-400', gradientCss: 'linear-gradient(to bottom right, #d1d5db, #7dd3fc, #94a3b8)', darkText: true },
  { name: 'Stormy Sky', bgClass: 'from-slate-700 via-gray-500 to-indigo-800', gradientCss: 'linear-gradient(to bottom right, #334155, #6b7280, #3730a3)', darkText: false },
  { name: 'Starry Night', bgClass: 'from-indigo-900 via-slate-900 to-black', gradientCss: 'linear-gradient(to bottom right, #312e81, #0f172a, #000000)', darkText: false },
  { name: 'Crimson Sunset', bgClass: 'from-red-500 via-orange-600 to-yellow-500', gradientCss: 'linear-gradient(to bottom right, #ef4444, #ea580c, #eab308)', darkText: false },
  { name: 'Aurora Borealis', bgClass: 'from-green-900 via-teal-800 to-indigo-900', gradientCss: 'linear-gradient(to bottom right, #14532d, #115e59, #312e81)', darkText: false },
  { name: 'Cyberpunk City', bgClass: 'from-fuchsia-900 via-purple-800 to-indigo-900', gradientCss: 'linear-gradient(to bottom right, #701a75, #6b21a8, #312e81)', darkText: false },
  { name: 'Ocean Deep', bgClass: 'from-cyan-800 via-blue-900 to-slate-900', gradientCss: 'linear-gradient(to bottom right, #155e75, #1e3a8a, #0f172a)', darkText: false },
  { name: 'Minty Fresh', bgClass: 'from-emerald-300 via-teal-300 to-cyan-400', gradientCss: 'linear-gradient(to bottom right, #6ee7b7, #5eead4, #22d3ee)', darkText: true },
];


const App: React.FC = () => {
  const [location, setLocation] = useState<Location>({ name: 'New York', lat: 40.71, lon: -74.00 });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Location[]>(() => {
    const savedFavorites = localStorage.getItem('weatherFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [{ name: 'London, City of London, Greater London, United Kingdom', lat: 51.52, lon: -0.11 }];
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

  // State for smooth background transitions
  const [bg1Class, setBg1Class] = useState('from-sky-400 to-cyan-300');
  const [bg2Class, setBg2Class] = useState('from-sky-400 to-cyan-300');
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
        setError(err.message || 'Failed to fetch weather data. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!apiKey) {
      setError('Welcome! Please configure your Weather API key in the settings to fetch live data.');
      setIsSettingsOpen(true);
      setLoading(false);
    } else {
       loadWeatherData(location, apiKey);
    }
  }, [location, apiKey, loadWeatherData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
        if (apiKey && location) {
            console.log("Auto-refreshing weather data...");
            loadWeatherData(location, apiKey);
        }
    }, 10 * 60 * 1000); // Auto-refresh every 10 minutes

    return () => clearInterval(intervalId);
  }, [location, apiKey, loadWeatherData]);


  useEffect(() => {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
  }, [favorites]);
  
  useEffect(() => {
    localStorage.setItem('weatherEffectsEnabled', JSON.stringify(showEffects));
  }, [showEffects]);

  useEffect(() => {
    localStorage.setItem('weatherThemeMode', themeMode);
  }, [themeMode]);

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
    setError(null); // Clear previous errors
  };
  
  const handleQueryChange = (query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
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
          console.error("Search failed", e);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }
    }, 500); // 500ms debounce
  };

  const handleSelectSuggestion = (loc: Location) => {
    setLocation(loc);
    setSuggestions([]);
  };

  const handleSelectFavorite = (favLocation: Location) => {
    setLocation(favLocation);
  };
  
  const handleGeolocate = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ name: 'Your Location', lat: latitude, lon: longitude });
            },
            (error) => {
                console.error("Geolocation error:", error);
                setError("Unable to retrieve your location. Please check your browser permissions.");
            }
        );
    } else {
        setError("Geolocation is not supported by your browser.");
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
    if (apiKey) {
        loadWeatherData(location, apiKey);
    } else {
        setError('Cannot refresh. API key is not set.');
        setIsSettingsOpen(true);
    }
  };
  
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleToggleEffects = () => {
    setShowEffects(prev => !prev);
  };
  
  const handleSelectManualTheme = (theme: Theme) => {
    setManualTheme(theme);
    setThemeMode('manual');
  };

  const newBackgroundClass = useMemo(() => {
    if (themeMode === 'manual' && manualTheme) {
      return manualTheme.bgClass;
    }

    if (isDarkMode) {
      return 'from-gray-900 via-indigo-900 to-slate-900';
    }
    
    if (!weatherData) return 'from-sky-400 to-cyan-300';
    
    const condition = weatherData.current.condition.toLowerCase();
    const isDay = weatherData.current.is_day;

    if (isDay) {
        if (condition.includes('thunder')) return 'from-slate-700 via-gray-500 to-indigo-800';
        if (condition.includes('snow') || condition.includes('sleet')) return 'from-gray-300 via-sky-300 to-slate-400';
        if (condition.includes('rain') || condition.includes('drizzle')) return 'from-sky-800 via-slate-600 to-gray-700';
        if (condition.includes('cloud') || condition.includes('overcast')) return 'from-gray-400 via-slate-400 to-gray-500';
        if (condition.includes('sun') || condition.includes('clear')) return 'from-sky-500 via-cyan-400 to-blue-500';
    } else { // Night
        if (condition.includes('thunder')) return 'from-indigo-900 via-slate-900 to-black';
        if (condition.includes('snow') || condition.includes('sleet')) return 'from-slate-800 via-gray-700 to-cyan-900';
        if (condition.includes('rain') || condition.includes('drizzle')) return 'from-slate-900 via-indigo-900 to-blue-900';
        if (condition.includes('cloud') || condition.includes('overcast')) return 'from-slate-800 via-gray-800 to-gray-900';
        if (condition.includes('clear')) return 'from-indigo-900 via-slate-900 to-black';
    }
    
    return 'from-sky-400 to-cyan-300'; // Default fallback
  }, [weatherData, isDarkMode, themeMode, manualTheme]);

  // Effect to handle the background transition
  useEffect(() => {
    const currentActiveClass = isBg1Active ? bg1Class : bg2Class;
    if (newBackgroundClass !== currentActiveClass) {
      if (isBg1Active) {
        setBg2Class(newBackgroundClass);
      } else {
        setBg1Class(newBackgroundClass);
      }
      setIsBg1Active(prev => !prev);
    }
  }, [newBackgroundClass, isBg1Active, bg1Class, bg2Class]);

  const useDarkText = useMemo(() => {
    if (themeMode === 'manual' && manualTheme) {
        return manualTheme.darkText;
    }
      
    if (isDarkMode) return false;
    if (!weatherData) return false; 
    
    const condition = weatherData.current.condition.toLowerCase();
    const isDay = weatherData.current.is_day;
    
    return isDay && (condition.includes('snow') || condition.includes('sleet'));
  }, [isDarkMode, weatherData, themeMode, manualTheme]);

  const chartStrokeColor = useDarkText ? '#334155' : 'rgba(255, 255, 255, 0.7)';

  return (
    <>
      <div className={`fixed inset-0 bg-gradient-to-br transition-opacity duration-1000 ${bg1Class} ${isBg1Active ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`fixed inset-0 bg-gradient-to-br transition-opacity duration-1000 ${bg2Class} ${!isBg1Active ? 'opacity-100' : 'opacity-0'}`}></div>
      {weatherData && <WeatherEffects condition={weatherData.current.condition} isDay={weatherData.current.is_day} showEffects={showEffects} />}
      
      <div className={`relative min-h-screen font-sans ${useDarkText ? 'text-slate-800' : 'text-white'} flex flex-col lg:flex-row`}>
        <Sidebar
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
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-full animate-fadeIn">
              <div className="text-center">
                  <Sun className="w-16 h-16 mx-auto animate-spin-slow text-white/80" />
                  <p className="mt-4 text-xl tracking-wide">Fetching Weather Wisdom...</p>
              </div>
            </div>
          )}
          {error && (
              <div className="flex items-center justify-center h-full animate-fadeIn">
                   <div className="bg-red-500/80 backdrop-blur-sm p-6 rounded-lg shadow-xl text-center max-w-md text-white">
                      <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                      <p>{error}</p>
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
              chartStrokeColor={chartStrokeColor}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
        showEffects={showEffects}
        onToggleEffects={handleToggleEffects}
      />
    </>
  );
};

export default App;
