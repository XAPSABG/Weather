import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { WeatherData } from '../types';
import { getAqiInfo, getWindDirection, getPollutantInfo } from '../utils/weatherUtils';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Sunrise, Sunset, Thermometer, Droplet, Star, StarFilled, RefreshCw, Moon, CloudLightning, AlertTriangle, Radar, NavigationArrow } from './icons';
import WeatherRadar from './WeatherRadar';

interface WeatherDisplayProps {
  weatherData: WeatherData;
  onAddFavorite: () => void;
  isFavorite: boolean;
  onRefresh: () => void;
  useDarkText: boolean;
  isDarkMode: boolean;
}

const WeatherIcon: React.FC<{ condition: string; isDay: boolean; className?: string }> = ({ condition, isDay, className }) => {
  const cond = condition.toLowerCase();
  if (cond.includes('thunder')) return <CloudLightning className={className} />;
  if (cond.includes('sun') || (cond.includes('clear') && isDay)) return <Sun className={className} />;
  if (cond.includes('clear') && !isDay) return <Moon className={className} />;
  if (cond.includes('snow') || cond.includes('sleet')) return <CloudSnow className={className} />;
  if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain className={className} />;
  if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('mist')) return <Cloud className={className} />;
  return <Sun className={className} />;
};

// Reusable Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; className?: string; useDarkText: boolean; delay?: string; title?: React.ReactNode }> = ({ children, className, useDarkText, delay, title }) => (
    <div 
        className={`relative overflow-hidden p-6 rounded-3xl backdrop-blur-xl border shadow-lg transition-all duration-300 hover:shadow-xl ${
            useDarkText ? 'bg-white/30 border-white/40' : 'bg-black/20 border-white/10'
        } ${className}`}
        style={{ animationDelay: delay }}
    >
        {title && <div className={`mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider opacity-60`}>{title}</div>}
        {children}
    </div>
);

