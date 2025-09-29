import { type LoadingState } from '../types';

export const initialWeatherState = {
  currentWeather: null,
  currentCity: null,
  loadingState: 'idle' as LoadingState,
  error: null,
  searchHistory: [],
  recentlyRemoved: [],
  hasRequestedLocation: false,
  locationPermissionDenied: false,
};
