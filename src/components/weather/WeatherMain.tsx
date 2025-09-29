import { memo, type FC } from 'react';

import { useWeatherData } from '../../hooks';
import { type WeatherError as WeatherErrorType } from '../../types/weather';
import { CitySearch } from '../search';

import { DailyForecast } from './DailyForecast';
import { HourlyForecast } from './HourlyForecast';
import { WeatherCentered } from './WeatherCentered';
import { WeatherDetails } from './WeatherDetails';
import { WeatherError } from './WeatherError';
import { WeatherWrapper } from './WeatherWrapper';
import { WelcomeMessage } from './WelcomeMessage';

interface WeatherMainProps {
  error: WeatherErrorType | null;
  onRetry: () => void;
  sidebarOpen: boolean;
  isLightTheme: boolean;
}

export const WeatherMain: FC<WeatherMainProps> = memo(
  ({ error, onRetry, sidebarOpen, isLightTheme }) => {
    const { weather } = useWeatherData();
    if (error) return <WeatherError error={error} onRetry={onRetry} />;
    if (!weather) return <WelcomeMessage isLightTheme={isLightTheme} />;

    return (
      <div
        className={`flex-1 overflow-y-auto ${sidebarOpen ? 'md:pl-6' : 'pl-0'} transition-all duration-300 relative`}
      >
        <WeatherWrapper>
          <CitySearch
            isLightTheme={isLightTheme}
            className='absolute top-4 right-4 z-40 w-[240px] sm:w-64 md:w-80'
          />

          <WeatherCentered />

          <div className='px-4 md:px-8 pb-8'>
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6'>
              <div className='lg:col-span-3 space-y-4 md:space-y-6'>
                <HourlyForecast />
                <DailyForecast />
              </div>

              <div className='lg:col-span-2'>
                <WeatherDetails />
              </div>
            </div>
          </div>
        </WeatherWrapper>
      </div>
    );
  }
);
