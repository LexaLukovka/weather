import { type FC } from 'react';

import { RefreshCw } from 'lucide-react';

import { useWeatherStore } from '../../stores';
import { type WeatherError as WeatherErrorType } from '../../types/weather';
import { getErrorTitle, getErrorIcon } from '../../utils';

interface WeatherErrorProps {
  error: WeatherErrorType;
  onRetry?: () => void;
  className?: string;
}

export const WeatherError: FC<WeatherErrorProps> = ({
  error,
  onRetry,
  className = '',
}) => {
  const { clearError } = useWeatherStore();

  const handleRetry = () => {
    clearError();
    onRetry?.();
  };

  return (
    <div className='flex-1 flex items-center justify-center min-h-screen p-4 md:p-8'>
      <div className='glass-morphism rounded-3xl p-6 md:p-8 max-w-md w-full mx-auto shadow-2xl'>
        <div
          className={`bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6 text-center ${className}`}
        >
          <div className='flex items-center justify-center gap-3 mb-4'>
            {getErrorIcon(error.code)}
            <h3 className='text-red-200 font-semibold text-lg'>
              {getErrorTitle(error.code)}
            </h3>
          </div>
          <p className='text-red-100 mb-6 text-sm leading-relaxed'>
            {error.message}
          </p>
          <div className='flex gap-3 justify-center'>
            {onRetry && (
              <button
                onClick={handleRetry}
                className='bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium'
              >
                <RefreshCw className='h-4 w-4' />
                Try Again
              </button>
            )}
            <button
              onClick={clearError}
              className='text-red-200 hover:text-white px-4 py-2 rounded-lg text-sm font-medium'
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
