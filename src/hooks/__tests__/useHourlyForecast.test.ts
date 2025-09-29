import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { type WeatherData } from '../../types';
import { useHourlyForecast } from '../useHourlyForecast';

// Mock the utils module
vi.mock('../../utils', () => ({
  getWeatherIcon: vi.fn((icon, text, size) => `icon-${icon}-${text}-${size}`),
}));

describe('useHourlyForecast', () => {
  const createMockWeatherData = (
    hourlyForecast?: WeatherData['hourlyForecast']
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
    hourlyForecast,
  });

  it('returns empty array when weather has no hourlyForecast', () => {
    const weatherData = createMockWeatherData();
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    expect(result.current.hourlyData).toEqual([]);
  });

  it('returns empty array when hourlyForecast is undefined', () => {
    const weatherData = createMockWeatherData(undefined);
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    expect(result.current.hourlyData).toEqual([]);
  });

  it('returns empty array when localtime is missing', () => {
    const weatherData = { ...createMockWeatherData([]), localtime: undefined };
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    expect(result.current.hourlyData).toEqual([]);
  });

  it('transforms hourly forecast data correctly', () => {
    const hourlyForecast = [
      {
        time: '2023-01-01 12:00',
        temp_c: 22,
        condition: {
          text: 'Sunny',
          icon: 'sunny.png',
        },
      },
      {
        time: '2023-01-01 13:00',
        temp_c: 23,
        condition: {
          text: 'Partly cloudy',
          icon: 'partly-cloudy.png',
        },
      },
    ];

    const weatherData = createMockWeatherData(hourlyForecast);
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    expect(result.current.hourlyData).toEqual([
      {
        time: 12,
        temp: 22,
        icon: 'icon-sunny.png-Sunny-32',
        isNow: true,
      },
      {
        time: 13,
        temp: 23,
        icon: 'icon-partly-cloudy.png-Partly cloudy-32',
        isNow: false,
      },
    ]);
  });

  it('extracts hour as number from datetime string', () => {
    const hourlyForecast = [
      {
        time: '2023-01-01 09:30',
        temp_c: 18,
        condition: {
          text: 'Cloudy',
          icon: 'cloudy.png',
        },
      },
      {
        time: '2023-01-01 23:45',
        temp_c: 15,
        condition: {
          text: 'Clear',
          icon: 'clear.png',
        },
      },
    ];

    const weatherData = {
      ...createMockWeatherData(hourlyForecast),
      localtime: '2023-01-01 09:00',
    };
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    expect(result.current.hourlyData[0].time).toBe(9);
    expect(result.current.hourlyData[1].time).toBe(23);
  });

  it('marks first hour as current (isNow)', () => {
    const hourlyForecast = [
      {
        time: '2023-01-01 14:00',
        temp_c: 20,
        condition: {
          text: 'Rainy',
          icon: 'rain.png',
        },
      },
      {
        time: '2023-01-01 15:00',
        temp_c: 21,
        condition: {
          text: 'Cloudy',
          icon: 'cloudy.png',
        },
      },
    ];

    const weatherData = {
      ...createMockWeatherData(hourlyForecast),
      localtime: '2023-01-01 14:00',
    };
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    expect(result.current.hourlyData[0].isNow).toBe(true);
    expect(result.current.hourlyData[1].isNow).toBe(false);
  });

  it('handles empty hourly forecast array', () => {
    const weatherData = createMockWeatherData([]);
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    expect(result.current.hourlyData).toEqual([]);
  });

  it('returns weather summary', () => {
    const weatherData = createMockWeatherData();
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    expect(result.current.weatherSummary).toContain(
      'Clear conditions expected'
    );
    expect(result.current.weatherSummary).toContain('Wind gusts');
    expect(result.current.weatherSummary).toContain('temperature feel like');
  });

  it('slices to maximum 12 hours', () => {
    const hourlyForecast = Array.from({ length: 24 }, (_, i) => ({
      time: `2023-01-01 ${String(i).padStart(2, '0')}:00`,
      temp_c: 20 + i,
      condition: {
        text: 'Clear',
        icon: 'clear.png',
      },
    }));

    const weatherData = {
      ...createMockWeatherData(hourlyForecast),
      localtime: '2023-01-01 10:00',
    };
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    expect(result.current.hourlyData).toHaveLength(12);
    expect(result.current.hourlyData[0].time).toBe(10);
    expect(result.current.hourlyData[11].time).toBe(21);
  });

  it('finds correct starting hour based on localtime', () => {
    const hourlyForecast = [
      {
        time: '2023-01-01 10:00',
        temp_c: 18,
        condition: {
          text: 'Morning',
          icon: 'morning.png',
        },
      },
      {
        time: '2023-01-01 14:00',
        temp_c: 22,
        condition: {
          text: 'Afternoon',
          icon: 'afternoon.png',
        },
      },
      {
        time: '2023-01-01 18:00',
        temp_c: 20,
        condition: {
          text: 'Evening',
          icon: 'evening.png',
        },
      },
    ];

    const weatherData = {
      ...createMockWeatherData(hourlyForecast),
      localtime: '2023-01-01 14:30',
    };
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    // Should start from 18:00 since current time is 14:30
    expect(result.current.hourlyData[0].time).toBe(18);
    expect(result.current.hourlyData[0].temp).toBe(20);
  });

  it('rounds temperature values', () => {
    const hourlyForecast = [
      {
        time: '2023-01-01 14:00',
        temp_c: 22.7,
        condition: {
          text: 'Warm',
          icon: 'warm.png',
        },
      },
      {
        time: '2023-01-01 15:00',
        temp_c: 22.3,
        condition: {
          text: 'Warm',
          icon: 'warm.png',
        },
      },
    ];

    const weatherData = {
      ...createMockWeatherData(hourlyForecast),
      localtime: '2023-01-01 14:00',
    };
    const { result } = renderHook(() => useHourlyForecast(weatherData));

    expect(result.current.hourlyData[0].temp).toBe(23);
    expect(result.current.hourlyData[1].temp).toBe(22);
  });
});
