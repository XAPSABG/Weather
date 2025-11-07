import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
  chartStrokeColor: string;
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
  return <Sun className={className} />; // Default icon
};

const Card: React.FC<{ children: React.ReactNode, className?: string, useDarkText: boolean, style?: React.CSSProperties }> = ({ children, className, useDarkText, style }) => (
    <div 
        className={`${useDarkText ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'} dark:bg-black/20 backdrop-blur-2xl border rounded-2xl p-6 shadow-lg animate-slideIn ${className}`}
        style={style}
    >
        {children}
    </div>
);

const SunriseSunsetTimeline: React.FC<{ sunrise: string, sunset: string, useDarkText: boolean }> = ({ sunrise, sunset, useDarkText }) => {
    const parseTime = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (hours === 12) hours = 0; // handle 12 AM/PM
        if (modifier === 'PM') hours += 12;
        return hours * 60 + minutes;
    };

    const sunriseMinutes = parseTime(sunrise);
    const sunsetMinutes = parseTime(sunset);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const totalDaylight = sunsetMinutes - sunriseMinutes;
    const elapsed = Math.max(0, Math.min(totalDaylight, nowMinutes - sunriseMinutes));
    const progress = totalDaylight > 0 ? (elapsed / totalDaylight) * 100 : 0;
    
    const angle = -90 + (progress / 100) * 180;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-48 h-24 mb-2">
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                    <path d="M 5 45 A 45 45 0 0 1 95 45" fill="none" stroke={useDarkText ? 'rgba(51, 65, 85, 0.2)' : 'rgba(255, 255, 255, 0.2)'} strokeWidth="2" strokeDasharray="2,2" />
                </svg>
                <div className="absolute inset-0 flex items-end justify-center" style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'bottom center', transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
                    <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-[0_0_15px_5px] shadow-yellow-400/50" style={{ transform: 'translateY(-22px)' }} />
                </div>
            </div>
            <div className={`w-full flex justify-between text-sm font-semibold ${useDarkText ? 'text-slate-600' : 'text-white/80'}`}>
                <div className="flex items-center gap-1"><Sunrise className="w-4 h-4"/>{sunrise}</div>
                <div className="flex items-center gap-1">{sunset}<Sunset className="w-4 h-4"/></div>
            </div>
        </div>
    );
};

