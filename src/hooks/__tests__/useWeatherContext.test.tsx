import { type ReactNode } from 'react';

import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { WeatherProvider } from '../../contexts/WeatherProvider';
import { useWeatherStore } from '../../stores';
import { type WeatherData } from '../../types';
import { useWeatherData, useWeather } from '../useWeatherContext';

const mockWeatherData: WeatherData = {
  id: 'london-gb-123',
  city: 'London',
  country: 'GB',
  temperature: 20,
  description: 'clear sky',
  minTemperature: 18,
  maxTemperature: 22,
  windSpeed: 3.5,
  humidity: 65,
  icon: '01d',
  timestamp: Date.now(),
};

// Mock the weather store
vi.mock('../../stores/weatherStore', () => ({
  useWeatherStore: vi.fn(() => ({
    currentWeather: mockWeatherData,
    loadingState: 'success',
    error: null,
    searchHistory: [],
    recentlyRemoved: [],
    searchWeather: vi.fn(),
    addToHistory: vi.fn(),
    removeFromHistory: vi.fn(),
    undoRemove: vi.fn(),
    clearHistory: vi.fn(),
    clearError: vi.fn(),
  })),
}));

describe('useWeatherContext hooks', () => {
  const createWrapper = ({ children }: { children: ReactNode }) => (
    <WeatherProvider>{children}</WeatherProvider>
  );

  const mockUseWeatherStore = vi.mocked(useWeatherStore);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock
    mockUseWeatherStore.mockReturnValue({
      currentWeather: mockWeatherData,
      loadingState: 'success',
      error: null,
      searchHistory: [],
      recentlyRemoved: [],
      searchWeather: vi.fn(),
      addToHistory: vi.fn(),
      removeFromHistory: vi.fn(),
      undoRemove: vi.fn(),
      clearHistory: vi.fn(),
      clearError: vi.fn(),
    });
  });

  describe('useWeatherData', () => {
    it('returns weather context value when used within WeatherProvider', () => {
      const { result } = renderHook(() => useWeatherData(), {
        wrapper: createWrapper,
      });

      expect(result.current).toEqual({
        weather: mockWeatherData,
        isLoading: false,
        error: null,
      });
    });

    it('throws error when used outside WeatherProvider', () => {
      expect(() => {
        renderHook(() => useWeatherData());
      }).toThrow('useWeather must be used within a WeatherProvider');
    });
  });

  describe('useWeather', () => {
    it('returns guaranteed weather data when weather exists', () => {
      const { result } = renderHook(() => useWeather(), {
        wrapper: createWrapper,
      });

      expect(result.current).toEqual({
        weather: mockWeatherData,
        isLoading: false,
        error: null,
      });
    });

    it('throws error when weather is null', () => {
      mockUseWeatherStore.mockReturnValue({
        currentWeather: null,
        loadingState: 'idle',
        error: null,
        searchHistory: [],
        recentlyRemoved: [],
        searchWeather: vi.fn(),
        addToHistory: vi.fn(),
        removeFromHistory: vi.fn(),
        undoRemove: vi.fn(),
        clearHistory: vi.fn(),
        clearError: vi.fn(),
      });

      expect(() => {
        renderHook(() => useWeather(), {
          wrapper: createWrapper,
        });
      }).toThrow('useGuaranteedWeather must be used within a WeatherWrapper');
    });

    it('throws error when used outside WeatherProvider', () => {
      expect(() => {
        renderHook(() => useWeather());
      }).toThrow('useWeather must be used within a WeatherProvider');
    });
  });

  describe('loading and error states', () => {
    it('handles loading state correctly', () => {
      mockUseWeatherStore.mockReturnValue({
        currentWeather: mockWeatherData,
        loadingState: 'loading',
        error: null,
        searchHistory: [],
        recentlyRemoved: [],
        searchWeather: vi.fn(),
        addToHistory: vi.fn(),
        removeFromHistory: vi.fn(),
        undoRemove: vi.fn(),
        clearHistory: vi.fn(),
        clearError: vi.fn(),
      });

      const { result } = renderHook(() => useWeatherData(), {
        wrapper: createWrapper,
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('handles error state correctly', () => {
      mockUseWeatherStore.mockReturnValue({
        currentWeather: null,
        loadingState: 'error',
        error: { message: 'API Error', code: 'API_ERROR' },
        searchHistory: [],
        recentlyRemoved: [],
        searchWeather: vi.fn(),
        addToHistory: vi.fn(),
        removeFromHistory: vi.fn(),
        undoRemove: vi.fn(),
        clearHistory: vi.fn(),
        clearError: vi.fn(),
      });

      const { result } = renderHook(() => useWeatherData(), {
        wrapper: createWrapper,
      });

      expect(result.current.error).toBe('API Error');
      expect(result.current.isLoading).toBe(false);
    });

    it('handles success state correctly', () => {
      mockUseWeatherStore.mockReturnValue({
        currentWeather: mockWeatherData,
        loadingState: 'success',
        error: null,
        searchHistory: [],
        recentlyRemoved: [],
        searchWeather: vi.fn(),
        addToHistory: vi.fn(),
        removeFromHistory: vi.fn(),
        undoRemove: vi.fn(),
        clearHistory: vi.fn(),
        clearError: vi.fn(),
      });

      const { result } = renderHook(() => useWeatherData(), {
        wrapper: createWrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.weather).toEqual(mockWeatherData);
    });
  });
});
