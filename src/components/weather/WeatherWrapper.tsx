import { type FC, type ReactNode } from 'react';

import { useWeatherData } from '../../hooks';

interface WeatherWrapperProps {
  children: ReactNode;
}

export const WeatherWrapper: FC<WeatherWrapperProps> = ({ children }) => {
  const { weather, isLoading } = useWeatherData();

  if (!weather) {
    if (isLoading) {
      return (
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-white/60 text-lg'>Loading weather data...</div>
        </div>
      );
    }

    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-white/60 text-lg'>No weather data available</div>
      </div>
    );
  }

  return children;
};
