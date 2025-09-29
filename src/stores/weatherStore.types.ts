import {
  type WeatherData,
  type SearchHistoryItem,
  type LoadingState,
  type WeatherError,
} from '../types';

export interface WeatherState {
  // Data state
  currentWeather: WeatherData | null;
  currentCity: string | null;
  loadingState: LoadingState;
  error: WeatherError | null;
  searchHistory: SearchHistoryItem[];
  recentlyRemoved: SearchHistoryItem[];

  // Location state
  hasRequestedLocation: boolean;
  locationPermissionDenied: boolean;

  // Weather actions
  searchWeather: (city: string) => Promise<void>;
  searchLocalWeather: () => Promise<void>;
  clearError: () => void;

  // History actions
  addToHistory: (weather: WeatherData) => void;
  removeFromHistory: (id: string) => void;
  undoRemove: (id: string) => void;
  clearHistory: () => void;
  searchFromHistory: (historyItem: SearchHistoryItem) => Promise<void>;

  // Location actions
  setLocationPermissionDenied: (denied: boolean) => void;
}
