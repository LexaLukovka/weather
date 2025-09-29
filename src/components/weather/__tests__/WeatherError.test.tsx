import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import '@testing-library/jest-dom';
import { useWeatherStore, type WeatherState } from '../../../stores';
import * as utils from '../../../utils';
import { WeatherError } from '../WeatherError';

// Mock the weather store
vi.mock('../../../stores/weatherStore');
const mockUseWeatherStore = vi.mocked(useWeatherStore);

// Mock the utils
vi.mock('../../../utils', () => ({
  getErrorTitle: vi.fn(),
  getErrorIcon: vi.fn(),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  RefreshCw: () => <div data-testid='refresh-icon'>RefreshCw</div>,
}));

describe('WeatherError', () => {
  const mockClearError = vi.fn();
  const mockOnRetry = vi.fn();

  const mockError = {
    message: 'Test error message',
    code: 'TEST_ERROR',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWeatherStore.mockReturnValue({
      clearError: mockClearError,
    } as unknown as WeatherState);

    vi.mocked(utils.getErrorTitle).mockReturnValue('Error Title');
    vi.mocked(utils.getErrorIcon).mockReturnValue(
      <div data-testid='error-icon'>ErrorIcon</div>
    );
  });

  it('renders error message correctly', () => {
    render(<WeatherError error={mockError} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('calls getErrorTitle and getErrorIcon with correct code', () => {
    render(<WeatherError error={mockError} />);

    expect(utils.getErrorTitle).toHaveBeenCalledWith('TEST_ERROR');
    expect(utils.getErrorIcon).toHaveBeenCalledWith('TEST_ERROR');
  });

  it('renders dismiss button and calls clearError when clicked', () => {
    render(<WeatherError error={mockError} />);

    const dismissButton = screen.getByText('Dismiss');
    expect(dismissButton).toBeInTheDocument();

    fireEvent.click(dismissButton);
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  it('renders retry button when onRetry is provided', () => {
    render(<WeatherError error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<WeatherError error={mockError} />);

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    expect(screen.queryByTestId('refresh-icon')).not.toBeInTheDocument();
  });

  it('calls clearError and onRetry when retry button is clicked', () => {
    render(<WeatherError error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(mockClearError).toHaveBeenCalledTimes(1);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <WeatherError error={mockError} className='custom-class' />
    );

    const errorContainer = container.querySelector('.custom-class');
    expect(errorContainer).toBeInTheDocument();
  });

  it('applies default className when none provided', () => {
    const { container } = render(<WeatherError error={mockError} />);

    const errorContainer = container.querySelector('.bg-red-900\\/20');
    expect(errorContainer).toBeInTheDocument();
  });

  it('renders with correct CSS classes', () => {
    const { container } = render(<WeatherError error={mockError} />);

    expect(container.querySelector('.flex-1')).toBeInTheDocument();
    expect(container.querySelector('.glass-morphism')).toBeInTheDocument();
    expect(container.querySelector('.bg-red-900\\/20')).toBeInTheDocument();
    expect(container.querySelector('.border-red-500\\/30')).toBeInTheDocument();
  });

  it('handles error without code', () => {
    const errorWithoutCode = {
      message: 'Error without code',
    };

    render(<WeatherError error={errorWithoutCode} />);

    expect(utils.getErrorTitle).toHaveBeenCalledWith(undefined);
    expect(utils.getErrorIcon).toHaveBeenCalledWith(undefined);
    expect(screen.getByText('Error without code')).toBeInTheDocument();
  });

  it('handles empty error message', () => {
    const errorWithEmptyMessage = {
      message: '',
      code: 'EMPTY_ERROR',
    };

    const { container } = render(
      <WeatherError error={errorWithEmptyMessage} />
    );

    const messageElement = container.querySelector(
      '.text-red-100.mb-6.text-sm.leading-relaxed'
    );
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveTextContent('');
    expect(utils.getErrorTitle).toHaveBeenCalledWith('EMPTY_ERROR');
  });

  it('renders correct button styling', () => {
    render(<WeatherError error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try Again');
    const dismissButton = screen.getByText('Dismiss');

    expect(retryButton).toHaveClass('bg-white/10', 'hover:bg-white/20');
    expect(dismissButton).toHaveClass('text-red-200', 'hover:text-white');
  });

  it('displays error title with correct styling', () => {
    render(<WeatherError error={mockError} />);

    const title = screen.getByText('Error Title');
    expect(title).toHaveClass('text-red-200', 'font-semibold', 'text-lg');
  });

  it('displays error message with correct styling', () => {
    render(<WeatherError error={mockError} />);

    const message = screen.getByText('Test error message');
    expect(message).toHaveClass(
      'text-red-100',
      'mb-6',
      'text-sm',
      'leading-relaxed'
    );
  });
});
