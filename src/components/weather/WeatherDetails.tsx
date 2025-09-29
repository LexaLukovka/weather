import { type FC } from 'react';

import { Wind, Gauge } from 'lucide-react';

import { useWeather } from '../../hooks';
import {
  getUVDescription,
  getHumidityDescription,
  getVisibilityDescription,
} from '../../utils';

import { WeatherDetailCard } from './WeatherDetailCard';

export const WeatherDetails: FC = () => {
  const { weather } = useWeather();
  return (
    <div className='space-y-4 md:space-y-6'>
      <div className='grid grid-cols-2 gap-3 md:gap-4'>
        <WeatherDetailCard title='UV Index'>
          <p className='text-white text-xl md:text-2xl font-light mb-1'>
            {weather.uv?.toFixed(1) || '0'}
          </p>
          <p className='text-white/70 text-xs'>
            {getUVDescription(weather.uv || 0)}
          </p>
        </WeatherDetailCard>

        <WeatherDetailCard title='Sunrise'>
          <p className='text-white text-base md:text-lg font-light mb-1'>
            {weather.sunrise || '06:41'}
          </p>
          <p className='text-white/70 text-xs'>
            Sunset: {weather.sunset || '19:00'}
          </p>
        </WeatherDetailCard>

        <WeatherDetailCard title='Wind'>
          <div className='flex items-center justify-center mb-1'>
            <Wind className='w-4 h-4 text-white/60 mr-1' />
            <p className='text-white text-lg font-light'>
              {weather.windSpeed.toFixed(2)}
            </p>
          </div>
          <p className='text-white/70 text-xs'>m/s</p>
        </WeatherDetailCard>

        <WeatherDetailCard title='Precipitation'>
          <p className='text-white text-base md:text-lg font-light mb-1'>
            {weather.precipitation?.toFixed(1) || '0'} mm
          </p>
          <p className='text-white/70 text-xs'>
            {(weather.precipitation || 0) === 0
              ? 'No rain today'
              : (weather.precipitation || 0) < 2.5
                ? 'Light rain'
                : (weather.precipitation || 0) < 10
                  ? 'Moderate rain'
                  : (weather.precipitation || 0) < 50
                    ? 'Heavy rain'
                    : 'Very heavy rain'}
          </p>
        </WeatherDetailCard>

        <WeatherDetailCard title='Feels Like'>
          <p className='text-white text-base md:text-lg font-light mb-1'>
            {weather.feelsLike || Math.round(weather.temperature - 2)}°
          </p>
          <p className='text-white/70 text-xs'>
            {(weather.feelsLike || weather.temperature) < weather.temperature
              ? 'Wind is making it feel cooler'
              : 'Humidity makes it feel warmer'}
          </p>
        </WeatherDetailCard>

        <WeatherDetailCard title='Humidity'>
          <p className='text-white text-base md:text-lg font-light mb-1'>
            {weather.humidity}%
          </p>
          <p className='text-white/70 text-xs'>
            {getHumidityDescription(weather.humidity)}
          </p>
        </WeatherDetailCard>

        <WeatherDetailCard title='Visibility'>
          <p className='text-white text-base md:text-lg font-light mb-1'>
            {weather.visibility?.toFixed(0) || '33'} km
          </p>
          <p className='text-white/70 text-xs'>
            {getVisibilityDescription(weather.visibility || 10)}
          </p>
        </WeatherDetailCard>

        <WeatherDetailCard title='Pressure'>
          <div className='flex items-center justify-center mb-1'>
            <Gauge className='w-4 h-4 text-white/60 mr-1' />
            <p className='text-white text-lg font-light'>
              {weather.pressure?.toFixed(0) || '1021'}
            </p>
          </div>
          <p className='text-white/70 text-xs'>hPa</p>
        </WeatherDetailCard>
      </div>
    </div>
  );
};
