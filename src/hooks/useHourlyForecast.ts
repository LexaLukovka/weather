import { useMemo } from 'react';

import { type WeatherData } from '../types';
import { getWeatherIcon } from '../utils';

export const useHourlyForecast = (weather: WeatherData) => {
  const weatherSummary = useMemo(() => {
    const currentHour = new Date().getHours();
    const nextSignificantHour = (currentHour + 3) % 24;
    const formattedHour = String(nextSignificantHour).padStart(2, '0');

    const condition = weather.description || 'Clear';
    const windGust = weather.windGust || weather.windSpeed || 0;
    const feelsLike = weather.feelsLike || weather.temperature;

    return `${condition} conditions expected around ${formattedHour}:00. Wind gusts up to ${windGust.toFixed(0)} m/s are making the temperature feel like ${feelsLike}°.`;
  }, [weather]);

  const hourlyData = useMemo(() => {
    if (!weather.hourlyForecast || !weather.localtime) {
      return [];
    }

    const locationCurrentHour = parseInt(
      weather.localtime.split(' ')[1].split(':')[0],
      10
    );
    const locationCurrentMinute = parseInt(
      weather.localtime.split(' ')[1].split(':')[1],
      10
    );

    const currentHourIndex = weather.hourlyForecast.findIndex(hour => {
      const hourTime = parseInt(hour.time.split(' ')[1].split(':')[0], 10);
      // If we're past the current hour (even by minutes), look for the next hour
      if (locationCurrentMinute > 0) {
        return hourTime > locationCurrentHour;
      }
      return hourTime >= locationCurrentHour;
    });

    if (currentHourIndex === -1) {
      return [];
    }

    return weather.hourlyForecast
      .slice(currentHourIndex, currentHourIndex + 12)
      .map((hour, index) => {
        const hourStr = hour.time.split(' ')[1].split(':')[0];
        const hourTime = parseInt(hourStr, 10);
        const weatherIcon = getWeatherIcon(
          hour.condition.icon,
          hour.condition.text,
          32
        );

        return {
          time: hourTime,
          temp: Math.round(hour.temp_c),
          icon: weatherIcon,
          isNow: index === 0,
        };
      });
  }, [weather]);

  return { weatherSummary, hourlyData };
};
