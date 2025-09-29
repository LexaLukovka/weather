import { useMemo } from 'react';

import { type WeatherData } from '../types';

interface WeatherTheme {
  backgroundClass: string;
  isLightTheme: boolean;
  textContrastClass: string;
}

export const useWeatherTheme = (
  currentWeather: WeatherData | null
): WeatherTheme => {
  return useMemo(() => {
    if (!currentWeather) {
      return {
        backgroundClass: 'weather-gradient',
        isLightTheme: false,
        textContrastClass: '',
      };
    }

    const description = currentWeather.description.toLowerCase();

    const cityLocalTime = currentWeather.localtime;
    let hour = new Date().getHours();

    if (cityLocalTime) {
      try {
        const timePart = cityLocalTime.split(' ')[1];
        if (timePart) {
          const hourPart = timePart.split(':')[0];
          if (hourPart) {
            hour = parseInt(hourPart, 10);
          }
        }
      } catch {
        hour = new Date().getHours();
      }
    }
    const isNight = hour < 5 || hour > 20;

    let backgroundClass = 'weather-gradient';
    if (isNight) {
      backgroundClass = 'weather-gradient-night';
    } else if (description.includes('clear')) {
      backgroundClass = 'weather-gradient-sunny';
    } else if (description.includes('cloud')) {
      backgroundClass = 'weather-gradient-cloudy';
    } else if (
      description.includes('rain') ||
      description.includes('drizzle')
    ) {
      backgroundClass = 'weather-gradient-rainy';
    }

    const isLightTheme =
      !isNight &&
      (description.includes('clear') || description.includes('cloud'));

    return {
      backgroundClass,
      isLightTheme,
      textContrastClass: isLightTheme ? 'text-contrast-dark' : '',
    };
  }, [currentWeather]);
};
