import { Component, memo, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

const ErrorFallback = memo<ErrorFallbackProps>(({ error, onRetry }) => {
  return (
    <div className='min-h-screen flex items-center justify-center weather-gradient'>
      <div className='glass-morphism rounded-3xl p-8 max-w-md mx-4 text-center'>
        <div className='w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center'>
          <svg
            className='w-8 h-8 text-red-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>

        <h2 className='text-white text-xl font-semibold mb-2'>
          Oops! Something went wrong
        </h2>

        <p className='text-white/70 text-sm mb-6'>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <button
          onClick={onRetry}
          className='bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg'
        >
          Try Again
        </button>
      </div>
    </div>
  );
});

ErrorFallback.displayName = 'ErrorFallback';

export const ErrorBoundary = memo<ErrorBoundaryProps>(props => (
  <ErrorBoundaryClass {...props} />
));

ErrorBoundary.displayName = 'ErrorBoundary';
