import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { type WeatherData } from '../../types';
import { useWeatherTheme } from '../useWeatherTheme';

describe('useWeatherTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockWeatherData = (
    description: string,
    localtime: string = '2023-01-01 14:30'
  ): WeatherData => ({
    id: '1',
    city: 'Test City',
    country: 'Test Country',
    temperature: 20,
    description,
    minTemperature: 15,
    maxTemperature: 25,
    windSpeed: 10,
    humidity: 60,
    icon: 'test.png',
    timestamp: Date.now(),
    localtime,
  });

  describe('Default State (No Weather)', () => {
    it('returns default theme when no weather data', () => {
      const { result } = renderHook(() => useWeatherTheme(null));

      expect(result.current.backgroundClass).toBe('weather-gradient');
      expect(result.current.isLightTheme).toBe(false);
      expect(result.current.textContrastClass).toBe('');
    });
  });

  describe('Clear/Sunny Weather Themes', () => {
    it('applies sunny theme for clear conditions during day', () => {
      const sunnyWeather = createMockWeatherData('Clear', '2023-01-01 14:30');
      const { result } = renderHook(() => useWeatherTheme(sunnyWeather));

      expect(result.current.backgroundClass).toBe('weather-gradient-sunny');
      expect(result.current.isLightTheme).toBe(true);
      expect(result.current.textContrastClass).toBe('text-contrast-dark');
    });

    it('applies night theme for clear conditions during night', () => {
      const clearNightWeather = createMockWeatherData(
        'Clear',
        '2023-01-01 23:30'
      );
      const { result } = renderHook(() => useWeatherTheme(clearNightWeather));

      expect(result.current.backgroundClass).toBe('weather-gradient-night');
      expect(result.current.isLightTheme).toBe(false);
      expect(result.current.textContrastClass).toBe('');
    });
  });

  describe('Cloudy Weather Themes', () => {
    it('applies cloudy theme for overcast conditions during day', () => {
      const cloudyWeather = createMockWeatherData(
        'Overcast clouds',
        '2023-01-01 12:00'
      );
      const { result } = renderHook(() => useWeatherTheme(cloudyWeather));

      expect(result.current.backgroundClass).toBe('weather-gradient-cloudy');
      expect(result.current.isLightTheme).toBe(true);
      expect(result.current.textContrastClass).toBe('text-contrast-dark');
    });

    it('applies night theme for cloudy conditions during night', () => {
      const cloudyNightWeather = createMockWeatherData(
        'Partly cloudy',
        '2023-01-01 02:00'
      );
      const { result } = renderHook(() => useWeatherTheme(cloudyNightWeather));

      expect(result.current.backgroundClass).toBe('weather-gradient-night');
      expect(result.current.isLightTheme).toBe(false);
      expect(result.current.textContrastClass).toBe('');
    });
  });

  describe('Rainy Weather Themes', () => {
    it('applies rainy theme for rain conditions', () => {
      const rainyWeather = createMockWeatherData(
        'Light rain',
        '2023-01-01 15:00'
      );
      const { result } = renderHook(() => useWeatherTheme(rainyWeather));

      expect(result.current.backgroundClass).toBe('weather-gradient-rainy');
      expect(result.current.isLightTheme).toBe(false);
      expect(result.current.textContrastClass).toBe('');
    });

    it('applies rainy theme for drizzle conditions', () => {
      const drizzleWeather = createMockWeatherData(
        'Light drizzle',
        '2023-01-01 10:00'
      );
      const { result } = renderHook(() => useWeatherTheme(drizzleWeather));

      expect(result.current.backgroundClass).toBe('weather-gradient-rainy');
      expect(result.current.isLightTheme).toBe(false);
      expect(result.current.textContrastClass).toBe('');
    });
  });

  describe('Night Time Detection', () => {
    it('applies night theme for early morning hours (before 5am)', () => {
      const earlyMorning = createMockWeatherData('Clear', '2023-01-01 03:00');
      const { result } = renderHook(() => useWeatherTheme(earlyMorning));

      expect(result.current.backgroundClass).toBe('weather-gradient-night');
      expect(result.current.isLightTheme).toBe(false);
    });

    it('applies night theme for late evening hours (after 8pm)', () => {
      const lateEvening = createMockWeatherData('Clear', '2023-01-01 22:00');
      const { result } = renderHook(() => useWeatherTheme(lateEvening));

      expect(result.current.backgroundClass).toBe('weather-gradient-night');
      expect(result.current.isLightTheme).toBe(false);
    });

    it('applies day theme for morning hours (after 5am)', () => {
      const morning = createMockWeatherData('Clear', '2023-01-01 08:00');
      const { result } = renderHook(() => useWeatherTheme(morning));

      expect(result.current.backgroundClass).toBe('weather-gradient-sunny');
      expect(result.current.isLightTheme).toBe(true);
    });

    it('applies day theme for evening hours (before 8pm)', () => {
      const evening = createMockWeatherData('Clear', '2023-01-01 19:00');
      const { result } = renderHook(() => useWeatherTheme(evening));

      expect(result.current.backgroundClass).toBe('weather-gradient-sunny');
      expect(result.current.isLightTheme).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing localtime gracefully', () => {
      const weatherWithoutTime = createMockWeatherData('Clear');
      weatherWithoutTime.localtime = undefined;

      const { result } = renderHook(() => useWeatherTheme(weatherWithoutTime));

      // Should use current hour for time detection
      expect(result.current.backgroundClass).toBeDefined();
      expect(result.current.isLightTheme).toBeDefined();
      expect(result.current.textContrastClass).toBeDefined();
    });

    it('handles invalid localtime format gracefully', () => {
      const weatherWithInvalidTime = createMockWeatherData(
        'Clear',
        '2023-01-01'
      ); // Missing time part

      const { result } = renderHook(() =>
        useWeatherTheme(weatherWithInvalidTime)
      );

      // Should fallback to current hour and not crash
      expect(result.current.backgroundClass).toBeDefined();
      expect(result.current.isLightTheme).toBeDefined();
      expect(result.current.textContrastClass).toBeDefined();
    });

    it('handles unknown weather descriptions', () => {
      const unknownWeather = createMockWeatherData('Unknown weather condition');

      const { result } = renderHook(() => useWeatherTheme(unknownWeather));

      // Should use default gradient
      expect(result.current.backgroundClass).toBe('weather-gradient');
      expect(result.current.isLightTheme).toBe(false);
      expect(result.current.textContrastClass).toBe('');
    });

    it('is case insensitive for weather descriptions', () => {
      const upperCaseWeather = createMockWeatherData('CLEAR SKY');
      const { result } = renderHook(() => useWeatherTheme(upperCaseWeather));

      expect(result.current.backgroundClass).toBe('weather-gradient-sunny');
      expect(result.current.isLightTheme).toBe(true);
    });

    it('handles partial matches in weather descriptions', () => {
      const partialMatch = createMockWeatherData('Heavy rain showers');
      const { result } = renderHook(() => useWeatherTheme(partialMatch));

      expect(result.current.backgroundClass).toBe('weather-gradient-rainy');
      expect(result.current.isLightTheme).toBe(false);
    });
  });

  describe('Memoization', () => {
    it('maintains referential stability when weather data unchanged', () => {
      const weatherData = createMockWeatherData('Sunny');

      const { result, rerender } = renderHook(() =>
        useWeatherTheme(weatherData)
      );

      const firstRender = result.current;
      rerender();
      const secondRender = result.current;

      expect(firstRender).toBe(secondRender);
    });

    it('updates when weather data changes', () => {
      const sunnyWeather = createMockWeatherData('Clear');
      const rainyWeather = createMockWeatherData('Heavy rain');

      const { result, rerender } = renderHook(
        ({ weather }) => useWeatherTheme(weather),
        { initialProps: { weather: sunnyWeather } }
      );

      const sunnyTheme = result.current;

      rerender({ weather: rainyWeather });
      const rainyTheme = result.current;

      expect(sunnyTheme.backgroundClass).toBe('weather-gradient-sunny');
      expect(rainyTheme.backgroundClass).toBe('weather-gradient-rainy');
      expect(sunnyTheme).not.toBe(rainyTheme);
    });
  });

  describe('Theme Consistency', () => {
    it('ensures light themes have appropriate text contrast', () => {
      const lightThemeConditions = ['Clear', 'Partly cloudy', 'Few clouds'];

      lightThemeConditions.forEach(description => {
        const weather = createMockWeatherData(description, '2023-01-01 12:00'); // Daytime
        const { result } = renderHook(() => useWeatherTheme(weather));

        if (result.current.isLightTheme) {
          expect(result.current.textContrastClass).toBe('text-contrast-dark');
        }
      });
    });

    it('ensures dark themes have empty text contrast class', () => {
      const darkThemeConditions = [
        'Heavy rain',
        'Thunderstorm',
        'Unknown condition',
      ];

      darkThemeConditions.forEach(description => {
        const weather = createMockWeatherData(description);
        const { result } = renderHook(() => useWeatherTheme(weather));

        if (!result.current.isLightTheme) {
          expect(result.current.textContrastClass).toBe('');
        }
      });
    });

    it('ensures night time always results in dark theme', () => {
      const nightTimes = [
        '2023-01-01 23:00',
        '2023-01-01 02:00',
        '2023-01-01 04:00',
      ];

      nightTimes.forEach(time => {
        const weather = createMockWeatherData('Clear', time);
        const { result } = renderHook(() => useWeatherTheme(weather));

        expect(result.current.isLightTheme).toBe(false);
        expect(result.current.backgroundClass).toBe('weather-gradient-night');
      });
    });
  });
});
