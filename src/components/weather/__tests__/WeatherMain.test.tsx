import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useWeatherData } from '../../../hooks';
import { type WeatherData } from '../../../types';
import { WeatherMain } from '../WeatherMain';

// Mock child components
vi.mock('../WeatherError', () => ({
  WeatherError: ({
    error,
    onRetry,
  }: {
    error: { message: string; code: string };
    onRetry: () => void;
  }) => (
    <div data-testid='weather-error'>
      <span>{error.message}</span>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

vi.mock('../WelcomeMessage', () => ({
  WelcomeMessage: ({ isLightTheme }: { isLightTheme: boolean }) => (
    <div data-testid='welcome-message' data-light-theme={isLightTheme}>
      Welcome
    </div>
  ),
}));

vi.mock('../WeatherWrapper', () => ({
  WeatherWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='weather-wrapper'>{children}</div>
  ),
}));

vi.mock('../WeatherCentered', () => ({
  WeatherCentered: () => <div data-testid='weather-centered'>Weather Info</div>,
}));

vi.mock('../WeatherDetails', () => ({
  WeatherDetails: () => <div data-testid='weather-details'>Details</div>,
}));

vi.mock('../HourlyForecast', () => ({
  HourlyForecast: () => <div data-testid='hourly-forecast'>Hourly</div>,
}));

vi.mock('../DailyForecast', () => ({
  DailyForecast: () => <div data-testid='daily-forecast'>Daily</div>,
}));

vi.mock('../../search', () => ({
  CitySearch: ({
    isLightTheme,
    className,
  }: {
    isLightTheme: boolean;
    className?: string;
  }) => (
    <div
      data-testid='city-search'
      data-light-theme={isLightTheme}
      className={className}
    >
      Search
    </div>
  ),
}));

// Mock hook
vi.mock('../../../hooks', () => ({
  useWeatherData: vi.fn(),
}));

describe('WeatherMain', () => {
  const mockOnRetry = vi.fn();
  const mockUseWeatherData = vi.mocked(useWeatherData);
  const mockWeatherData: WeatherData = {
    id: 'test-id',
    city: 'London',
    country: 'GB',
    temperature: 20,
    description: 'Clear',
    minTemperature: 15,
    maxTemperature: 25,
    windSpeed: 5,
    humidity: 60,
    icon: '01d',
    timestamp: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWeatherData.mockReturnValue({
      weather: null,
      isLoading: false,
      error: null,
    });
  });

  it('renders error state when error is provided', () => {
    const error = { message: 'Test error', code: 'TEST_ERROR' };

    render(
      <WeatherMain
        error={error}
        onRetry={mockOnRetry}
        sidebarOpen={false}
        isLightTheme={false}
      />
    );

    expect(screen.getByTestId('weather-error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked in error state', () => {
    const error = { message: 'Test error', code: 'TEST_ERROR' };

    render(
      <WeatherMain
        error={error}
        onRetry={mockOnRetry}
        sidebarOpen={false}
        isLightTheme={false}
      />
    );

    const retryButton = screen.getByText('Retry');
    retryButton.click();

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('renders welcome message when no weather data and no error', () => {
    render(
      <WeatherMain
        error={null}
        onRetry={mockOnRetry}
        sidebarOpen={false}
        isLightTheme={true}
      />
    );

    const welcome = screen.getByTestId('welcome-message');
    expect(welcome).toBeInTheDocument();
    expect(welcome).toHaveAttribute('data-light-theme', 'true');
  });

  it('renders weather content when weather data is available', () => {
    mockUseWeatherData.mockReturnValue({
      weather: mockWeatherData,
      isLoading: false,
      error: null,
    });

    render(
      <WeatherMain
        error={null}
        onRetry={mockOnRetry}
        sidebarOpen={false}
        isLightTheme={false}
      />
    );

    expect(screen.getByTestId('weather-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('city-search')).toBeInTheDocument();
    expect(screen.getByTestId('weather-centered')).toBeInTheDocument();
    expect(screen.getByTestId('weather-details')).toBeInTheDocument();
    expect(screen.getByTestId('hourly-forecast')).toBeInTheDocument();
    expect(screen.getByTestId('daily-forecast')).toBeInTheDocument();
  });

  it('applies correct padding when sidebar is open', () => {
    mockUseWeatherData.mockReturnValue({
      weather: mockWeatherData,
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <WeatherMain
        error={null}
        onRetry={mockOnRetry}
        sidebarOpen={true}
        isLightTheme={false}
      />
    );

    const mainContainer = container.querySelector('.flex-1');
    expect(mainContainer).toHaveClass('md:pl-6');
  });

  it('applies correct padding when sidebar is closed', () => {
    mockUseWeatherData.mockReturnValue({
      weather: mockWeatherData,
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <WeatherMain
        error={null}
        onRetry={mockOnRetry}
        sidebarOpen={false}
        isLightTheme={false}
      />
    );

    const mainContainer = container.querySelector('.flex-1');
    expect(mainContainer).toHaveClass('pl-0');
  });

  it('passes isLightTheme prop to CitySearch', () => {
    mockUseWeatherData.mockReturnValue({
      weather: mockWeatherData,
      isLoading: false,
      error: null,
    });

    render(
      <WeatherMain
        error={null}
        onRetry={mockOnRetry}
        sidebarOpen={false}
        isLightTheme={true}
      />
    );

    const citySearch = screen.getByTestId('city-search');
    expect(citySearch).toHaveAttribute('data-light-theme', 'true');
  });

  it('applies correct classes to CitySearch', () => {
    mockUseWeatherData.mockReturnValue({
      weather: mockWeatherData,
      isLoading: false,
      error: null,
    });

    render(
      <WeatherMain
        error={null}
        onRetry={mockOnRetry}
        sidebarOpen={false}
        isLightTheme={false}
      />
    );

    const citySearch = screen.getByTestId('city-search');
    expect(citySearch).toHaveClass(
      'absolute',
      'top-4',
      'right-4',
      'z-40',
      'w-[240px]',
      'sm:w-64',
      'md:w-80'
    );
  });

  it('renders grid layout correctly', () => {
    mockUseWeatherData.mockReturnValue({
      weather: mockWeatherData,
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <WeatherMain
        error={null}
        onRetry={mockOnRetry}
        sidebarOpen={false}
        isLightTheme={false}
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass(
      'grid-cols-1',
      'lg:grid-cols-5',
      'gap-4',
      'md:gap-6'
    );
  });

  it('renders forecasts in correct column span', () => {
    mockUseWeatherData.mockReturnValue({
      weather: mockWeatherData,
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <WeatherMain
        error={null}
        onRetry={mockOnRetry}
        sidebarOpen={false}
        isLightTheme={false}
      />
    );

    const forecastColumn = container.querySelector('.lg\\:col-span-3');
    expect(forecastColumn).toBeInTheDocument();

    const detailsColumn = container.querySelector('.lg\\:col-span-2');
    expect(detailsColumn).toBeInTheDocument();
  });
});
