import { describe, it, expect, beforeEach, vi } from 'vitest';

import { type WeatherData } from '../../types';
import { useWeatherStore } from '../weatherStore';

// Mock the weather service
vi.mock('../../services/weatherApi', () => ({
  weatherApiService: {
    getCurrentWeather: vi.fn(),
    getWeatherByCoordinates: vi.fn(),
  },
}));

const mockWeatherData: WeatherData = {
  id: 'london-gb-123456',
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

describe('WeatherStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useWeatherStore.setState({
      currentWeather: null,
      loadingState: 'idle',
      error: null,
      searchHistory: [],
      recentlyRemoved: [],
    });
    vi.clearAllMocks();
  });

  describe('searchWeather', () => {
    it('should search weather and update state on success', async () => {
      const { weatherApiService } = await import('../../services/weatherApi');
      vi.mocked(weatherApiService.getCurrentWeather).mockResolvedValue(
        mockWeatherData
      );

      const store = useWeatherStore.getState();
      await store.searchWeather('London');

      const newState = useWeatherStore.getState();
      expect(newState.currentWeather).toEqual(mockWeatherData);
      expect(newState.loadingState).toBe('success');
      expect(newState.error).toBeNull();
      expect(newState.searchHistory).toHaveLength(1);
      expect(newState.searchHistory[0].city).toBe('London');
    });

    it('should handle search errors', async () => {
      const { weatherApiService } = await import('../../services/weatherApi');
      const error = new Error('City not found') as Error & { code?: string };
      error.code = 'CITY_NOT_FOUND';
      vi.mocked(weatherApiService.getCurrentWeather).mockRejectedValue(error);

      const store = useWeatherStore.getState();
      await store.searchWeather('InvalidCity');

      const newState = useWeatherStore.getState();
      expect(newState.currentWeather).toBeNull();
      expect(newState.loadingState).toBe('error');
      expect(newState.error).toEqual({
        message: 'City not found',
        code: 'CITY_NOT_FOUND',
      });
    });

    it('should set loading state during search', async () => {
      const { weatherApiService } = await import('../../services/weatherApi');
      let resolvePromise: (value: WeatherData) => void;
      const promise = new Promise<WeatherData>(resolve => {
        resolvePromise = resolve;
      });
      vi.mocked(weatherApiService.getCurrentWeather).mockReturnValue(promise);

      const store = useWeatherStore.getState();
      const searchPromise = store.searchWeather('London');

      // Check loading state is set immediately
      expect(useWeatherStore.getState().loadingState).toBe('loading');

      // Resolve the promise
      resolvePromise!(mockWeatherData);
      await searchPromise;

      expect(useWeatherStore.getState().loadingState).toBe('success');
    });
  });

  describe('addToHistory', () => {
    it('should add new city to history', () => {
      const store = useWeatherStore.getState();
      store.addToHistory(mockWeatherData);

      const newState = useWeatherStore.getState();
      expect(newState.searchHistory).toHaveLength(1);
      expect(newState.searchHistory[0]).toEqual({
        id: mockWeatherData.id,
        city: mockWeatherData.city,
        country: mockWeatherData.country,
        searchedAt: expect.any(Number),
        isRemoved: false,
      });
    });

    it('should move existing city to front and update timestamp', () => {
      const store = useWeatherStore.getState();

      // Add initial city
      store.addToHistory(mockWeatherData);

      // Add another city
      const parisData: WeatherData = {
        ...mockWeatherData,
        id: 'paris-fr-123',
        city: 'Paris',
        country: 'FR',
      };
      store.addToHistory(parisData);

      // Add London again
      const newLondonData: WeatherData = {
        ...mockWeatherData,
        id: 'london-gb-456',
        timestamp: Date.now() + 1000,
      };
      store.addToHistory(newLondonData);

      const state = useWeatherStore.getState();
      expect(state.searchHistory).toHaveLength(2);
      expect(state.searchHistory[0].city).toBe('London');
      expect(state.searchHistory[1].city).toBe('Paris');
    });

    it('should limit history to 10 items', () => {
      const store = useWeatherStore.getState();

      // Add 11 cities
      for (let i = 0; i < 11; i++) {
        const cityData: WeatherData = {
          ...mockWeatherData,
          id: `city${i}-id`,
          city: `City${i}`,
          country: 'US',
        };
        store.addToHistory(cityData);
      }

      const state = useWeatherStore.getState();
      expect(state.searchHistory).toHaveLength(10);
      expect(state.searchHistory[0].city).toBe('City10'); // Most recent first
    });
  });

  describe('removeFromHistory', () => {
    it('should remove city from history and add to recently removed', () => {
      const store = useWeatherStore.getState();
      store.addToHistory(mockWeatherData);

      const historyId = useWeatherStore.getState().searchHistory[0].id;
      store.removeFromHistory(historyId);

      const state = useWeatherStore.getState();
      expect(state.searchHistory).toHaveLength(0);
      expect(state.recentlyRemoved).toHaveLength(1);
      expect(state.recentlyRemoved[0].city).toBe('London');
      expect(state.recentlyRemoved[0].isRemoved).toBe(true);
    });

    it('should not error when removing non-existent item', () => {
      const store = useWeatherStore.getState();

      expect(() => store.removeFromHistory('non-existent-id')).not.toThrow();

      const state = useWeatherStore.getState();
      expect(state.searchHistory).toHaveLength(0);
      expect(state.recentlyRemoved).toHaveLength(0);
    });
  });

  describe('undoRemove', () => {
    it('should restore removed item to history', () => {
      const store = useWeatherStore.getState();
      store.addToHistory(mockWeatherData);

      const historyId = useWeatherStore.getState().searchHistory[0].id;
      store.removeFromHistory(historyId);
      store.undoRemove(historyId);

      const state = useWeatherStore.getState();
      expect(state.searchHistory).toHaveLength(1);
      expect(state.searchHistory[0].city).toBe('London');
      expect(state.searchHistory[0].isRemoved).toBe(false);
      expect(state.recentlyRemoved).toHaveLength(0);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history and recently removed items', () => {
      const store = useWeatherStore.getState();
      store.addToHistory(mockWeatherData);

      const historyId = useWeatherStore.getState().searchHistory[0].id;
      store.removeFromHistory(historyId);
      store.clearHistory();

      const state = useWeatherStore.getState();
      expect(state.searchHistory).toHaveLength(0);
      expect(state.recentlyRemoved).toHaveLength(0);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useWeatherStore.setState({
        error: { message: 'Test error', code: 'TEST_ERROR' },
      });

      const store = useWeatherStore.getState();
      store.clearError();

      expect(useWeatherStore.getState().error).toBeNull();
    });
  });
});
