import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../constants';

import { createWeatherActions } from './weatherStore.actions';
import { type WeatherState } from './weatherStore.types';

export const useWeatherStore = create<WeatherState>()(
  persist(createWeatherActions, {
    name: STORAGE_KEYS.WEATHER_STATE,
    partialize: state => ({
      searchHistory: state.searchHistory,
      recentlyRemoved: state.recentlyRemoved,
      hasRequestedLocation: state.hasRequestedLocation,
      locationPermissionDenied: state.locationPermissionDenied,
      currentCity: state.currentCity,
    }),
  })
);
