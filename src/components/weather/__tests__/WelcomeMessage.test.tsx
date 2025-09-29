import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import '@testing-library/jest-dom';
import { useWeatherStore, type WeatherState } from '../../../stores';
import { WelcomeMessage } from '../WelcomeMessage';

// Mock the weather store
vi.mock('../../../stores');
const mockUseWeatherStore = vi.mocked(useWeatherStore);

// Mock CloudIcon
vi.mock('../../icons', () => ({
  CloudIcon: ({ size, className }: { size: number; className: string }) => (
    <div data-testid='cloud-icon' data-size={size} className={className}>
      CloudIcon
    </div>
  ),
}));

// Mock CitySearch
vi.mock('../../search', () => ({
  CitySearch: ({
    isLightTheme,
    className,
  }: {
    isLightTheme?: boolean;
    className?: string;
  }) => (
    <div
      data-testid='city-search'
      data-light-theme={isLightTheme}
      className={className}
    >
      CitySearch
    </div>
  ),
}));

describe('WelcomeMessage', () => {
  const mockSearchLocalWeather = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWeatherStore.mockReturnValue({
      locationPermissionDenied: false,
      searchLocalWeather: mockSearchLocalWeather,
    } as unknown as WeatherState);
  });

  it('renders welcome message when location permission is not denied', () => {
    render(<WelcomeMessage />);

    expect(screen.getByText('Welcome to Weather')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Search for a city or use your current location to get started'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Use Current Location')).toBeInTheDocument();
  });

  it('renders location denied message when permission is denied', () => {
    mockUseWeatherStore.mockReturnValue({
      locationPermissionDenied: true,
      searchLocalWeather: mockSearchLocalWeather,
    } as unknown as WeatherState);

    render(<WelcomeMessage />);

    expect(screen.getByText('Location Access Denied')).toBeInTheDocument();
    expect(
      screen.getByText('Search for a city to get weather information')
    ).toBeInTheDocument();
    expect(screen.getByText('Try Current Location Again')).toBeInTheDocument();
  });

  it('renders CloudIcon with correct props', () => {
    render(<WelcomeMessage />);

    const cloudIcon = screen.getByTestId('cloud-icon');
    expect(cloudIcon).toBeInTheDocument();
    expect(cloudIcon).toHaveAttribute('data-size', '96');
    expect(cloudIcon).toHaveClass(
      'w-16',
      'h-16',
      'md:w-24',
      'md:h-24',
      'mx-auto'
    );
  });

  it('renders CitySearch with default theme', () => {
    render(<WelcomeMessage />);

    const citySearch = screen.getByTestId('city-search');
    expect(citySearch).toBeInTheDocument();
    expect(citySearch).toHaveAttribute('data-light-theme', 'false');
    expect(citySearch).toHaveClass('mb-6');
  });

  it('renders CitySearch with light theme when specified', () => {
    render(<WelcomeMessage isLightTheme={true} />);

    const citySearch = screen.getByTestId('city-search');
    expect(citySearch).toHaveAttribute('data-light-theme', 'true');
  });

  it('calls searchLocalWeather when button is clicked', () => {
    render(<WelcomeMessage />);

    const button = screen.getByText('Use Current Location');
    fireEvent.click(button);

    expect(mockSearchLocalWeather).toHaveBeenCalledTimes(1);
  });

  it('calls searchLocalWeather when retry button is clicked', () => {
    mockUseWeatherStore.mockReturnValue({
      locationPermissionDenied: true,
      searchLocalWeather: mockSearchLocalWeather,
    } as unknown as WeatherState);

    render(<WelcomeMessage />);

    const button = screen.getByText('Try Current Location Again');
    fireEvent.click(button);

    expect(mockSearchLocalWeather).toHaveBeenCalledTimes(1);
  });

  it('renders with correct CSS classes', () => {
    const { container } = render(<WelcomeMessage />);

    // Check main container
    expect(container.querySelector('.flex-1')).toBeInTheDocument();
    expect(container.querySelector('.flex')).toBeInTheDocument();
    expect(container.querySelector('.items-center')).toBeInTheDocument();
    expect(container.querySelector('.justify-center')).toBeInTheDocument();
    expect(container.querySelector('.p-4')).toBeInTheDocument();

    // Check glass morphism container
    const glassContainer = container.querySelector('.glass-morphism');
    expect(glassContainer).toBeInTheDocument();
    expect(glassContainer).toHaveClass(
      'rounded-3xl',
      'p-8',
      'md:p-12',
      'text-center',
      'max-w-lg',
      'w-full',
      'animate-fade-in',
      'mx-4'
    );
  });

  it('renders title with correct styling', () => {
    render(<WelcomeMessage />);

    const title = screen.getByText('Welcome to Weather');
    expect(title).toHaveClass(
      'text-xl',
      'md:text-2xl',
      'font-semibold',
      'text-white',
      'mb-3'
    );
  });

  it('renders description with correct styling', () => {
    render(<WelcomeMessage />);

    const description = screen.getByText(
      'Search for a city or use your current location to get started'
    );
    expect(description).toHaveClass(
      'text-sm',
      'md:text-base',
      'text-white/70',
      'mb-6'
    );
  });

  it('renders button with correct styling', () => {
    render(<WelcomeMessage />);

    const button = screen.getByText('Use Current Location');
    expect(button).toHaveClass(
      'bg-white/10',
      'hover:bg-white/20',
      'text-white',
      'px-4',
      'py-2',
      'rounded-lg',
      'text-sm',
      'transition-colors',
      'font-medium'
    );
  });

  it('renders cloud icon container with animation classes', () => {
    const { container } = render(<WelcomeMessage />);

    const iconContainer = container.querySelector(
      '.mb-4.md\\:mb-6.animate-float'
    );
    expect(iconContainer).toBeInTheDocument();
  });

  it('handles isLightTheme prop correctly', () => {
    const { rerender } = render(<WelcomeMessage />);

    // Test default (false)
    let citySearch = screen.getByTestId('city-search');
    expect(citySearch).toHaveAttribute('data-light-theme', 'false');

    // Test explicit false
    rerender(<WelcomeMessage isLightTheme={false} />);
    citySearch = screen.getByTestId('city-search');
    expect(citySearch).toHaveAttribute('data-light-theme', 'false');

    // Test true
    rerender(<WelcomeMessage isLightTheme={true} />);
    citySearch = screen.getByTestId('city-search');
    expect(citySearch).toHaveAttribute('data-light-theme', 'true');
  });

  it('renders all content regardless of permission state', () => {
    // Test with permission denied
    mockUseWeatherStore.mockReturnValue({
      locationPermissionDenied: true,
      searchLocalWeather: mockSearchLocalWeather,
    } as unknown as WeatherState);

    render(<WelcomeMessage />);

    expect(screen.getByTestId('cloud-icon')).toBeInTheDocument();
    expect(screen.getByTestId('city-search')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Test with permission not denied
    mockUseWeatherStore.mockReturnValue({
      locationPermissionDenied: false,
      searchLocalWeather: mockSearchLocalWeather,
    } as unknown as WeatherState);

    render(<WelcomeMessage />);

    expect(screen.getAllByTestId('cloud-icon')).toHaveLength(2); // Both renders
    expect(screen.getAllByTestId('city-search')).toHaveLength(2); // Both renders
    expect(screen.getAllByRole('button')).toHaveLength(2); // Both renders
  });
});
