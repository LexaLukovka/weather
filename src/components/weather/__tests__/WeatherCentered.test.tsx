import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import '@testing-library/jest-dom';
import { useWeather, useHourlyForecast } from '../../../hooks';
import { WeatherCentered } from '../WeatherCentered';

vi.mock('../../../hooks');
const mockUseWeather = vi.mocked(useWeather);
const mockUseHourlyForecast = vi.mocked(useHourlyForecast);

describe('WeatherCentered', () => {
  const mockWeatherData = {
    id: '1',
    city: 'New York',
    country: 'US',
    temperature: 22.7,
    description: 'partly cloudy',
    minTemperature: 18.3,
    maxTemperature: 25.8,
    windSpeed: 10,
    humidity: 65,
    icon: 'cloudy.png',
    timestamp: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWeather.mockReturnValue({
      weather: mockWeatherData,
      isLoading: false,
      error: null,
    });
    mockUseHourlyForecast.mockReturnValue({
      hourlyData: [
        {
          id: 'test-hour-1',
          time: 11,
          temp: 23,
          icon: <div>test-icon</div>,
          isNow: true,
        },
      ],
      weatherSummary: 'Test weather summary',
    });
  });

  it('renders weather information correctly', () => {
    render(<WeatherCentered />);

    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('23°')).toBeInTheDocument(); // Math.round(22.7)
    expect(screen.getByText('partly cloudy')).toBeInTheDocument();
    expect(screen.getByText('H:26° L:18°')).toBeInTheDocument(); // Math.round(25.8) and Math.round(18.3)
  });

  it('rounds temperature correctly', () => {
    const weatherWithDecimals = {
      ...mockWeatherData,
      temperature: 22.4,
      maxTemperature: 25.2,
      minTemperature: 18.8,
    };

    mockUseWeather.mockReturnValue({
      weather: weatherWithDecimals,
      isLoading: false,
      error: null,
    });

    mockUseHourlyForecast.mockReturnValue({
      hourlyData: [
        {
          id: 'test-hour-1',
          time: 11,
          temp: 22,
          icon: <div>test-icon</div>,
          isNow: true,
        },
      ],
      weatherSummary: 'Test weather summary',
    });

    render(<WeatherCentered />);

    expect(screen.getByText('22°')).toBeInTheDocument();
    expect(screen.getByText('H:25° L:19°')).toBeInTheDocument(); // Math.round(25.2) and Math.round(18.8)
  });

  it('handles negative temperatures', () => {
    const coldWeather = {
      ...mockWeatherData,
      temperature: -5.3,
      maxTemperature: -2.1,
      minTemperature: -8.7,
    };

    mockUseWeather.mockReturnValue({
      weather: coldWeather,
      isLoading: false,
      error: null,
    });

    mockUseHourlyForecast.mockReturnValue({
      hourlyData: [
        {
          id: 'test-hour-1',
          time: 11,
          temp: -5,
          icon: <div>test-icon</div>,
          isNow: true,
        },
      ],
      weatherSummary: 'Test weather summary',
    });

    render(<WeatherCentered />);

    expect(screen.getByText('-5°')).toBeInTheDocument();
    expect(screen.getByText('H:-2° L:-9°')).toBeInTheDocument();
  });

  it('capitalizes weather description', () => {
    const weatherWithLowercase = {
      ...mockWeatherData,
      description: 'heavy rain',
    };

    mockUseWeather.mockReturnValue({
      weather: weatherWithLowercase,
      isLoading: false,
      error: null,
    });

    mockUseHourlyForecast.mockReturnValue({
      hourlyData: [
        {
          id: 'test-hour-1',
          time: 11,
          temp: 23,
          icon: <div>test-icon</div>,
          isNow: true,
        },
      ],
      weatherSummary: 'Test weather summary',
    });

    render(<WeatherCentered />);

    expect(screen.getByText('heavy rain')).toBeInTheDocument();
    expect(screen.getByText('heavy rain')).toHaveClass('capitalize');
  });

  it('renders with correct CSS classes', () => {
    const { container } = render(<WeatherCentered />);

    // Check main container
    expect(container.querySelector('.flex-1')).toBeInTheDocument();
    expect(container.querySelector('.flex')).toBeInTheDocument();
    expect(container.querySelector('.items-center')).toBeInTheDocument();
    expect(container.querySelector('.justify-center')).toBeInTheDocument();

    // Check inner container
    const innerContainer = container.querySelector('.text-center');
    expect(innerContainer).toBeInTheDocument();
    expect(innerContainer).toHaveClass(
      'py-8',
      'md:py-16',
      'max-w-md',
      'w-full',
      'px-4',
      'mt-16',
      'md:mt-0'
    );
  });

  it('renders city name with correct styling', () => {
    render(<WeatherCentered />);

    const cityElement = screen.getByText('New York');
    expect(cityElement).toHaveClass(
      'text-3xl',
      'md:text-5xl',
      'font-light',
      'text-white',
      'mb-4',
      'md:mb-6'
    );
  });

  it('renders temperature with correct styling', () => {
    render(<WeatherCentered />);

    const temperatureElement = screen.getByText('23°');
    expect(temperatureElement).toHaveClass(
      'text-6xl',
      'md:text-8xl',
      'font-ultralight',
      'text-white',
      'leading-none',
      'mb-2'
    );
  });

  it('renders description with correct styling', () => {
    render(<WeatherCentered />);

    const descriptionElement = screen.getByText('partly cloudy');
    expect(descriptionElement).toHaveClass(
      'text-white/70',
      'text-lg',
      'md:text-xl',
      'capitalize',
      'mb-1'
    );
  });

  it('renders high/low temperatures with correct styling', () => {
    render(<WeatherCentered />);

    const highLowElement = screen.getByText('H:26° L:18°');
    expect(highLowElement).toHaveClass(
      'text-white/60',
      'text-base',
      'md:text-lg'
    );
  });

  it('handles very high temperatures', () => {
    const hotWeather = {
      ...mockWeatherData,
      temperature: 45.2,
      maxTemperature: 47.8,
      minTemperature: 42.1,
    };

    mockUseWeather.mockReturnValue({
      weather: hotWeather,
      isLoading: false,
      error: null,
    });

    mockUseHourlyForecast.mockReturnValue({
      hourlyData: [
        {
          id: 'test-hour-1',
          time: 11,
          temp: 45,
          icon: <div>test-icon</div>,
          isNow: true,
        },
      ],
      weatherSummary: 'Test weather summary',
    });

    render(<WeatherCentered />);

    expect(screen.getByText('45°')).toBeInTheDocument();
    expect(screen.getByText('H:48° L:42°')).toBeInTheDocument();
  });

  it('handles zero temperatures', () => {
    const freezingWeather = {
      ...mockWeatherData,
      temperature: 0,
      maxTemperature: 1.2,
      minTemperature: -1.8,
    };

    mockUseWeather.mockReturnValue({
      weather: freezingWeather,
      isLoading: false,
      error: null,
    });

    mockUseHourlyForecast.mockReturnValue({
      hourlyData: [
        {
          id: 'test-hour-1',
          time: 11,
          temp: 0,
          icon: <div>test-icon</div>,
          isNow: true,
        },
      ],
      weatherSummary: 'Test weather summary',
    });

    render(<WeatherCentered />);

    expect(screen.getByText('0°')).toBeInTheDocument();
    expect(screen.getByText('H:1° L:-2°')).toBeInTheDocument();
  });

  it('handles empty city name', () => {
    const weatherWithEmptyCity = {
      ...mockWeatherData,
      city: '',
    };

    mockUseWeather.mockReturnValue({
      weather: weatherWithEmptyCity,
      isLoading: false,
      error: null,
    });

    mockUseHourlyForecast.mockReturnValue({
      hourlyData: [
        {
          id: 'test-hour-1',
          time: 11,
          temp: 23,
          icon: <div>test-icon</div>,
          isNow: true,
        },
      ],
      weatherSummary: 'Test weather summary',
    });

    const { container } = render(<WeatherCentered />);

    const cityElement = container.querySelector('h1');
    expect(cityElement).toBeInTheDocument();
    expect(cityElement).toHaveTextContent('');
  });

  it('handles empty description', () => {
    const weatherWithEmptyDescription = {
      ...mockWeatherData,
      description: '',
    };

    mockUseWeather.mockReturnValue({
      weather: weatherWithEmptyDescription,
      isLoading: false,
      error: null,
    });

    mockUseHourlyForecast.mockReturnValue({
      hourlyData: [
        {
          id: 'test-hour-1',
          time: 11,
          temp: 23,
          icon: <div>test-icon</div>,
          isNow: true,
        },
      ],
      weatherSummary: 'Test weather summary',
    });

    const { container } = render(<WeatherCentered />);

    const descriptionElement = container.querySelector('.text-white\\/70');
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement).toHaveTextContent('');
  });

  it('falls back to weather.temperature when hourlyData is empty', () => {
    const weatherWithTemp = {
      ...mockWeatherData,
      temperature: 18,
    };

    mockUseWeather.mockReturnValue({
      weather: weatherWithTemp,
      isLoading: false,
      error: null,
    });

    mockUseHourlyForecast.mockReturnValue({
      hourlyData: [],
      weatherSummary: 'Test weather summary',
    });

    render(<WeatherCentered />);

    expect(screen.getByText('18°')).toBeInTheDocument();
  });
});
