import { createContext } from 'react';

import { type WeatherData } from '../types';

export interface WeatherContextValue {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

export const WeatherContext = createContext<WeatherContextValue | null>(null);
