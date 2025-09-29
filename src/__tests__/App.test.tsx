import { type ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import App from '../App';
import { useSidebarState, useWeatherTheme, useWeatherRetry } from '../hooks';
import { useWeatherStore } from '../stores';
import { type WeatherError } from '../types';

import { createMockError, expectElementToHaveClasses } from './utils';

// Mock the components
vi.mock('../components', () => ({
  SidebarWithToggle: ({
    isOpen,
    onToggle,
  }: {
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <div data-testid='sidebar-toggle' data-open={isOpen}>
      <button onClick={onToggle}>Toggle Sidebar</button>
    </div>
  ),
  WeatherMain: ({
    error,
    onRetry,
    sidebarOpen,
    isLightTheme,
  }: {
    error: { message: string; code: string } | null;
    onRetry: () => void;
    sidebarOpen: boolean;
    isLightTheme: boolean;
  }) => (
    <div
      data-testid='weather-main'
      data-sidebar-open={sidebarOpen}
      data-light-theme={isLightTheme}
    >
      {error && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
  ErrorBoundary: ({ children }: { children: ReactNode }) => (
    <div data-testid='error-boundary'>{children}</div>
  ),
}));

vi.mock('../contexts/WeatherProvider', () => ({
  WeatherProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid='weather-provider'>{children}</div>
  ),
}));

// Mock hooks
vi.mock('../stores/weatherStore', () => ({
  useWeatherStore: vi.fn(),
}));

vi.mock('../hooks', () => ({
  useSidebarState: vi.fn(),
  useWeatherTheme: vi.fn(),
  useWeatherRetry: vi.fn(),
  useInitialCity: vi.fn(),
}));

describe('App', () => {
  // Mock functions with better naming and organization
  const mockHandlers = {
    toggleSidebar: vi.fn(),
    retry: vi.fn(),
  };

  const mockHooks = {
    useWeatherStore: vi.mocked(useWeatherStore),
    useSidebarState: vi.mocked(useSidebarState),
    useWeatherTheme: vi.mocked(useWeatherTheme),
    useWeatherRetry: vi.mocked(useWeatherRetry),
  };

  // Default mock return values
  const defaultMockValues = {
    weatherStore: {
      currentWeather: null,
      error: null as WeatherError | null,
    },
    sidebarState: {
      sidebarOpen: false,
      handleToggleSidebar: mockHandlers.toggleSidebar,
    },
    weatherTheme: {
      backgroundClass: 'bg-blue-500',
      isLightTheme: false,
      textContrastClass: 'text-white',
    },
    weatherRetry: mockHandlers.retry,
  };

  const setupMocks = (
    overrides: {
      weatherStore?: Partial<{
        currentWeather: null;
        error: WeatherError | null;
      }>;
      sidebarState?: Partial<typeof defaultMockValues.sidebarState>;
      weatherTheme?: Partial<typeof defaultMockValues.weatherTheme>;
      weatherRetry?: typeof defaultMockValues.weatherRetry;
    } = {}
  ) => {
    mockHooks.useWeatherStore.mockReturnValue({
      ...defaultMockValues.weatherStore,
      ...overrides.weatherStore,
    });

    mockHooks.useSidebarState.mockReturnValue({
      ...defaultMockValues.sidebarState,
      ...overrides.sidebarState,
    });

    mockHooks.useWeatherTheme.mockReturnValue({
      ...defaultMockValues.weatherTheme,
      ...overrides.weatherTheme,
    });

    mockHooks.useWeatherRetry.mockReturnValue(
      overrides.weatherRetry || defaultMockValues.weatherRetry
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('weather-provider')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('weather-main')).toBeInTheDocument();
  });

  it('applies theme classes correctly', () => {
    setupMocks({
      weatherTheme: {
        backgroundClass: 'bg-gradient-to-br from-blue-400 to-blue-600',
        isLightTheme: true,
        textContrastClass: 'text-gray-800',
      },
    });

    const { container } = render(<App />);
    const appContainer = container.querySelector('.min-h-screen');

    expectElementToHaveClasses(appContainer, [
      'bg-gradient-to-br',
      'from-blue-400',
      'to-blue-600',
      'text-gray-800',
      'transition-all',
    ]);

    expect(appContainer).toHaveStyle('transition-duration: 1000ms');
  });

  it('passes sidebar state correctly', () => {
    setupMocks({
      sidebarState: {
        sidebarOpen: true,
        handleToggleSidebar: mockHandlers.toggleSidebar,
      },
    });

    render(<App />);

    const sidebar = screen.getByTestId('sidebar-toggle');
    const weatherMain = screen.getByTestId('weather-main');

    expect(sidebar).toHaveAttribute('data-open', 'true');
    expect(weatherMain).toHaveAttribute('data-sidebar-open', 'true');
  });

  it('handles sidebar toggle', async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggleButton = screen.getByText('Toggle Sidebar');
    await user.click(toggleButton);

    expect(mockHandlers.toggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('passes error to WeatherMain', () => {
    const testError = createMockError('Network error', 'NETWORK_ERROR');
    setupMocks({
      weatherStore: {
        error: testError,
      },
    });

    render(<App />);

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  });

  it('handles retry action', async () => {
    const user = userEvent.setup();
    const mockError = { message: 'Test error', code: 'TEST_ERROR' };
    setupMocks({
      weatherStore: {
        error: mockError,
      },
    });

    render(<App />);

    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);

    expect(mockHandlers.retry).toHaveBeenCalledTimes(1);
  });

  it('passes light theme state correctly', () => {
    setupMocks({
      weatherTheme: {
        backgroundClass: 'bg-white',
        isLightTheme: true,
        textContrastClass: 'text-gray-900',
      },
    });

    render(<App />);

    const weatherMain = screen.getByTestId('weather-main');
    expect(weatherMain).toHaveAttribute('data-light-theme', 'true');
  });

  it('has correct display name', () => {
    expect(App.displayName).toBe('App');
  });

  it('uses correct hook with delay for sidebar state', () => {
    render(<App />);
    expect(mockHooks.useSidebarState).toHaveBeenCalledWith(150);
  });
});
