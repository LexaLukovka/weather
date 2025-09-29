import { type FC, type ReactNode } from 'react';

import { useWeatherStore } from '../stores';

import { WeatherContext, type WeatherContextValue } from './WeatherContext';

interface WeatherProviderProps {
  children: ReactNode;
}

export const WeatherProvider: FC<WeatherProviderProps> = ({ children }) => {
  const { currentWeather, loadingState, error } = useWeatherStore();

  const value: WeatherContextValue = {
    weather: currentWeather,
    isLoading: loadingState === 'loading',
    error: error?.message || null,
  };

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
};
