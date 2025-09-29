import { type FC } from 'react';

import { useWeatherStore } from '../../stores';
import { CloudIcon } from '../icons';
import { CitySearch } from '../search';

interface WelcomeMessageProps {
  isLightTheme?: boolean;
}

export const WelcomeMessage: FC<WelcomeMessageProps> = ({
  isLightTheme = false,
}) => {
  const { locationPermissionDenied, searchLocalWeather } = useWeatherStore();

  const getTitle = locationPermissionDenied
    ? 'Location Access Denied'
    : 'Welcome to Weather';

  const getDescription = locationPermissionDenied
    ? 'Search for a city to get weather information'
    : 'Search for a city or use your current location to get started';

  const getButtonText = locationPermissionDenied
    ? 'Try Current Location Again'
    : 'Use Current Location';

  return (
    <div className='flex-1 flex items-center justify-center p-4 md:p-8'>
      <div className='glass-morphism rounded-3xl p-8 md:p-12 text-center max-w-lg w-full animate-fade-in mx-4'>
        <div className='mb-4 md:mb-6 animate-float'>
          <CloudIcon size={96} className='w-16 h-16 md:w-24 md:h-24 mx-auto' />
        </div>
        <h2 className='text-xl md:text-2xl font-semibold text-white mb-3'>
          {getTitle}
        </h2>
        <p className='text-sm md:text-base text-white/70 mb-6'>
          {getDescription}
        </p>

        <CitySearch isLightTheme={isLightTheme} className='mb-6' />

        <button
          onClick={searchLocalWeather}
          className='bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors font-medium'
        >
          {getButtonText}
        </button>
      </div>
    </div>
  );
};
