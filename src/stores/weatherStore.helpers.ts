import { STORE_CONFIG } from '../constants/store';
import {
  type WeatherData,
  type SearchHistoryItem,
  type WeatherError,
} from '../types';

export const isErrorWithCode = (
  err: unknown
): err is Error & { code?: string } => {
  if (!(err instanceof Error)) return false;
  const errorWithCode = err as Error & { code?: unknown };
  return (
    typeof errorWithCode.code === 'string' || errorWithCode.code === undefined
  );
};

export const isGeolocationError = (
  err: unknown
): err is { code: string; message: string } => {
  if (typeof err !== 'object' || err === null) return false;
  const geoError = err as Record<string, unknown>;
  return (
    'code' in geoError &&
    'message' in geoError &&
    typeof geoError.code === 'string' &&
    typeof geoError.message === 'string'
  );
};

export const createWeatherError = (error: unknown): WeatherError => ({
  message: isErrorWithCode(error)
    ? error.message
    : 'An unexpected error occurred',
  code: isErrorWithCode(error) ? error.code : undefined,
});

export const createGeolocationError = (error: unknown): WeatherError => ({
  message: isErrorWithCode(error)
    ? error.message
    : 'Failed to get your location',
  code: isGeolocationError(error) ? error.code : undefined,
});

export const findExistingHistoryIndex = (
  searchHistory: SearchHistoryItem[],
  weather: WeatherData
): number =>
  searchHistory.findIndex(
    item =>
      item.city.toLowerCase() === weather.city.toLowerCase() &&
      item.country.toLowerCase() === weather.country.toLowerCase()
  );

export const createHistoryItem = (weather: WeatherData): SearchHistoryItem => ({
  id: weather.id,
  city: weather.city,
  country: weather.country,
  searchedAt: Date.now(),
  isRemoved: false,
});

export const buildNewHistory = (
  searchHistory: SearchHistoryItem[],
  historyItem: SearchHistoryItem,
  existingIndex: number
): SearchHistoryItem[] => {
  const { MAX_HISTORY_SIZE } = STORE_CONFIG;

  if (existingIndex < 0) {
    const newHistory = [historyItem, ...searchHistory];
    return newHistory.slice(0, MAX_HISTORY_SIZE);
  }

  if (existingIndex === 0) {
    return [
      { ...searchHistory[0], searchedAt: Date.now() },
      ...searchHistory.slice(1),
    ];
  }

  const newHistory = [
    historyItem,
    ...searchHistory.filter((_, idx) => idx !== existingIndex),
  ];
  return newHistory.slice(0, MAX_HISTORY_SIZE);
};

export const cleanupRecentlyRemoved = (
  recentlyRemoved: SearchHistoryItem[]
): SearchHistoryItem[] => {
  const { MAX_RECENTLY_REMOVED, CLEANUP_TIME } = STORE_CONFIG;
  const now = Date.now();

  return recentlyRemoved
    .filter(item => now - item.searchedAt < CLEANUP_TIME)
    .slice(0, MAX_RECENTLY_REMOVED);
};
