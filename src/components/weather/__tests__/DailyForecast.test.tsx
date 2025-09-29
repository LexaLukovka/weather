import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import '@testing-library/jest-dom';
import * as React from 'react';

import { WeatherProvider } from '../../../contexts/WeatherProvider';
import { useWeather, useWindowSize, useDailyForecast } from '../../../hooks';
import { DailyForecast } from '../DailyForecast';

// Mock hooks
vi.mock('../../../hooks');

const mockUseWeather = vi.mocked(useWeather);
const mockUseWindowSize = vi.mocked(useWindowSize);
const mockUseDailyForecast = vi.mocked(useDailyForecast);

// Set default mock return values
mockUseWeather.mockReturnValue({
  weather: {
    id: '1',
    city: 'London',
    country: 'UK',
    temperature: 20,
    description: 'Clear',
    minTemperature: 15,
    maxTemperature: 25,
    windSpeed: 10,
    humidity: 60,
    icon: 'clear.png',
    timestamp: Date.now(),
    dailyForecast: [
      {
        date: '2023-01-01',
        day: 'Today',
        maxTemp: 25,
        minTemp: 15,
        condition: { text: 'Sunny', icon: 'sunny.png' },
      },
      {
        date: '2023-01-02',
        day: 'Monday',
        maxTemp: 22,
        minTemp: 12,
        condition: { text: 'Cloudy', icon: 'cloudy.png' },
      },
    ],
  },
  isLoading: false,
  error: null,
});

mockUseWindowSize.mockReturnValue({
  width: 1024,
  height: 768,
  isMobile: false,
  isDesktop: true,
});

mockUseDailyForecast.mockReturnValue({
  dailyData: [
    {
      day: 'Today',
      high: 25,
      low: 15,
      icon: <div>sunny-icon</div>,
      description: 'Sunny',
    },
    {
      day: 'Monday',
      high: 22,
      low: 12,
      icon: <div>cloudy-icon</div>,
      description: 'Cloudy',
    },
    {
      day: 'Tuesday',
      high: 20,
      low: 10,
      icon: <div>rainy-icon</div>,
      description: 'Rainy',
    },
  ],
});

// Mock components
vi.mock('../DailyForecastItem', () => ({
  DailyForecastItem: ({
    day,
    index,
    getShortDayName,
  }: {
    day: {
      day: string;
      high: number;
      low: number;
      icon: React.ReactElement;
      description: string;
    };
    index: number;
    getShortDayName: (dayName: string) => string;
  }) => (
    <div data-testid={`forecast-item-${index}`}>
      <span data-testid='day-name'>{getShortDayName(day.day)}</span>
      <span data-testid='max-temp'>{day.high}°</span>
      <span data-testid='min-temp'>{day.low}°</span>
    </div>
  ),
}));

vi.mock('../../layout', () => ({
  Card: ({
    children,
    animate,
  }: {
    children: React.ReactNode;
    animate?: boolean;
  }) => (
    <div data-testid='card' data-animate={animate}>
      {children}
    </div>
  ),
}));

describe('DailyForecast', () => {
  it('renders forecast title', () => {
    render(
      <WeatherProvider>
        <DailyForecast />
      </WeatherProvider>
    );

    expect(screen.getByText('10-Day Forecast')).toBeInTheDocument();
  });

  it('renders Card component with animate prop', () => {
    render(
      <WeatherProvider>
        <DailyForecast />
      </WeatherProvider>
    );

    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('data-animate', 'true');
  });

  it('renders daily forecast items', () => {
    render(
      <WeatherProvider>
        <DailyForecast />
      </WeatherProvider>
    );

    expect(screen.getByTestId('forecast-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('forecast-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('forecast-item-2')).toBeInTheDocument();
  });

  it('passes getShortDayName function to items on desktop', () => {
    render(
      <WeatherProvider>
        <DailyForecast />
      </WeatherProvider>
    );

    // Should show full day names on desktop
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
  });

  it('shows abbreviated day names on mobile', () => {
    mockUseWindowSize.mockReturnValueOnce({
      width: 375,
      height: 667,
      isMobile: true,
      isDesktop: false,
    });

    render(
      <WeatherProvider>
        <DailyForecast />
      </WeatherProvider>
    );

    // Should show abbreviated names on mobile (except Today)
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
  });

  it('handles unknown day names gracefully', () => {
    mockUseDailyForecast.mockReturnValueOnce({
      dailyData: [
        {
          day: 'UnknownDay',
          high: 25,
          low: 15,
          icon: <div>sunny-icon</div>,
          description: 'Sunny',
        },
      ],
    });

    render(
      <WeatherProvider>
        <DailyForecast />
      </WeatherProvider>
    );

    expect(screen.getByText('UnknownDay')).toBeInTheDocument();
  });

  it('renders empty list when no daily data', () => {
    mockUseDailyForecast.mockReturnValueOnce({
      dailyData: [],
    });

    render(
      <WeatherProvider>
        <DailyForecast />
      </WeatherProvider>
    );

    expect(screen.getByText('10-Day Forecast')).toBeInTheDocument();
    expect(screen.queryByTestId('forecast-item-0')).not.toBeInTheDocument();
  });
});
