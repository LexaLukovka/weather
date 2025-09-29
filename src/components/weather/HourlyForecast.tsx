import { type FC } from 'react';

import {
  useScrollIndicators,
  useHourlyForecast,
  useWeather,
} from '../../hooks';
import { Card } from '../layout';

import { HourlyForecastList } from './HourlyForecastList';

export const HourlyForecast: FC = () => {
  const { weather } = useWeather();
  const { weatherSummary, hourlyData } = useHourlyForecast(weather);
  const { scrollRef, showLeftIndicator, showRightIndicator, handleScroll } =
    useScrollIndicators([hourlyData]);

  const getScrollIndicatorClass =
    !showLeftIndicator && !showRightIndicator
      ? 'w-8 bg-white/60'
      : !showLeftIndicator
        ? 'w-8 bg-white/60'
        : !showRightIndicator
          ? 'w-1 bg-white/20'
          : 'w-4 bg-white/40';

  return (
    <Card animate>
      <div className='mb-4'>
        <p className='text-white/60 text-xs md:text-sm font-light'>
          {weatherSummary}
        </p>
      </div>
      <div className='border-t border-white/10 pt-4'>
        <div
          ref={scrollRef}
          className='overflow-x-auto scrollbar-hide'
          onScroll={handleScroll}
        >
          <div className='flex space-x-4 md:space-x-8'>
            <HourlyForecastList hourlyData={hourlyData} />
          </div>
        </div>

        {hourlyData.length > 0 && (
          <div className='flex items-center justify-center gap-1 mt-3'>
            <div
              className={`h-1 transition-all duration-300 rounded-full ${getScrollIndicatorClass}`}
            />
            {showRightIndicator && (
              <>
                <div className='h-1 w-1 bg-white/20 rounded-full' />
                <div className='h-1 w-1 bg-white/20 rounded-full' />
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
