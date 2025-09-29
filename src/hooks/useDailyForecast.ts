import { useMemo } from 'react';

import { type WeatherData } from '../types';
import { getWeatherIcon } from '../utils';

export const useDailyForecast = (weather: WeatherData) => {
  const dailyData = useMemo(() => {
    if (!weather.dailyForecast) {
      return [];
    }

    return weather.dailyForecast.map(day => ({
      day: day.day,
      high: day.maxTemp,
      low: day.minTemp,
      icon: getWeatherIcon(day.condition.icon, day.condition.text, 24),
      description: day.condition.text,
    }));
  }, [weather]);

  return { dailyData };
};
