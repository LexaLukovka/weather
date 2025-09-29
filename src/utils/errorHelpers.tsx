import { type JSX } from 'react';

import { AlertCircle, RefreshCw } from 'lucide-react';

export const getErrorTitle = (code?: string): string => {
  switch (code) {
    case 'CITY_NOT_FOUND':
      return 'City Not Found';
    case 'NETWORK_ERROR':
      return 'Connection Error';
    case 'RATE_LIMIT':
      return 'Too Many Requests';
    case 'INVALID_INPUT':
      return 'Invalid Input';
    default:
      return 'Something went wrong';
  }
};

export const getErrorIcon = (code?: string): JSX.Element => {
  switch (code) {
    case 'NETWORK_ERROR':
      return <RefreshCw className='h-4 w-4 text-red-500' />;
    default:
      return <AlertCircle className='h-4 w-4 text-red-500' />;
  }
};