// FIX: Changed `name` prop type from `string` to be more specific to match `getPollutantInfo` function signature.
const PollutantDisplay: React.FC<{ name: 'PM2.5' | 'O3' | 'NO2', value?: number, useDarkText: boolean }> = ({ name, value, useDarkText }) => {
    if (value === undefined) return null;
    const info = getPollutantInfo(name, value);
    const barBg = useDarkText ? 'bg-slate-200' : 'bg-white/20';

    return (
        <div className="text-sm">
            <div className="flex justify-between mb-1">
                <span className={`font-medium ${useDarkText ? 'text-slate-700' : 'text-white/80'}`}>{info.name}</span>
                <span className="font-semibold">{value.toFixed(1)} <span className="text-xs opacity-70">µg/m³</span></span>
            </div>
            <div className={`w-full h-2 ${barBg} rounded-full overflow-hidden`}>
                <div className="h-full rounded-full" style={{ width: `${info.percent}%`, backgroundColor: info.colorValue, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
        </div>
    );
};


const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, onAddFavorite, isFavorite, onRefresh, useDarkText, chartStrokeColor, isDarkMode }) => {
  const { location, current, forecast, hourly, astro, alerts } = weatherData;

  const chartData = hourly.slice(0, 12).map(h => ({ name: h.time.split(' ')[0], temp: h.temp_c }));

  const buttonClass = `transition-all duration-300 active:scale-95 ${useDarkText ? 'bg-black/5 hover:bg-black/10' : 'bg-white/10 hover:bg-white/20'}`;
  const disabledButtonClass = useDarkText ? 'disabled:bg-black/5' : 'disabled:bg-white/5';
  const secondaryTextClass = useDarkText ? 'text-slate-700' : 'text-white/80';
  const primaryBorderClass = useDarkText ? 'border-black/10' : 'border-white/10';
  const aqiInfo = getAqiInfo(current.aqi);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-fadeIn">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold drop-shadow-lg">{location.name}</h2>
          <p className={`${secondaryTextClass} drop-shadow-md`}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center space-x-3">
            <button onClick={onRefresh} className={`p-3 ${buttonClass} rounded-xl`}>
                <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={onAddFavorite} disabled={isFavorite} className={`flex items-center space-x-2 px-4 py-3 ${buttonClass} ${disabledButtonClass} rounded-xl disabled:cursor-not-allowed`}>
              {isFavorite ? <StarFilled className="w-5 h-5 text-yellow-400" /> : <Star className="w-5 h-5" />}
              <span className="font-semibold">{isFavorite ? 'Favorite' : 'Add Favorite'}</span>
            </button>
        </div>
      </div>
      
      {alerts.length > 0 && (
          <Card useDarkText={useDarkText} className="!bg-gradient-to-r from-yellow-500/30 to-red-400/20" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 text-lg font-bold mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h3>Alerts</h3>
              </div>
              <div className="max-h-24 overflow-y-auto text-sm pr-2">
                {alerts.map((alert, i) => <p key={i} className="mb-1">{alert}</p>)}
              </div>
          </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Current Weather */}
        <Card useDarkText={useDarkText} className="lg:col-span-3" style={{ animationDelay: '150ms' }}>
            <div className="flex justify-between items-start">
                <div>
                    <p className={`text-xl ${secondaryTextClass}`}>{current.condition}</p>
                    <div className="flex items-start">
                        <p className="text-8xl sm:text-9xl font-bold drop-shadow-md">{current.temp_c}</p>
                        <p className="text-3xl font-bold mt-3">°C</p>
                    </div>
                </div>
                <WeatherIcon condition={current.condition} isDay={current.is_day} className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-lg" />
            </div>
        </Card>

        {/* Details Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 grid-rows-2 gap-6">
            <Card useDarkText={useDarkText} style={{ animationDelay: '200ms' }}>
                <div className={`flex items-center justify-between ${secondaryTextClass} mb-2`}>
                    <p className="text-sm">Feels Like</p>
                    <Thermometer className="w-5 h-5" />
                </div>
                <p className="text-3xl font-semibold">{current.feelslike_c}°C</p>
            </Card>
            <Card useDarkText={useDarkText} style={{ animationDelay: '250ms' }}>
                <div className={`flex items-center justify-between ${secondaryTextClass} mb-2`}>
                    <p className="text-sm">Wind</p>
                    <Wind className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-3xl font-semibold">{current.wind_kph}<span className="text-lg ml-1">kph</span></p>
                   <div className="flex items-center gap-1 font-semibold">
                      <NavigationArrow className="w-5 h-5" style={{ transform: `rotate(${current.wind_degree}deg)` }}/>
                      {getWindDirection(current.wind_degree)}
                   </div>
                </div>
            </Card>
            <Card useDarkText={useDarkText} style={{ animationDelay: '300ms' }}>
                <div className={`flex items-center justify-between ${secondaryTextClass} mb-2`}>
                    <p className="text-sm">Humidity</p>
                    <Droplet className="w-5 h-5" />
                </div>
                <p className="text-3xl font-semibold">{current.humidity}%</p>
            </Card>
            <Card useDarkText={useDarkText} style={{ animationDelay: '350ms' }}>
                <div className={`flex items-center justify-between ${secondaryTextClass} mb-2`}>
                    <p className="text-sm">UV Index</p>
                    <Sun className="w-5 h-5" />
                </div>
                <p className="text-3xl font-semibold">{current.uv}</p>
            </Card>
        </div>
      </div>
      
      {/* Hourly Forecast & Chart */}
      <Card useDarkText={useDarkText} style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-bold mb-4">Hourly Forecast</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={useDarkText ? 'rgba(48, 63, 89, 0.1)' : 'rgba(255, 255, 255, 0.1)'} />
              <XAxis dataKey="name" stroke={chartStrokeColor} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={chartStrokeColor} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: useDarkText ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '10px', boxShadow: '0 4px 30px rgba(0,0,0,0.1)' }} labelStyle={{ color: useDarkText ? '#000' : '#fff' }} itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}/>
              <Line type="monotone" dataKey="temp" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4, fill: '#a78bfa' }} activeDot={{ r: 8, stroke: useDarkText ? '#334155' : '#fff', strokeWidth: 2, fill: '#a78bfa' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* 7-Day Forecast */}
      <Card useDarkText={useDarkText} style={{ animationDelay: '500ms' }}>
        <h3 className="text-lg font-bold mb-4">7-Day Forecast</h3>
        <div className="space-y-3">
          {forecast.map(day => (
            <div key={day.date} className={`grid grid-cols-[1fr_auto_1fr_auto] sm:grid-cols-[1fr_auto_1fr_auto] items-center gap-4 text-sm sm:text-base border-b ${primaryBorderClass} pb-3 last:border-b-0`}>
                <p className="font-medium">{new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}</p>
                <WeatherIcon condition={day.condition} isDay={true} className="w-8 h-8" />
                <p className={`${secondaryTextClass} hidden sm:block`}>{day.condition}</p>
                <p className="justify-self-end font-semibold">{day.mintemp_c}° / {day.maxtemp_c}°C</p>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Weather Radar */}
      <Card useDarkText={useDarkText} style={{ animationDelay: '600ms' }}>
        <div className="flex items-center gap-2 text-lg font-bold mb-4">
          <Radar className="w-5 h-5" />
          <h3>Weather Radar</h3>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <WeatherRadar lat={location.lat} lon={location.lon} isDarkMode={isDarkMode} />
        </div>
      </Card>


      {/* Astro & AQI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Card useDarkText={useDarkText} style={{ animationDelay: '700ms' }}>
              <h3 className="text-lg font-bold mb-4">Sunrise & Sunset</h3>
              <SunriseSunsetTimeline sunrise={astro.sunrise} sunset={astro.sunset} useDarkText={useDarkText} />
          </Card>
          <Card useDarkText={useDarkText} style={{ animationDelay: '750ms' }}>
              <h3 className="text-lg font-bold mb-4">Air Quality & Pollutants</h3>
               <div className="flex flex-col sm:flex-row items-center justify-center h-full sm:gap-6 gap-4">
                  <div className="text-center flex-shrink-0">
                      <div className="relative flex items-center justify-center">
                        <p className="absolute text-4xl font-bold drop-shadow-md">{current.aqi}</p>
                        <svg className="w-24 h-24" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke={useDarkText ? 'rgba(51, 65, 85, 0.1)' : 'rgba(255, 255, 255, 0.1)'} strokeWidth="10" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke={aqiInfo.colorValue} strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * (current.aqi / 6))} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}/>
                        </svg>
                      </div>
                      <p className={`font-semibold text-lg ${aqiInfo.colorClass}`}>{aqiInfo.text}</p>
                      <p className={`text-xs max-w-[120px] mx-auto ${secondaryTextClass}`}>{aqiInfo.message}</p>
                  </div>
                  <div className="w-full space-y-3">
                      <PollutantDisplay name="PM2.5" value={current.pm2_5} useDarkText={useDarkText} />
                      <PollutantDisplay name="O3" value={current.o3} useDarkText={useDarkText} />
                      <PollutantDisplay name="NO2" value={current.no2} useDarkText={useDarkText} />
                  </div>
              </div>
          </Card>
      </div>

    </div>
  );
};

export default WeatherDisplay;
