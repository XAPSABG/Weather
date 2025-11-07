
export interface Location {
  name: string;
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  temp_c: number;
  feelslike_c: number;
  humidity: number;
  wind_kph: number;
  wind_degree: number;
  uv: number;
  condition: string;
  is_day: boolean;
  aqi: number;
  co: number;
  o3: number;
  no2: number;
  so2: number;
  pm2_5: number;
  pm10: number;
}

export interface HourlyData {
  time: string;
  temp_c: number;
  condition: string;
  precip_prob: number;
}

export interface ForecastDay {
  date: string;
  maxtemp_c: number;
  mintemp_c: number;
  condition: string;
}

export interface Astro {
    sunrise: string;
    sunset: string;
}

export interface WeatherData {
  location: Location;
  current: CurrentWeather;
  forecast: ForecastDay[];
  hourly: HourlyData[];
  astro: Astro;
  alerts: string[];
}