const PollutantBar: React.FC<{ name: string; value: number; max: number; color: string }> = ({ name, value, max, color }) => (
    <div className="flex items-center gap-3 text-xs">
        <span className="w-8 font-bold opacity-70">{name}</span>
        <div className="flex-1 h-1.5 bg-current/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (value/max)*100)}%`, backgroundColor: color }} />
        </div>
        <span className="w-8 text-right font-mono">{value}</span>
    </div>
);

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, onAddFavorite, isFavorite, onRefresh, useDarkText, isDarkMode }) => {
  const { location, current, forecast, hourly, astro, alerts } = weatherData;
  
  // Format Chart Data
  const chartData = hourly.slice(0, 24).map(h => ({ name: h.time, temp: h.temp_c }));
  const aqiInfo = getAqiInfo(current.aqi);
  const strokeColor = useDarkText ? '#334155' : '#ffffff';

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Actions */}
      <div className="flex justify-between items-end mb-2">
        <div>
            <div className="flex items-center gap-2 text-sm opacity-70 mb-1">
                <NavigationArrow className="w-3 h-3" />
                <span>{location.lat.toFixed(2)}, {location.lon.toFixed(2)}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter drop-shadow-md">{location.name.split(',')[0]}</h1>
            <p className="text-lg opacity-80 font-medium mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex gap-3">
            <button onClick={onRefresh} className={`p-3 rounded-2xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 ${useDarkText ? 'bg-white/40 hover:bg-white/60' : 'bg-white/10 hover:bg-white/20'}`}>
                <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={onAddFavorite} className={`p-3 rounded-2xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 ${useDarkText ? 'bg-white/40 hover:bg-white/60' : 'bg-white/10 hover:bg-white/20'}`}>
                {isFavorite ? <StarFilled className="w-5 h-5 text-yellow-400" /> : <Star className="w-5 h-5" />}
            </button>
        </div>
      </div>

      {alerts.length > 0 && (
          <div className="w-full bg-red-500/20 backdrop-blur-md border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 animate-slideIn">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                  <h3 className="font-bold text-red-200">Weather Alert</h3>
                  <p className="text-sm opacity-90">{alerts[0]}</p>
              </div>
          </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Main Hero Card (2x2 on large) */}
        <GlassCard useDarkText={useDarkText} className="md:col-span-2 row-span-2 flex flex-col justify-between" delay="0ms">
            <div className="flex justify-between items-start">
                <div className="bg-current/5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">Now</div>
                <WeatherIcon condition={current.condition} isDay={current.is_day} className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl -mr-4 -mt-4 opacity-90" />
            </div>
            <div className="relative z-10">
                <div className="flex items-start">
                    <span className="text-8xl md:text-9xl font-bold tracking-tighter">{current.temp_c}</span>
                    <span className="text-4xl md:text-5xl font-medium mt-4">°</span>
                </div>
                <p className="text-2xl md:text-3xl font-medium opacity-90">{current.condition}</p>
                <div className="flex gap-4 mt-4 text-sm font-semibold opacity-70">
                    <span>H: {forecast[0].maxtemp_c}°</span>
                    <span>L: {forecast[0].mintemp_c}°</span>
                    <span>Feels like {current.feelslike_c}°</span>
                </div>
            </div>
        </GlassCard>

        {/* Hourly Chart (2 cols) */}
        <GlassCard useDarkText={useDarkText} className="md:col-span-2 h-64 md:h-auto" title={<><span className="w-4 h-4 mr-2"><RefreshCw /></span> 24-Hour Forecast</>} delay="100ms">
            <div className="h-full w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: useDarkText ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', 
                                border: 'none', 
                                borderRadius: '12px', 
                                backdropFilter: 'blur(10px)',
                                color: useDarkText ? '#000' : '#fff'
                            }} 
                            itemStyle={{ color: strokeColor }}
                            formatter={(value: any) => [`${value}°`, 'Temp']}
                        />
                        <Area type="monotone" dataKey="temp" stroke={strokeColor} strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: strokeColor, fontSize: 10, opacity: 0.7 }} interval={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>

        {/* Radar Map (1 col) */}
        <GlassCard useDarkText={useDarkText} className="p-0 overflow-hidden relative group h-48 md:h-auto" delay="200ms">
             <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white flex gap-2">
                 <Radar className="w-4 h-4"/> Radar
             </div>
             <div className="w-full h-full opacity-80 transition-opacity group-hover:opacity-100 grayscale-[30%] group-hover:grayscale-0">
                <WeatherRadar lat={location.lat} lon={location.lon} isDarkMode={isDarkMode} />
             </div>
        </GlassCard>

        {/* Air Quality (1 col) */}
        <GlassCard useDarkText={useDarkText} title="Air Quality" delay="300ms">
            <div className="flex flex-col justify-between h-full pb-4">
                <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold">{current.aqi}</span>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${useDarkText ? 'bg-black/10' : 'bg-white/20'}`} style={{ color: aqiInfo.colorValue }}>{aqiInfo.text}</div>
                </div>
                <div className="h-2 w-full bg-current/10 rounded-full mt-4 mb-6 relative overflow-hidden">
                    <div className="absolute h-full rounded-full transition-all duration-1000" style={{ width: `${(current.aqi / 10) * 100}%`, background: `linear-gradient(90deg, #4ade80, #ef4444)` }}></div>
                </div>
                <div className="space-y-2">
                    <PollutantBar name="PM2.5" value={current.pm2_5} max={100} color="#fbbf24" />
                    <PollutantBar name="NO2" value={current.no2} max={200} color="#60a5fa" />
                    <PollutantBar name="O3" value={current.o3} max={150} color="#34d399" />
                </div>
            </div>
        </GlassCard>

        {/* Small Detail Cards (Row of 4) */}
        <GlassCard useDarkText={useDarkText} delay="400ms">
            <div className="flex flex-col h-full justify-between">
                <div className="flex items-center gap-2 text-sm opacity-60 font-bold"><Wind className="w-4 h-4"/> Wind</div>
                <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">{current.wind_kph}</span>
                    <span className="text-sm font-medium mb-1 opacity-70">km/h</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold opacity-80 mt-2">
                     <div style={{ transform: `rotate(${current.wind_degree}deg)` }} className="bg-current/10 p-1 rounded-full"><NavigationArrow className="w-3 h-3"/></div>
                     {getWindDirection(current.wind_degree)}
                </div>
            </div>
        </GlassCard>

        <GlassCard useDarkText={useDarkText} delay="450ms">
            <div className="flex flex-col h-full justify-between">
                <div className="flex items-center gap-2 text-sm opacity-60 font-bold"><Droplet className="w-4 h-4"/> Humidity</div>
                <span className="text-3xl font-bold">{current.humidity}%</span>
                <div className="text-xs opacity-70 mt-2">Dew Point: {current.feelslike_c - 2}°</div>
            </div>
        </GlassCard>

        <GlassCard useDarkText={useDarkText} delay="500ms">
            <div className="flex flex-col h-full justify-between">
                <div className="flex items-center gap-2 text-sm opacity-60 font-bold"><Sun className="w-4 h-4"/> UV Index</div>
                <span className="text-3xl font-bold">{current.uv}</span>
                <div className="text-xs opacity-70 mt-2">{current.uv > 5 ? 'High Protection' : 'Low Protection'}</div>
            </div>
        </GlassCard>

        <GlassCard useDarkText={useDarkText} delay="550ms">
            <div className="flex flex-col h-full justify-between">
                <div className="flex items-center gap-2 text-sm opacity-60 font-bold"><Thermometer className="w-4 h-4"/> Feels Like</div>
                <span className="text-3xl font-bold">{current.feelslike_c}°</span>
                <div className="text-xs opacity-70 mt-2">Actual: {current.temp_c}°</div>
            </div>
        </GlassCard>

        {/* 7 Day Forecast (Vertical List) */}
        <GlassCard useDarkText={useDarkText} className="md:col-span-2 h-full" title="7-Day Forecast" delay="600ms">
            <div className="divide-y divide-current/10">
                {forecast.map((day, i) => (
                    <div key={day.date} className="grid grid-cols-4 items-center py-3 hover:bg-current/5 transition-colors px-2 rounded-lg">
                        <span className="font-medium text-sm">{i === 0 ? 'Today' : new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <div className="flex justify-center"><WeatherIcon condition={day.condition} isDay={true} className="w-6 h-6" /></div>
                        <span className="text-xs opacity-60 col-span-1 truncate px-2 text-center hidden sm:block">{day.condition}</span>
                        <div className="flex justify-end gap-3 text-sm font-semibold">
                            <span className="opacity-50">{day.mintemp_c}°</span>
                            <span>{day.maxtemp_c}°</span>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>

        {/* Sun Times */}
        <GlassCard useDarkText={useDarkText} className="md:col-span-2 flex flex-col justify-center" delay="650ms">
             <div className="flex justify-between items-center px-4">
                 <div className="text-center">
                     <div className="mb-2 opacity-50 text-sm font-bold tracking-wider">SUNRISE</div>
                     <Sunrise className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                     <div className="text-xl font-bold">{astro.sunrise}</div>
                 </div>
                 
                 {/* Visual Arc */}
                 <div className="flex-1 px-8 relative h-20">
                     <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                         <path d="M0,40 Q50,-40 100,40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="opacity-30" vectorEffect="non-scaling-stroke" />
                         <circle cx="50%" cy="0" r="8" fill="#fbbf24" className="shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                     </svg>
                 </div>

                 <div className="text-center">
                     <div className="mb-2 opacity-50 text-sm font-bold tracking-wider">SUNSET</div>
                     <Sunset className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                     <div className="text-xl font-bold">{astro.sunset}</div>
                 </div>
             </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default WeatherDisplay;