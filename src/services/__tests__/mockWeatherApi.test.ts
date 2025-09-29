import { describe, it, expect, beforeEach } from 'vitest';

import { ERROR_MESSAGES } from '../../constants/api';
import { MockWeatherApiService } from '../mockWeatherApi';
import { WeatherApiError } from '../weatherApi';

describe('MockWeatherApiService', () => {
  let mockApi: MockWeatherApiService;

  beforeEach(() => {
    mockApi = new MockWeatherApiService(0); // No delay for tests
  });

  describe('getCurrentWeather', () => {
    it('should return mock weather data for valid city', async () => {
      const result = await mockApi.getCurrentWeather('London');

      expect(result).toEqual({
        id: expect.stringContaining('London-mock'),
        city: 'London',
        country: expect.any(String),
        temperature: expect.any(Number),
        description: expect.any(String),
        minTemperature: expect.any(Number),
        maxTemperature: expect.any(Number),
        windSpeed: expect.any(Number),
        humidity: expect.any(Number),
        icon: expect.any(String),
        timestamp: expect.any(Number),
      });

      expect(result.minTemperature).toBeLessThanOrEqual(result.temperature);
      expect(result.maxTemperature).toBeGreaterThanOrEqual(result.temperature);
      expect(result.humidity).toBeGreaterThanOrEqual(45);
      expect(result.humidity).toBeLessThanOrEqual(85);
    });

    it('should return consistent data for same city', async () => {
      const result1 = await mockApi.getCurrentWeather('Paris');
      const result2 = await mockApi.getCurrentWeather('Paris');

      expect(result1.city).toBe(result2.city);
      expect(result1.temperature).toBe(result2.temperature);
      expect(result1.description).toBe(result2.description);
    });

    it('should capitalize city names properly', async () => {
      const result = await mockApi.getCurrentWeather('new york');
      expect(result.city).toBe('New York');
    });

    it('should throw error for empty city input', async () => {
      await expect(mockApi.getCurrentWeather('')).rejects.toThrow(
        new WeatherApiError(ERROR_MESSAGES.INVALID_INPUT, 'INVALID_INPUT')
      );
    });

    it('should throw error for invalid city names', async () => {
      await expect(mockApi.getCurrentWeather('invalidcity')).rejects.toThrow(
        new WeatherApiError(
          ERROR_MESSAGES.CITY_NOT_FOUND,
          'CITY_NOT_FOUND',
          404
        )
      );

      await expect(mockApi.getCurrentWeather('notfound')).rejects.toThrow(
        new WeatherApiError(
          ERROR_MESSAGES.CITY_NOT_FOUND,
          'CITY_NOT_FOUND',
          404
        )
      );
    });

    it('should simulate network delay when configured', async () => {
      const slowMockApi = new MockWeatherApiService(100);
      const startTime = Date.now();

      await slowMockApi.getCurrentWeather('London');

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });
  });
});
