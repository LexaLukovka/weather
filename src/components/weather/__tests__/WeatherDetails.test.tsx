import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { type WeatherData } from '../../../types';
import { WeatherDetails } from '../WeatherDetails';

// Mock the useWeather hook
vi.mock('../../../hooks', () => ({
  useWeather: vi.fn(),
}));

// Mock weather utility functions
vi.mock('../../../utils', () => ({
  getUVDescription: vi.fn((uv: number) => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  }),
  getHumidityDescription: vi.fn((humidity: number) => {
    if (humidity <= 30) return 'Dry';
    if (humidity <= 60) return 'Normal';
    if (humidity <= 80) return 'Humid';
    return 'Very Humid';
  }),
  getVisibilityDescription: vi.fn((visibility: number) => {
    if (visibility >= 10) return 'Excellent';
    if (visibility >= 5) return 'Good';
    if (visibility >= 2) return 'Moderate';
    return 'Poor';
  }),
}));

import { useWeather } from '../../../hooks';

const mockWeatherData: WeatherData = {
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
  feelsLike: 22,
  uv: 5,
  visibility: 10,
  pressure: 1013,
  sunrise: '06:00',
  sunset: '18:00',
  moonPhase: 'Waxing Crescent',
  moonIllumination: 25,
  precipitation: 0,
};

describe('WeatherDetails', () => {
  beforeEach(() => {
    vi.mocked(useWeather).mockReturnValue({
      weather: mockWeatherData,
      isLoading: false,
      error: null,
    });
  });

  it('renders all weather detail cards', () => {
    render(<WeatherDetails />);

    expect(screen.getByText('UV Index')).toBeInTheDocument();
    expect(screen.getByText('Sunrise')).toBeInTheDocument();
    expect(screen.getByText('Wind')).toBeInTheDocument();
    expect(screen.getByText('Precipitation')).toBeInTheDocument();
    expect(screen.getByText('Feels Like')).toBeInTheDocument();
    expect(screen.getByText('Humidity')).toBeInTheDocument();
    expect(screen.getByText('Visibility')).toBeInTheDocument();
    expect(screen.getByText('Pressure')).toBeInTheDocument();
  });

  it('displays feels like temperature', () => {
    render(<WeatherDetails />);

    expect(screen.getByText('22°')).toBeInTheDocument();
  });

  it('displays wind speed', () => {
    render(<WeatherDetails />);

    expect(screen.getByText('10.00')).toBeInTheDocument();
    expect(screen.getByText('m/s')).toBeInTheDocument();
  });

  it('displays humidity', () => {
    render(<WeatherDetails />);

    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('displays UV index', () => {
    render(<WeatherDetails />);

    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('displays visibility', () => {
    render(<WeatherDetails />);

    expect(screen.getByText('10 km')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('displays pressure', () => {
    render(<WeatherDetails />);

    expect(screen.getByText('1013')).toBeInTheDocument();
    expect(screen.getByText('hPa')).toBeInTheDocument();
  });

  it('displays sunrise and sunset', () => {
    render(<WeatherDetails />);

    expect(screen.getByText('06:00')).toBeInTheDocument();
    expect(screen.getByText('Sunset: 18:00')).toBeInTheDocument();
  });

  it('displays precipitation', () => {
    render(<WeatherDetails />);

    expect(screen.getByText('0.0 mm')).toBeInTheDocument();
    expect(screen.getByText('No rain today')).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalWeather: WeatherData = {
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
    };

    vi.mocked(useWeather).mockReturnValue({
      weather: minimalWeather,
      isLoading: false,
      error: null,
    });

    render(<WeatherDetails />);

    expect(screen.getByText('Wind')).toBeInTheDocument();
    expect(screen.getByText('Humidity')).toBeInTheDocument();
    // Check for fallback values when fields are missing
    expect(screen.getByText('0')).toBeInTheDocument(); // UV fallback
    expect(screen.getByText('06:41')).toBeInTheDocument(); // Sunrise fallback
    expect(screen.getByText('Sunset: 19:00')).toBeInTheDocument(); // Sunset fallback
  });

  it('categorizes UV index correctly', () => {
    vi.mocked(useWeather).mockReturnValue({
      weather: { ...mockWeatherData, uv: 2 },
      isLoading: false,
      error: null,
    });
    const { rerender } = render(<WeatherDetails />);
    expect(screen.getByText('Low')).toBeInTheDocument();

    vi.mocked(useWeather).mockReturnValue({
      weather: { ...mockWeatherData, uv: 8 },
      isLoading: false,
      error: null,
    });
    rerender(<WeatherDetails />);
    expect(screen.getByText('Very High')).toBeInTheDocument();

    vi.mocked(useWeather).mockReturnValue({
      weather: { ...mockWeatherData, uv: 12 },
      isLoading: false,
      error: null,
    });
    rerender(<WeatherDetails />);
    expect(screen.getByText('Extreme')).toBeInTheDocument();
  });

  it('applies correct grid layout', () => {
    const { container } = render(<WeatherDetails />);

    expect(container.querySelector('.grid')).toBeInTheDocument();
    expect(container.querySelector('.grid-cols-2')).toBeInTheDocument();
  });
});
