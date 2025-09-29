import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import '@testing-library/jest-dom';
import * as React from 'react';

import { WeatherProvider } from '../../../contexts/WeatherProvider';
import {
  useWeather,
  useHourlyForecast,
  useScrollIndicators,
} from '../../../hooks';
import { HourlyForecast } from '../HourlyForecast';

// Mock hooks
vi.mock('../../../hooks');

const mockUseWeather = vi.mocked(useWeather);
const mockUseHourlyForecast = vi.mocked(useHourlyForecast);
const mockUseScrollIndicators = vi.mocked(useScrollIndicators);

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
  },
  isLoading: false,
  error: null,
});

mockUseHourlyForecast.mockReturnValue({
  weatherSummary:
    'Clear conditions expected around 15:00. Wind gusts up to 10 m/s are making the temperature feel like 20°.',
  hourlyData: [
    { time: 12, temp: 20, icon: <div>sunny-icon</div>, isNow: true },
    { time: 13, temp: 22, icon: <div>sunny-icon</div>, isNow: false },
    { time: 14, temp: 24, icon: <div>cloudy-icon</div>, isNow: false },
  ],
});

mockUseScrollIndicators.mockReturnValue({
  scrollRef: { current: null },
  showLeftIndicator: false,
  showRightIndicator: true,
  handleScroll: vi.fn(),
});

// Mock components
vi.mock('../HourlyForecastList', () => ({
  HourlyForecastList: ({
    hourlyData,
  }: {
    hourlyData: Array<{
      time: number;
      temp: number;
      icon: React.ReactElement;
      isNow: boolean;
    }>;
  }) => (
    <div data-testid='hourly-forecast-list'>
      {hourlyData.map((hour, index) => (
        <div key={index} data-testid={`hour-${hour.time}`}>
          {hour.time}:00 - {hour.temp}°
        </div>
      ))}
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

describe('HourlyForecast', () => {
  it('renders Card component with animate prop', () => {
    render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('data-animate', 'true');
  });

  it('renders weather summary', () => {
    render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    expect(
      screen.getByText(/Clear conditions expected around 15:00/)
    ).toBeInTheDocument();
  });

  it('renders HourlyForecastList with hourly data', () => {
    render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    expect(screen.getByTestId('hourly-forecast-list')).toBeInTheDocument();
    expect(screen.getByTestId('hour-12')).toBeInTheDocument();
    expect(screen.getByTestId('hour-13')).toBeInTheDocument();
    expect(screen.getByTestId('hour-14')).toBeInTheDocument();
  });

  it('calls handleScroll on scroll event', () => {
    const handleScroll = vi.fn();
    mockUseScrollIndicators.mockReturnValueOnce({
      scrollRef: { current: null },
      showLeftIndicator: false,
      showRightIndicator: true,
      handleScroll,
    });

    const { container } = render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    const scrollContainer = container.querySelector('.overflow-x-auto');
    fireEvent.scroll(scrollContainer!);

    expect(handleScroll).toHaveBeenCalled();
  });

  it('shows scroll indicators when hourly data exists', () => {
    render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    // Should show scroll indicator container
    const indicatorContainer = screen
      .getByTestId('card')
      .querySelector('.flex.items-center.justify-center.gap-1.mt-3');
    expect(indicatorContainer).toBeInTheDocument();
  });

  it('hides scroll indicators when no hourly data', () => {
    mockUseHourlyForecast.mockReturnValueOnce({
      weatherSummary: 'No data available',
      hourlyData: [],
    });

    const { container } = render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    const indicatorContainer = container.querySelector(
      '.flex.items-center.justify-center.gap-1.mt-3'
    );
    expect(indicatorContainer).not.toBeInTheDocument();
  });

  it('applies correct scroll indicator class when no indicators needed', () => {
    mockUseScrollIndicators.mockReturnValueOnce({
      scrollRef: { current: null },
      showLeftIndicator: false,
      showRightIndicator: false,
      handleScroll: vi.fn(),
    });

    const { container } = render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    const indicator = container.querySelector(
      '.h-1.transition-all.duration-300.rounded-full'
    );
    expect(indicator).toHaveClass('w-8', 'bg-white/60');
  });

  it('applies correct scroll indicator class when only left indicator hidden', () => {
    mockUseScrollIndicators.mockReturnValueOnce({
      scrollRef: { current: null },
      showLeftIndicator: false,
      showRightIndicator: true,
      handleScroll: vi.fn(),
    });

    const { container } = render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    const indicator = container.querySelector(
      '.h-1.transition-all.duration-300.rounded-full'
    );
    expect(indicator).toHaveClass('w-8', 'bg-white/60');
  });

  it('applies correct scroll indicator class when only right indicator hidden', () => {
    mockUseScrollIndicators.mockReturnValueOnce({
      scrollRef: { current: null },
      showLeftIndicator: true,
      showRightIndicator: false,
      handleScroll: vi.fn(),
    });

    const { container } = render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    const indicator = container.querySelector(
      '.h-1.transition-all.duration-300.rounded-full'
    );
    expect(indicator).toHaveClass('w-1', 'bg-white/20');
  });

  it('applies correct scroll indicator class when both indicators shown', () => {
    mockUseScrollIndicators.mockReturnValueOnce({
      scrollRef: { current: null },
      showLeftIndicator: true,
      showRightIndicator: true,
      handleScroll: vi.fn(),
    });

    const { container } = render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    const indicator = container.querySelector(
      '.h-1.transition-all.duration-300.rounded-full'
    );
    expect(indicator).toHaveClass('w-4', 'bg-white/40');
  });

  it('shows right indicator dots when right indicator is visible', () => {
    const { container } = render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    const dots = container.querySelectorAll(
      '.h-1.w-1.bg-white\\/20.rounded-full'
    );
    expect(dots).toHaveLength(2);
  });

  it('applies correct CSS classes to scroll container', () => {
    const { container } = render(
      <WeatherProvider>
        <HourlyForecast />
      </WeatherProvider>
    );

    const scrollContainer = container.querySelector(
      '.overflow-x-auto.scrollbar-hide'
    );
    expect(scrollContainer).toBeInTheDocument();

    const innerContainer = container.querySelector(
      '.flex.space-x-4.md\\:space-x-8'
    );
    expect(innerContainer).toBeInTheDocument();
  });
});
