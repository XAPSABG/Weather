interface AqiInfo {
  text: string;
  colorClass: string;
  colorValue: string;
  message: string;
}

export const getAqiInfo = (index: number): AqiInfo => {
  if (index === 1) {
    return {
      text: 'Good',
      colorClass: 'text-green-400',
      colorValue: '#4ade80',
      message: 'Air quality is excellent.',
    };
  }
  if (index === 2) {
    return {
      text: 'Moderate',
      colorClass: 'text-yellow-400',
      colorValue: '#facc15',
      message: 'Acceptable for most individuals.',
    };
  }
  if (index === 3) {
    return {
      text: 'Unhealthy (SG)',
      colorClass: 'text-orange-400',
      colorValue: '#fb923c',
      message: 'Sensitive groups may be affected.',
    };
  }
  if (index === 4) {
    return {
      text: 'Unhealthy',
      colorClass: 'text-red-500',
      colorValue: '#ef4444',
      message: 'Health effects can be felt.',
    };
  }
  if (index === 5) {
    return {
      text: 'Very Unhealthy',
      colorClass: 'text-purple-500',
      colorValue: '#a855f7',
      message: 'Health alert: risk for everyone.',
    };
  }
  if (index >= 6) {
    return {
      text: 'Hazardous',
      colorClass: 'text-rose-700',
      colorValue: '#be123c',
      message: 'Serious risk of health effects.',
    };
  }
  return {
    text: 'Unknown',
    colorClass: 'text-gray-400',
    colorValue: '#9ca3af',
    message: 'AQI data not available.',
  };
};


export const getWindDirection = (degree: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degree / 22.5) % 16;
    return directions[index];
};


interface PollutantInfo {
  name: string;
  percent: number;
  colorValue: string;
}

export const getPollutantInfo = (type: 'PM2.5' | 'O3' | 'NO2', value: number): PollutantInfo => {
  const thresholds = {
    // Thresholds in µg/m³ for Good, Moderate, Unhealthy SG, Unhealthy
    'PM2.5': { name: 'PM₂.₅', thresholds: [12, 35, 55, 150] },
    'O3': { name: 'Ozone', thresholds: [100, 160, 220, 265] },
    'NO2': { name: 'NO₂', thresholds: [100, 200, 400, 600] },
  };

  const colors = ['#4ade80', '#facc15', '#fb923c', '#ef4444', '#a855f7'];
  const { name, thresholds: pollutantThresholds } = thresholds[type];

  let level = 0;
  while (level < pollutantThresholds.length && value > pollutantThresholds[level]) {
    level++;
  }

  const lowerBound = level === 0 ? 0 : pollutantThresholds[level - 1];
  const upperBound = pollutantThresholds[level] || pollutantThresholds[pollutantThresholds.length - 1] * 1.5;

  const percent = Math.min(100, ((value - lowerBound) / (upperBound - lowerBound)) * 100);

  return {
    name,
    percent,
    colorValue: colors[level] || colors[4],
  };
};