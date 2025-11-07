import type { WeatherData, Location, ForecastDay, HourlyData } from '../types';

const API_BASE_URL = 'https://api.weatherapi.com/v1';

// Adapter function to convert WeatherAPI response to our internal WeatherData format
const adaptWeatherData = (data: any): WeatherData => {
  const { location, current, forecast, alerts } = data;
  
  const hourlyData: HourlyData[] = forecast.forecastday[0].hour.map((hour: any) => ({
    time: new Date(hour.time_epoch * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    temp_c: Math.round(hour.temp_c),
    condition: hour.condition.text,
    precip_prob: hour.chance_of_rain,
  }));
  
  const forecastData: ForecastDay[] = forecast.forecastday.map((day: any) => ({
    date: day.date,
    maxtemp_c: Math.round(day.day.maxtemp_c),
    mintemp_c: Math.round(day.day.mintemp_c),
    condition: day.day.condition.text,
  }));

  const airQuality = current.air_quality || {};

  return {
    location: {
      name: `${location.name}, ${location.region}`,
      lat: location.lat,
      lon: location.lon,
    },
    current: {
      temp_c: Math.round(current.temp_c),
      feelslike_c: Math.round(current.feelslike_c),
      humidity: current.humidity,
      wind_kph: current.wind_kph,
      wind_degree: current.wind_degree,
      uv: current.uv,
      condition: current.condition.text,
      is_day: current.is_day === 1,
      aqi: airQuality['us-epa-index'],
      co: airQuality.co,
      o3: airQuality.o3,
      no2: airQuality.no2,
      so2: airQuality.so2,
      pm2_5: airQuality.pm2_5,
      pm10: airQuality.pm10,
    },
    forecast: forecastData,
    hourly: hourlyData,
    astro: {
      sunrise: forecast.forecastday[0].astro.sunrise,
      sunset: forecast.forecastday[0].astro.sunset,
    },
    alerts: alerts.alert.map((a: any) => a.headline),
  };
};


const fetchRealWeatherData = async (location: Location, apiKey: string): Promise<WeatherData> => {
  const query = `${location.lat},${location.lon}`;
  const url = `${API_BASE_URL}/forecast.json?key=${apiKey}&q=${query}&days=7&aqi=yes&alerts=yes`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`[${response.status}] ${errorData.error.message}` || 'Failed to fetch weather data from API.');
  }
  
  const data = await response.json();
  return adaptWeatherData(data);
};

export const searchLocations = async (query: string, apiKey: string): Promise<Location[]> => {
    if (query.length < 3) return [];
    const url = `${API_BASE_URL}/search.json?key=${apiKey}&q=${query}`;
  
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch locations');
      return [];
    }
    const data = await response.json();
    // Adapt the response to our Location type, making the name more descriptive
    return data.map((loc: any) => ({
      name: [loc.name, loc.region, loc.country].filter(Boolean).join(', '),
      lat: loc.lat,
      lon: loc.lon,
    }));
  };

export const fetchWeatherData = async (location: Location, apiKey: string): Promise<WeatherData> => {
  console.log(`Fetching data for ${location.name}`);
  
  if (!apiKey) {
    throw new Error("Weather API key not provided.");
  }
  
  const weather = await fetchRealWeatherData(location, apiKey);

  return weather;
};
