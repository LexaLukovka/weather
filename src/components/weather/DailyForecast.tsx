import { memo, type FC } from 'react';

import { useWindowSize, useDailyForecast, useWeather } from '../../hooks';
import { Card } from '../layout';

import { DailyForecastItem } from './DailyForecastItem';

export const DailyForecast: FC = memo(() => {
  const { weather } = useWeather();
  const { isMobile } = useWindowSize();
  const { dailyData } = useDailyForecast(weather);

  const getShortDayName = (dayName: string) => {
    if (!isMobile || dayName === 'Today') return dayName;

    const shortNames: Record<string, string> = {
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat',
      Sunday: 'Sun',
    };

    return shortNames[dayName] || dayName;
  };

  return (
    <Card animate>
      <div className='mb-4'>
        <p className='text-white/60 text-xs md:text-sm uppercase tracking-wider text-center md:text-left'>
          10-Day Forecast
        </p>
      </div>
      <div className='space-y-3'>
        {dailyData.map((day, index) => (
          <DailyForecastItem
            key={day.date}
            day={day}
            index={index}
            getShortDayName={getShortDayName}
          />
        ))}
      </div>
    </Card>
  );
});

DailyForecast.displayName = 'DailyForecast';
