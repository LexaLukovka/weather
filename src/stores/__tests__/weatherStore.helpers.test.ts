import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { type WeatherData, type SearchHistoryItem } from '../../types';
import {
  isErrorWithCode,
  isGeolocationError,
  createWeatherError,
  createGeolocationError,
  findExistingHistoryIndex,
  createHistoryItem,
  buildNewHistory,
  cleanupRecentlyRemoved,
} from '../weatherStore.helpers';

describe('weatherStore.helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isErrorWithCode', () => {
    it('returns true for Error with code property', () => {
      const error = new Error('Test error') as Error & { code?: string };
      error.code = 'TEST_CODE';

      expect(isErrorWithCode(error)).toBe(true);
    });

    it('returns true for Error without code property', () => {
      const error = new Error('Test error');

      expect(isErrorWithCode(error)).toBe(true);
    });

    it('returns false for non-Error objects', () => {
      expect(isErrorWithCode('string')).toBe(false);
      expect(isErrorWithCode(123)).toBe(false);
      expect(isErrorWithCode({})).toBe(false);
      expect(isErrorWithCode(null)).toBe(false);
      expect(isErrorWithCode(undefined)).toBe(false);
    });
  });

  describe('isGeolocationError', () => {
    it('returns true for object with code and message strings', () => {
      const error = {
        code: 'POSITION_UNAVAILABLE',
        message: 'Location unavailable',
      };

      expect(isGeolocationError(error)).toBe(true);
    });

    it('returns false for object without code', () => {
      const error = { message: 'Location unavailable' };

      expect(isGeolocationError(error)).toBe(false);
    });

    it('returns false for object without message', () => {
      const error = { code: 'POSITION_UNAVAILABLE' };

      expect(isGeolocationError(error)).toBe(false);
    });

    it('returns false for non-object types', () => {
      expect(isGeolocationError('string')).toBe(false);
      expect(isGeolocationError(123)).toBe(false);
      expect(isGeolocationError(null)).toBe(false);
      expect(isGeolocationError(undefined)).toBe(false);
    });

    it('returns false for object with non-string code or message', () => {
      expect(isGeolocationError({ code: 123, message: 'test' })).toBe(false);
      expect(isGeolocationError({ code: 'test', message: 123 })).toBe(false);
    });
  });

  describe('createWeatherError', () => {
    it('creates error from Error with code', () => {
      const error = new Error('API Error') as Error & { code?: string };
      error.code = 'API_ERROR';

      const result = createWeatherError(error);

      expect(result).toEqual({
        message: 'API Error',
        code: 'API_ERROR',
      });
    });

    it('creates error from Error without code', () => {
      const error = new Error('Network Error');

      const result = createWeatherError(error);

      expect(result).toEqual({
        message: 'Network Error',
        code: undefined,
      });
    });

    it('creates error from unknown error type', () => {
      const result = createWeatherError('Unknown error');

      expect(result).toEqual({
        message: 'An unexpected error occurred',
        code: undefined,
      });
    });
  });

  describe('createGeolocationError', () => {
    it('creates error from geolocation error object', () => {
      const error = {
        code: 'POSITION_UNAVAILABLE',
        message: 'Location unavailable',
      };

      const result = createGeolocationError(error);

      // Since the object isn't an Error instance, it falls back to default message
      // but still extracts the code using isGeolocationError
      expect(result).toEqual({
        message: 'Failed to get your location',
        code: 'POSITION_UNAVAILABLE',
      });
    });

    it('creates error from Error object', () => {
      const error = new Error('Location denied');

      const result = createGeolocationError(error);

      expect(result).toEqual({
        message: 'Location denied',
        code: undefined,
      });
    });

    it('creates error from unknown error type', () => {
      const result = createGeolocationError('Unknown error');

      expect(result).toEqual({
        message: 'Failed to get your location',
        code: undefined,
      });
    });
  });

  describe('findExistingHistoryIndex', () => {
    const mockHistory: SearchHistoryItem[] = [
      {
        id: '1',
        city: 'London',
        country: 'GB',
        searchedAt: Date.now(),
        isRemoved: false,
      },
      {
        id: '2',
        city: 'Paris',
        country: 'FR',
        searchedAt: Date.now(),
        isRemoved: false,
      },
    ];

    const mockWeather: WeatherData = {
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

    it('finds existing city (case insensitive)', () => {
      const weatherWithDifferentCase: WeatherData = {
        ...mockWeather,
        city: 'LONDON',
        country: 'gb',
      };

      const index = findExistingHistoryIndex(
        mockHistory,
        weatherWithDifferentCase
      );

      expect(index).toBe(0);
    });

    it('returns -1 for non-existing city', () => {
      const newWeather: WeatherData = {
        ...mockWeather,
        city: 'Tokyo',
        country: 'JP',
      };

      const index = findExistingHistoryIndex(mockHistory, newWeather);

      expect(index).toBe(-1);
    });

    it('returns -1 for empty history', () => {
      const index = findExistingHistoryIndex([], mockWeather);

      expect(index).toBe(-1);
    });
  });

  describe('createHistoryItem', () => {
    it('creates history item from weather data', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

      const mockWeather: WeatherData = {
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

      const result = createHistoryItem(mockWeather);

      expect(result).toEqual({
        id: 'london-gb-123',
        city: 'London',
        country: 'GB',
        searchedAt: Date.now(),
        isRemoved: false,
      });
    });
  });

  describe('buildNewHistory', () => {
    const mockItem: SearchHistoryItem = {
      id: 'new-id',
      city: 'Tokyo',
      country: 'JP',
      searchedAt: Date.now(),
      isRemoved: false,
    };

    const mockHistory: SearchHistoryItem[] = [
      {
        id: '1',
        city: 'London',
        country: 'GB',
        searchedAt: Date.now() - 1000,
        isRemoved: false,
      },
      {
        id: '2',
        city: 'Paris',
        country: 'FR',
        searchedAt: Date.now() - 2000,
        isRemoved: false,
      },
    ];

    it('adds new item to beginning when not existing', () => {
      const result = buildNewHistory(mockHistory, mockItem, -1);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(mockItem);
      expect(result[1]).toEqual(mockHistory[0]);
      expect(result[2]).toEqual(mockHistory[1]);
    });

    it('updates timestamp when item is already first', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

      const result = buildNewHistory(mockHistory, mockItem, 0);

      expect(result).toHaveLength(2);
      expect(result[0].searchedAt).toBe(Date.now());
      expect(result[0].city).toBe('London'); // Original first item
    });

    it('moves existing item to front', () => {
      const result = buildNewHistory(mockHistory, mockItem, 1);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockItem);
      expect(result[1]).toEqual(mockHistory[0]);
    });

    it('limits history to MAX_HISTORY_SIZE', () => {
      // Create history with 10 items (MAX_HISTORY_SIZE)
      const largeHistory = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        city: `City${i}`,
        country: 'US',
        searchedAt: Date.now() - i * 1000,
        isRemoved: false,
      }));

      const result = buildNewHistory(largeHistory, mockItem, -1);

      expect(result).toHaveLength(10); // Should remain at max size
      expect(result[0]).toEqual(mockItem); // New item should be first
    });
  });

  describe('cleanupRecentlyRemoved', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
    });

    it('removes items older than CLEANUP_TIME', () => {
      const now = Date.now();
      const almostOneDayAgo = now - (24 * 60 * 60 * 1000 - 1000); // Just under 24 hours
      const oneDayAgo = now - 24 * 60 * 60 * 1000; // Exactly 24 hours (should be filtered)
      const twoDaysAgo = now - 48 * 60 * 60 * 1000;

      const recentlyRemoved: SearchHistoryItem[] = [
        {
          id: '1',
          city: 'Recent',
          country: 'US',
          searchedAt: now - 1000, // Recent
          isRemoved: true,
        },
        {
          id: '2',
          city: 'Old',
          country: 'US',
          searchedAt: twoDaysAgo, // Too old
          isRemoved: true,
        },
        {
          id: '3',
          city: 'Borderline',
          country: 'US',
          searchedAt: almostOneDayAgo, // Just under limit, should stay
          isRemoved: true,
        },
        {
          id: '4',
          city: 'ExactlyAtLimit',
          country: 'US',
          searchedAt: oneDayAgo, // Exactly at limit, should be filtered
          isRemoved: true,
        },
      ];

      const result = cleanupRecentlyRemoved(recentlyRemoved);

      expect(result).toHaveLength(2);
      expect(result.find(item => item.city === 'Recent')).toBeDefined();
      expect(result.find(item => item.city === 'Borderline')).toBeDefined();
      expect(result.find(item => item.city === 'Old')).toBeUndefined();
      expect(
        result.find(item => item.city === 'ExactlyAtLimit')
      ).toBeUndefined();
    });

    it('limits to MAX_RECENTLY_REMOVED items', () => {
      const recentlyRemoved: SearchHistoryItem[] = Array.from(
        { length: 10 },
        (_, i) => ({
          id: `item-${i}`,
          city: `City${i}`,
          country: 'US',
          searchedAt: Date.now() - i * 1000,
          isRemoved: true,
        })
      );

      const result = cleanupRecentlyRemoved(recentlyRemoved);

      expect(result).toHaveLength(5); // MAX_RECENTLY_REMOVED
    });

    it('returns empty array for empty input', () => {
      const result = cleanupRecentlyRemoved([]);

      expect(result).toEqual([]);
    });
  });
});
