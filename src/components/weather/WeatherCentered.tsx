import { type FC } from 'react';

import { useWeather, useHourlyForecast } from '../../hooks';

export const WeatherCentered: FC = () => {
  const { weather } = useWeather();
  const { hourlyData } = useHourlyForecast(weather);

  const currentTemperature =
    hourlyData.length > 0 ? hourlyData[0].temp : weather.temperature;

  return (
    <div className='flex-1 flex items-center justify-center'>
      <div className='text-center py-8 md:py-16 max-w-md w-full px-4 mt-16 md:mt-0'>
        <h1 className='text-3xl md:text-5xl font-light text-white mb-4 md:mb-6'>
          {weather.city}
        </h1>
        <div>
          <p className='text-6xl md:text-8xl font-ultralight text-white leading-none mb-2'>
            {currentTemperature}°
          </p>
          <p className='text-white/70 text-lg md:text-xl capitalize mb-1'>
            {weather.description}
          </p>
          <p className='text-white/60 text-base md:text-lg'>
            H:{Math.round(weather.maxTemperature)}° L:
            {Math.round(weather.minTemperature)}°
          </p>
        </div>
      </div>
    </div>
  );
};
