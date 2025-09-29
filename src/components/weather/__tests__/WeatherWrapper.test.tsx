import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import '@testing-library/jest-dom';
import { type WeatherContextValue } from '../../../contexts/WeatherContext';
import { useWeatherData } from '../../../hooks';
import { WeatherWrapper } from '../WeatherWrapper';

// Mock the useWeatherData hook
vi.mock('../../../hooks');
const mockUseWeatherData = vi.mocked(useWeatherData);

describe('WeatherWrapper', () => {
  const TestChildren = () => (
    <div data-testid='test-children'>Test Content</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when weather data is available', () => {
    mockUseWeatherData.mockReturnValue({
      weather: {
        id: '1',
        city: 'New York',
        country: 'US',
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

    render(
      <WeatherWrapper>
        <TestChildren />
      </WeatherWrapper>
    );

    expect(screen.getByTestId('test-children')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows loading message when weather data is loading', () => {
    mockUseWeatherData.mockReturnValue({
      weather: null,
      isLoading: true,
      error: null,
    });

    render(
      <WeatherWrapper>
        <TestChildren />
      </WeatherWrapper>
    );

    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
    expect(screen.queryByTestId('test-children')).not.toBeInTheDocument();
  });

  it('shows no data message when weather data is null and not loading', () => {
    mockUseWeatherData.mockReturnValue({
      weather: null,
      isLoading: false,
      error: null,
    });

    render(
      <WeatherWrapper>
        <TestChildren />
      </WeatherWrapper>
    );

    expect(screen.getByText('No weather data available')).toBeInTheDocument();
    expect(screen.queryByTestId('test-children')).not.toBeInTheDocument();
  });

  it('renders loading container with correct CSS classes', () => {
    mockUseWeatherData.mockReturnValue({
      weather: null,
      isLoading: true,
      error: null,
    });

    const { container } = render(
      <WeatherWrapper>
        <TestChildren />
      </WeatherWrapper>
    );

    const loadingContainer = container.querySelector('.min-h-screen');
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer).toHaveClass(
      'flex',
      'items-center',
      'justify-center'
    );

    const loadingText = container.querySelector('.text-white\\/60');
    expect(loadingText).toBeInTheDocument();
    expect(loadingText).toHaveClass('text-lg');
  });

  it('renders no data container with correct CSS classes', () => {
    mockUseWeatherData.mockReturnValue({
      weather: null,
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <WeatherWrapper>
        <TestChildren />
      </WeatherWrapper>
    );

    const noDataContainer = container.querySelector('.min-h-screen');
    expect(noDataContainer).toBeInTheDocument();
    expect(noDataContainer).toHaveClass(
      'flex',
      'items-center',
      'justify-center'
    );

    const noDataText = container.querySelector('.text-white\\/60');
    expect(noDataText).toBeInTheDocument();
    expect(noDataText).toHaveClass('text-lg');
  });

  it('handles complex children', () => {
    mockUseWeatherData.mockReturnValue({
      weather: {
        id: '1',
        city: 'London',
        country: 'UK',
        temperature: 18,
        description: 'Cloudy',
        minTemperature: 12,
        maxTemperature: 22,
        windSpeed: 8,
        humidity: 70,
        icon: 'cloudy.png',
        timestamp: Date.now(),
      },
      isLoading: false,
      error: null,
    });

    const ComplexChildren = () => (
      <div>
        <h1 data-testid='heading'>Weather App</h1>
        <p data-testid='description'>Current weather information</p>
        <button data-testid='action-button'>Refresh</button>
      </div>
    );

    render(
      <WeatherWrapper>
        <ComplexChildren />
      </WeatherWrapper>
    );

    expect(screen.getByTestId('heading')).toBeInTheDocument();
    expect(screen.getByTestId('description')).toBeInTheDocument();
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
    expect(screen.getByText('Weather App')).toBeInTheDocument();
    expect(screen.getByText('Current weather information')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('handles multiple children', () => {
    mockUseWeatherData.mockReturnValue({
      weather: {
        id: '1',
        city: 'Paris',
        country: 'France',
        temperature: 22,
        description: 'Sunny',
        minTemperature: 16,
        maxTemperature: 28,
        windSpeed: 5,
        humidity: 45,
        icon: 'sunny.png',
        timestamp: Date.now(),
      },
      isLoading: false,
      error: null,
    });

    render(
      <WeatherWrapper>
        <div data-testid='first-child'>First Child</div>
        <div data-testid='second-child'>Second Child</div>
        <span data-testid='third-child'>Third Child</span>
      </WeatherWrapper>
    );

    expect(screen.getByTestId('first-child')).toBeInTheDocument();
    expect(screen.getByTestId('second-child')).toBeInTheDocument();
    expect(screen.getByTestId('third-child')).toBeInTheDocument();
  });

  it('renders loading state correctly without weather data', () => {
    mockUseWeatherData.mockReturnValue({
      weather: null,
      isLoading: true,
      error: null,
    } as WeatherContextValue);

    render(
      <WeatherWrapper>
        <TestChildren />
      </WeatherWrapper>
    );

    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
    expect(screen.queryByTestId('test-children')).not.toBeInTheDocument();
  });

  it('handles falsy weather data correctly', () => {
    // Test with null weather
    mockUseWeatherData.mockReturnValue({
      weather: null,
      isLoading: false,
      error: null,
    } as WeatherContextValue);

    const { rerender } = render(
      <WeatherWrapper>
        <TestChildren />
      </WeatherWrapper>
    );

    expect(screen.getByText('No weather data available')).toBeInTheDocument();

    // Test with null weather
    mockUseWeatherData.mockReturnValue({
      weather: null,
      isLoading: false,
      error: null,
    });

    rerender(
      <WeatherWrapper>
        <TestChildren />
      </WeatherWrapper>
    );

    expect(screen.getByText('No weather data available')).toBeInTheDocument();
  });

  it('prioritizes loading state over no data state', () => {
    mockUseWeatherData.mockReturnValue({
      weather: null,
      isLoading: true,
      error: null,
    });

    render(
      <WeatherWrapper>
        <TestChildren />
      </WeatherWrapper>
    );

    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
    expect(
      screen.queryByText('No weather data available')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('test-children')).not.toBeInTheDocument();
  });

  it('passes through all props to children when weather is available', () => {
    mockUseWeatherData.mockReturnValue({
      weather: {
        id: '1',
        city: 'Tokyo',
        country: 'Japan',
        temperature: 25,
        description: 'Clear',
        minTemperature: 20,
        maxTemperature: 30,
        windSpeed: 7,
        humidity: 55,
        icon: 'clear.png',
        timestamp: Date.now(),
      },
      isLoading: false,
      error: null,
    });

    const ChildrenWithProps = ({ testProp }: { testProp: string }) => (
      <div data-testid='props-child' data-test-prop={testProp}>
        {testProp}
      </div>
    );

    render(
      <WeatherWrapper>
        <ChildrenWithProps testProp='test-value' />
      </WeatherWrapper>
    );

    const child = screen.getByTestId('props-child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveAttribute('data-test-prop', 'test-value');
    expect(child).toHaveTextContent('test-value');
  });
});
