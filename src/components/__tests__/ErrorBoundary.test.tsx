import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ErrorBoundary } from '../ErrorBoundary';

// Test component that can throw errors on demand
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  let originalEnv: string | undefined;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      // Intentionally empty for testing
    });
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
    consoleErrorSpy.mockRestore();
  });

  describe('Normal Operation', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches errors and displays default fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByText('Oops! Something went wrong')
      ).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Try Again' })
      ).toBeInTheDocument();
    });

    it('displays custom fallback UI when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(
        screen.queryByText('Oops! Something went wrong')
      ).not.toBeInTheDocument();
    });

    it('calls onError callback when error occurs', () => {
      const onErrorMock = vi.fn();

      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('logs error in development mode', () => {
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('does not log error in production mode', () => {
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check that our specific error log was not called (React's internal error logs may still occur)
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Error Recovery', () => {
    it('retry button exists and is clickable', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error state should be displayed
      expect(
        screen.getByText('Oops! Something went wrong')
      ).toBeInTheDocument();
      const button = screen.getByRole('button', { name: 'Try Again' });

      // Button should be present and clickable
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      // Should be able to click without errors
      fireEvent.click(button);
    });
  });

  describe('ErrorFallback Component', () => {
    it('displays error message from error object', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('displays default message when no error message is available', () => {
      // Component that throws error without message
      const ThrowErrorWithoutMessage = () => {
        throw new Error('');
      };

      render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      );

      expect(
        screen.getByText('An unexpected error occurred. Please try again.')
      ).toBeInTheDocument();
    });

    it('has correct CSS classes and structure', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const outerContainer = container.querySelector('.min-h-screen');
      expect(outerContainer).toHaveClass(
        'min-h-screen',
        'flex',
        'items-center',
        'justify-center',
        'weather-gradient'
      );

      const errorCard = container.querySelector('.glass-morphism');
      expect(errorCard).toHaveClass(
        'glass-morphism',
        'rounded-3xl',
        'p-8',
        'max-w-md',
        'mx-4',
        'text-center'
      );

      const button = screen.getByRole('button', { name: 'Try Again' });
      expect(button).toHaveClass(
        'bg-white/10',
        'hover:bg-white/20',
        'text-white',
        'font-medium',
        'py-3',
        'px-6',
        'rounded-lg'
      );
    });

    it('contains warning icon SVG', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-8', 'h-8', 'text-red-400');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });

  describe('Component Display Names', () => {
    it('has correct display name for ErrorBoundary', () => {
      expect(ErrorBoundary.displayName).toBe('ErrorBoundary');
    });
  });

  describe('Edge Cases', () => {
    it('handles errors without componentStack', () => {
      const onErrorMock = vi.fn();

      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should still call onError even if componentStack might be missing
      expect(onErrorMock).toHaveBeenCalledTimes(1);
    });

    it('handles errors from nested components', () => {
      const NestedComponent = () => (
        <div>
          <ThrowError shouldThrow={true} />
        </div>
      );

      render(
        <ErrorBoundary>
          <NestedComponent />
        </ErrorBoundary>
      );

      expect(
        screen.getByText('Oops! Something went wrong')
      ).toBeInTheDocument();
    });

    it('does not interfere with onError when no custom handler provided', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should not throw error when onError is not provided
      expect(
        screen.getByText('Oops! Something went wrong')
      ).toBeInTheDocument();
    });
  });
});
