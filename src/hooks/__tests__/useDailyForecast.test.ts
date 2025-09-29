import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { type WeatherData } from '../../types';
import { useDailyForecast } from '../useDailyForecast';

// Mock the utils module
vi.mock('../../utils', () => ({
  getWeatherIcon: vi.fn((icon, text, size) => `icon-${icon}-${text}-${size}`),
}));

describe('useDailyForecast', () => {
  const createMockWeatherData = (
    dailyForecast?: WeatherData['dailyForecast']
  ): WeatherData => ({
    id: '1',
    city: 'Test City',
    country: 'Test Country',
    temperature: 25,
    description: 'Clear',
    minTemperature: 20,
    maxTemperature: 30,
    windSpeed: 10,
    humidity: 60,
    icon: 'clear.png',
    timestamp: Date.now(),
    localtime: '2023-01-01 12:00',
    dailyForecast,
  });

  it('returns empty array when weather has no dailyForecast', () => {
    const weatherData = createMockWeatherData();
    const { result } = renderHook(() => useDailyForecast(weatherData));

    expect(result.current.dailyData).toEqual([]);
  });

  it('returns empty array when dailyForecast is undefined', () => {
    const weatherData = createMockWeatherData(undefined);
    const { result } = renderHook(() => useDailyForecast(weatherData));

    expect(result.current.dailyData).toEqual([]);
  });

  it('transforms daily forecast data correctly', () => {
    const dailyForecast = [
      {
        date: '2023-01-01',
        day: 'Monday',
        maxTemp: 28,
        minTemp: 18,
        condition: {
          text: 'Sunny',
          icon: 'sunny.png',
        },
      },
      {
        date: '2023-01-02',
        day: 'Tuesday',
        maxTemp: 25,
        minTemp: 15,
        condition: {
          text: 'Cloudy',
          icon: 'cloudy.png',
        },
      },
    ];

    const weatherData = createMockWeatherData(dailyForecast);

    const { result } = renderHook(() => useDailyForecast(weatherData));

    expect(result.current.dailyData).toEqual([
      {
        date: '2023-01-01',
        day: 'Monday',
        high: 28,
        low: 18,
        icon: 'icon-sunny.png-Sunny-24',
        description: 'Sunny',
      },
      {
        date: '2023-01-02',
        day: 'Tuesday',
        high: 25,
        low: 15,
        icon: 'icon-cloudy.png-Cloudy-24',
        description: 'Cloudy',
      },
    ]);
  });

  it('handles single day forecast', () => {
    const dailyForecast = [
      {
        date: '2023-01-01',
        day: 'Today',
        maxTemp: 30,
        minTemp: 22,
        condition: {
          text: 'Partly cloudy',
          icon: 'partly-cloudy.png',
        },
      },
    ];

    const weatherData = createMockWeatherData(dailyForecast);
    const { result } = renderHook(() => useDailyForecast(weatherData));

    expect(result.current.dailyData).toHaveLength(1);
    expect(result.current.dailyData[0]).toEqual({
      date: '2023-01-01',
      day: 'Today',
      high: 30,
      low: 22,
      icon: 'icon-partly-cloudy.png-Partly cloudy-24',
      description: 'Partly cloudy',
    });
  });

  it('handles empty daily forecast array', () => {
    const weatherData = createMockWeatherData([]);
    const { result } = renderHook(() => useDailyForecast(weatherData));

    expect(result.current.dailyData).toEqual([]);
  });

  it('memoizes the result correctly', () => {
    const dailyForecast = [
      {
        date: '2023-01-03',
        day: 'Wednesday',
        maxTemp: 26,
        minTemp: 16,
        condition: {
          text: 'Rainy',
          icon: 'rain.png',
        },
      },
    ];

    const weatherData = createMockWeatherData(dailyForecast);
    const { result, rerender } = renderHook(() =>
      useDailyForecast(weatherData)
    );

    const firstResult = result.current.dailyData;
    rerender();
    const secondResult = result.current.dailyData;

    // Should be the same reference due to memoization
    expect(firstResult).toBe(secondResult);
  });

  it('updates result when weather data changes', () => {
    const initialForecast = [
      {
        date: '2023-01-04',
        day: 'Thursday',
        maxTemp: 24,
        minTemp: 14,
        condition: {
          text: 'Clear',
          icon: 'clear.png',
        },
      },
    ];

    const updatedForecast = [
      {
        date: '2023-01-05',
        day: 'Friday',
        maxTemp: 28,
        minTemp: 18,
        condition: {
          text: 'Stormy',
          icon: 'storm.png',
        },
      },
    ];

    const { result, rerender } = renderHook(
      ({ weather }) => useDailyForecast(weather),
      {
        initialProps: { weather: createMockWeatherData(initialForecast) },
      }
    );

    expect(result.current.dailyData[0].day).toBe('Thursday');
    expect(result.current.dailyData[0].description).toBe('Clear');

    rerender({ weather: createMockWeatherData(updatedForecast) });

    expect(result.current.dailyData[0].day).toBe('Friday');
    expect(result.current.dailyData[0].description).toBe('Stormy');
  });

  it('handles edge cases with unusual weather conditions', () => {
    const dailyForecast = [
      {
        date: '2023-01-06',
        day: 'Weekend',
        maxTemp: 0,
        minTemp: -10,
        condition: {
          text: 'Heavy snow',
          icon: 'snow-heavy.png',
        },
      },
    ];

    const weatherData = createMockWeatherData(dailyForecast);
    const { result } = renderHook(() => useDailyForecast(weatherData));

    expect(result.current.dailyData[0]).toEqual({
      date: '2023-01-06',
      day: 'Weekend',
      high: 0,
      low: -10,
      icon: 'icon-snow-heavy.png-Heavy snow-24',
      description: 'Heavy snow',
    });
  });

  it('calls getWeatherIcon with correct parameters', async () => {
    const { getWeatherIcon } = await import('../../utils');

    const dailyForecast = [
      {
        date: '2023-01-07',
        day: 'Test Day',
        maxTemp: 20,
        minTemp: 10,
        condition: {
          text: 'Test Condition',
          icon: 'test-icon.png',
        },
      },
    ];

    const weatherData = createMockWeatherData(dailyForecast);
    renderHook(() => useDailyForecast(weatherData));

    expect(getWeatherIcon).toHaveBeenCalledWith(
      'test-icon.png',
      'Test Condition',
      24
    );
  });
});
