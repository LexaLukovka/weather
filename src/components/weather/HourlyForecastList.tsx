import { memo, type FC, type ReactElement } from 'react';

interface HourlyDataItem {
  time: number;
  temp: number;
  icon: ReactElement;
  isNow: boolean;
  id?: string;
}

interface HourlyForecastListProps {
  hourlyData: HourlyDataItem[];
}

export const HourlyForecastList: FC<HourlyForecastListProps> = memo(
  ({ hourlyData }) => {
    const getTimeDisplay = (index: number, time: number) =>
      index === 0 ? 'Now' : `${String(time).padStart(2, '0')}:00`;

    if (hourlyData.length === 0) {
      return (
        <div className='text-white/60 text-sm text-center w-full py-4'>
          Loading hourly forecast...
        </div>
      );
    }

    return (
      <>
        {hourlyData.map((hour, index) => {
          // Create a stable key using time and temperature
          // This is better than using index which can cause issues with animations
          const uniqueKey =
            hour.id || `${hour.time}-${hour.temp}-${hour.isNow}`;

          return (
            <div
              key={uniqueKey}
              className='flex flex-col items-center space-y-2 min-w-[50px] md:min-w-[60px]'
            >
              <span className='text-white/70 text-xs md:text-sm'>
                {getTimeDisplay(index, hour.time)}
              </span>
              <div className='flex items-center justify-center'>
                {hour.icon}
              </div>
              <span className='text-white text-xs md:text-sm'>
                {hour.temp}°
              </span>
            </div>
          );
        })}
      </>
    );
  }
);

HourlyForecastList.displayName = 'HourlyForecastList';
