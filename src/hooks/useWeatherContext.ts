import { useContext } from 'react';

import {
  WeatherContext,
  type WeatherContextValue,
} from '../contexts/WeatherContext';
import { type WeatherData } from '../types';

interface GuaranteedWeatherContextValue {
  weather: WeatherData;
  isLoading: boolean;
  error: string | null;
}

export const useWeatherData = (): WeatherContextValue => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

export const useWeather = (): GuaranteedWeatherContextValue => {
  const context = useWeatherData();
  if (!context.weather) {
    throw new Error(
      'useGuaranteedWeather must be used within a WeatherWrapper'
    );
  }
  return {
    weather: context.weather,
    isLoading: context.isLoading,
    error: context.error,
  };
};
