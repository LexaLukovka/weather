import { type StateCreator } from 'zustand';

import { geolocationService } from '../services/geolocation';
import { weatherApiService } from '../services/weatherApi';
import { type WeatherData, type SearchHistoryItem } from '../types';

import {
  createWeatherError,
  createGeolocationError,
  isGeolocationError,
  findExistingHistoryIndex,
  createHistoryItem,
  buildNewHistory,
  cleanupRecentlyRemoved,
} from './weatherStore.helpers';
import { initialWeatherState } from './weatherStore.state';
import { type WeatherState } from './weatherStore.types';

export const createWeatherActions: StateCreator<WeatherState> = (set, get) => ({
  ...initialWeatherState,
  searchWeather: async (city: string) => {
    set({
      loadingState: 'loading',
      error: null,
      locationPermissionDenied: false,
    });

    try {
      const weatherData = await weatherApiService.getCurrentWeather(city);
      const { searchHistory } = get();
      const existingIndex = findExistingHistoryIndex(
        searchHistory,
        weatherData
      );
      const historyItem = createHistoryItem(weatherData);
      const newHistory = buildNewHistory(
        searchHistory,
        historyItem,
        existingIndex
      );

      set({
        currentWeather: weatherData,
        currentCity: city,
        loadingState: 'success',
        error: null,
        searchHistory: newHistory,
      });
    } catch (error: unknown) {
      set({
        loadingState: 'error',
        error: createWeatherError(error),
        currentWeather: null,
        currentCity: null,
      });
    }
  },

  searchLocalWeather: async () => {
    set({
      hasRequestedLocation: true,
      loadingState: 'loading',
      error: null,
    });

    try {
      const coords = await geolocationService.getCurrentPosition();
      const weatherData = await weatherApiService.getWeatherByCoordinates(
        coords.latitude,
        coords.longitude
      );

      const { searchHistory } = get();
      const existingIndex = findExistingHistoryIndex(
        searchHistory,
        weatherData
      );
      const historyItem = createHistoryItem(weatherData);
      const newHistory = buildNewHistory(
        searchHistory,
        historyItem,
        existingIndex
      );

      set({
        currentWeather: weatherData,
        currentCity: weatherData.city,
        loadingState: 'success',
        error: null,
        locationPermissionDenied: false,
        searchHistory: newHistory,
      });
    } catch (error: unknown) {
      const isPermissionDenied =
        isGeolocationError(error) && error.code === 'PERMISSION_DENIED';

      set({
        loadingState: 'error',
        error: createGeolocationError(error),
        currentWeather: null,
        currentCity: null,
        locationPermissionDenied: isPermissionDenied,
      });
    }
  },

  clearError: () => set({ error: null }),

  addToHistory: (weather: WeatherData) => {
    const { searchHistory } = get();
    const existingIndex = findExistingHistoryIndex(searchHistory, weather);
    const historyItem = createHistoryItem(weather);
    const newHistory = buildNewHistory(
      searchHistory,
      historyItem,
      existingIndex
    );
    set({ searchHistory: newHistory });
  },

  removeFromHistory: (id: string) => {
    const { searchHistory, recentlyRemoved } = get();
    const itemToRemove = searchHistory.find(item => item.id === id);

    if (!itemToRemove) return;

    const updatedHistory = searchHistory.filter(item => item.id !== id);
    const newRecentlyRemoved = [
      { ...itemToRemove, isRemoved: true },
      ...recentlyRemoved,
    ];
    const cleanedRecentlyRemoved = cleanupRecentlyRemoved(newRecentlyRemoved);

    set({
      searchHistory: updatedHistory,
      recentlyRemoved: cleanedRecentlyRemoved,
    });
  },

  undoRemove: (id: string) => {
    const { searchHistory, recentlyRemoved } = get();
    const itemToRestore = recentlyRemoved.find(item => item.id === id);

    if (!itemToRestore) return;

    const restoredItem = { ...itemToRestore, isRemoved: false };
    const updatedHistory = [restoredItem, ...searchHistory];
    const updatedRecentlyRemoved = recentlyRemoved.filter(
      item => item.id !== id
    );

    set({
      searchHistory: updatedHistory,
      recentlyRemoved: updatedRecentlyRemoved,
    });
  },

  clearHistory: () => {
    set({
      searchHistory: [],
      recentlyRemoved: [],
    });
  },

  searchFromHistory: async (historyItem: SearchHistoryItem) => {
    const { searchWeather } = get();
    await searchWeather(historyItem.city);
  },

  setLocationPermissionDenied: (denied: boolean) => {
    set({ locationPermissionDenied: denied });
  },
});
