import { useCallback } from 'react';

import { useWeatherStore } from '../stores';

export const useWeatherRetry = (): (() => Promise<void>) => {
  const {
    currentWeather,
    error,
    searchLocalWeather,
    searchWeather,
    clearError,
  } = useWeatherStore();

  return useCallback(async () => {
    clearError();

    if (error?.code === 'PERMISSION_DENIED') {
      await searchLocalWeather();
    } else if (currentWeather?.isCurrentLocation) {
      await searchLocalWeather();
    } else if (currentWeather?.city) {
      await searchWeather(currentWeather.city);
    } else {
      await searchLocalWeather();
    }
  }, [
    clearError,
    searchWeather,
    searchLocalWeather,
    error?.code,
    currentWeather?.isCurrentLocation,
    currentWeather?.city,
  ]);
};
