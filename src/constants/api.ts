export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_URL,
  API_KEY: import.meta.env.VITE_WEATHERAPI_KEY || 'demo_key',
  ENDPOINTS: {
    FORECAST: '/forecast.json',
  },
} as const;

export const ERROR_MESSAGES = {
  CITY_NOT_FOUND: 'City not found. Please check the spelling and try again.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  API_ERROR: 'Unable to fetch weather data. Please try again later.',
  INVALID_INPUT: 'Please enter a valid city name.',
  RATE_LIMIT: 'Too many requests. Please try again in a moment.',
} as const;

export const STORAGE_KEYS = {
  WEATHER_STATE: 'weather_app_state',
} as const;
