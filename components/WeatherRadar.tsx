import React from 'react';

interface WeatherRadarProps {
  lat: number;
  lon: number;
  isDarkMode: boolean;
}

const WeatherRadar: React.FC<WeatherRadarProps> = ({ lat, lon, isDarkMode }) => {
  // RainViewer color schemes: 2 = Dark, 3 = White
  const colorScheme = isDarkMode ? 2 : 3;
  const zoom = 8;
  
  // Construct the URL for the iframe embed
  const radarUrl = `https://www.rainviewer.com/map.html?loc=${lat},${lon},${zoom}&o=80&c=${colorScheme}&t=1&l=1,1,0,2,0,0&s=1`;

  return (
    <iframe
      key={`${lat}-${lon}-${isDarkMode}`} // Force re-render on location or theme change
      src={radarUrl}
      width="100%"
      height="100%"
      frameBorder="0"
      allowFullScreen
      className="bg-transparent"
      title="Weather Radar Map"
    />
  );
};

export default WeatherRadar;
