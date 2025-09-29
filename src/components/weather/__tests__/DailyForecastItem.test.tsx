import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { WeatherProvider } from '../../../contexts/WeatherProvider';
import { DailyForecastItem } from '../DailyForecastItem';

// Mock hooks
vi.mock('../../../hooks', () => ({
  useWeather: vi.fn(() => ({
    weather: {
      id: '1',
      city: 'London',
      country: 'UK',
      temperature: 20,
      description: 'Clear skies',
      minTemperature: 15,
      maxTemperature: 25,
      windSpeed: 10,
      humidity: 60,
      icon: 'clear.png',
      timestamp: Date.now(),
    },
  })),
}));

describe('DailyForecastItem', () => {
  const mockIcon = <div data-testid='weather-icon'>☀️</div>;

  const mockDay = {
    day: 'Monday',
    high: 25,
    low: 15,
    icon: mockIcon,
    description: 'Sunny weather',
  };

  const defaultProps = {
    day: mockDay,
    index: 1,
    getShortDayName: (dayName: string) => dayName,
  };

  it('renders day name using getShortDayName function', () => {
    const getShortDayName = vi.fn(dayName => `Short ${dayName}`);

    render(
      <WeatherProvider>
        <DailyForecastItem
          {...defaultProps}
          getShortDayName={getShortDayName}
        />
      </WeatherProvider>
    );

    expect(getShortDayName).toHaveBeenCalledWith('Monday');
    expect(screen.getByText('Short Monday')).toBeInTheDocument();
  });

  it('renders weather icon', () => {
    render(
      <WeatherProvider>
        <DailyForecastItem {...defaultProps} />
      </WeatherProvider>
    );

    expect(screen.getByTestId('weather-icon')).toBeInTheDocument();
  });

  it('shows current weather description for index 0', () => {
    render(
      <WeatherProvider>
        <DailyForecastItem {...defaultProps} index={0} />
      </WeatherProvider>
    );

    expect(screen.getByText('Clear skies')).toBeInTheDocument();
    expect(screen.queryByText('Sunny weather')).not.toBeInTheDocument();
  });

  it('shows day description for index > 0', () => {
    render(
      <WeatherProvider>
        <DailyForecastItem {...defaultProps} index={1} />
      </WeatherProvider>
    );

    expect(screen.getByText('Sunny weather')).toBeInTheDocument();
    expect(screen.queryByText('Clear skies')).not.toBeInTheDocument();
  });

  it('renders high and low temperatures', () => {
    render(
      <WeatherProvider>
        <DailyForecastItem {...defaultProps} />
      </WeatherProvider>
    );

    expect(screen.getByText('25°')).toBeInTheDocument();
    expect(screen.getByText('15°')).toBeInTheDocument();
  });

  it('renders temperature range bar with correct styling', () => {
    const { container } = render(
      <WeatherProvider>
        <DailyForecastItem {...defaultProps} />
      </WeatherProvider>
    );

    const rangeBar = container.querySelector(
      '.bg-gradient-to-r.from-blue-400.to-yellow-400'
    );
    expect(rangeBar).toBeInTheDocument();

    // Check that width is calculated based on temperature difference
    const expectedWidth = Math.abs(25 - 15) * 3; // 30%
    expect(rangeBar).toHaveStyle(`width: ${expectedWidth}%`);
  });

  it('calculates temperature range bar position correctly', () => {
    const { container } = render(
      <WeatherProvider>
        <DailyForecastItem {...defaultProps} />
      </WeatherProvider>
    );

    const rangeBar = container.querySelector(
      '.bg-gradient-to-r.from-blue-400.to-yellow-400'
    );

    // Check margin calculation for positioning
    const expectedMarginLeft = Math.max(0, ((15 + 15) / 40) * 100); // 75%
    expect(rangeBar).toHaveStyle(`margin-left: ${expectedMarginLeft}%`);
  });

  it('handles zero temperature difference', () => {
    const dayWithSameTemps = {
      ...mockDay,
      high: 20,
      low: 20,
    };

    const { container } = render(
      <WeatherProvider>
        <DailyForecastItem {...defaultProps} day={dayWithSameTemps} />
      </WeatherProvider>
    );

    const rangeBar = container.querySelector(
      '.bg-gradient-to-r.from-blue-400.to-yellow-400'
    );
    expect(rangeBar).toHaveStyle('width: 0%');
  });

  it('handles negative temperatures correctly', () => {
    const dayWithNegativeTemps = {
      ...mockDay,
      high: -5,
      low: -15,
    };

    const { container } = render(
      <WeatherProvider>
        <DailyForecastItem {...defaultProps} day={dayWithNegativeTemps} />
      </WeatherProvider>
    );

    expect(screen.getByText('-5°')).toBeInTheDocument();
    expect(screen.getByText('-15°')).toBeInTheDocument();

    const rangeBar = container.querySelector(
      '.bg-gradient-to-r.from-blue-400.to-yellow-400'
    );
    const expectedWidth = Math.abs(-5 - -15) * 3; // 30%
    expect(rangeBar).toHaveStyle(`width: ${expectedWidth}%`);
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <WeatherProvider>
        <DailyForecastItem {...defaultProps} />
      </WeatherProvider>
    );

    const mainContainer = container.querySelector(
      '.flex.items-center.justify-between.py-2'
    );
    expect(mainContainer).toBeInTheDocument();

    const dayNameSpan = screen.getByText('Monday');
    expect(dayNameSpan).toHaveClass(
      'text-white/90',
      'w-12',
      'md:w-20',
      'text-xs',
      'md:text-sm',
      'flex-shrink-0'
    );
  });
});
