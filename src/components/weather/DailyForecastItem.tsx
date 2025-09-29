import { type FC, type ReactElement } from 'react';

import { useWeather } from '../../hooks';

interface DailyForecastItemData {
  day: string;
  high: number;
  low: number;
  icon: ReactElement;
  description: string;
}

interface DailyForecastItemProps {
  day: DailyForecastItemData;
  index: number;
  getShortDayName: (dayName: string) => string;
}

export const DailyForecastItem: FC<DailyForecastItemProps> = ({
  day,
  index,
  getShortDayName,
}) => {
  const { weather } = useWeather();

  return (
    <div className='flex items-center justify-between py-2'>
      <div className='flex items-center space-x-2 md:space-x-4 flex-1 min-w-0'>
        <span className='text-white/90 w-12 md:w-20 text-xs md:text-sm flex-shrink-0'>
          {getShortDayName(day.day)}
        </span>
        <div className='flex items-center justify-center w-5 md:w-6 flex-shrink-0'>
          {day.icon}
        </div>
        <span className='text-white/70 text-xs md:text-sm flex-1 truncate min-w-0'>
          {index === 0 ? weather.description : day.description}
        </span>
      </div>
      <div className='flex items-center space-x-2 md:space-x-4 flex-shrink-0 pl-1'>
        <div className='w-12 md:w-24 h-1 bg-white/20 rounded-full overflow-hidden'>
          <div
            className='h-full bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full'
            style={{
              width: `${Math.abs(day.high - day.low) * 3}%`,
              marginLeft: `${Math.max(0, ((day.low + 15) / 40) * 100)}%`,
            }}
          />
        </div>
        <div className='flex space-x-1 md:space-x-2 text-white w-12 md:w-16 justify-end'>
          <span className='text-white/70 text-xs md:text-sm'>{day.low}°</span>
          <span className='text-xs md:text-sm'>{day.high}°</span>
        </div>
      </div>
    </div>
  );
};
