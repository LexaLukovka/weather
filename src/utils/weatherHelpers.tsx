import { type ReactElement } from 'react';

import {
  SunIcon,
  MoonIcon,
  CloudIcon,
  PartlyCloudyIcon,
  RainIcon,
  SnowIcon,
  ThunderIcon,
  FogIcon,
} from '../components';

export const getWeatherIcon = (
  iconUrl: string,
  conditionText: string,
  size?: number
): ReactElement => {
  const text = conditionText.toLowerCase();
  const icon = iconUrl.toLowerCase();
  const iconSize = size || 24;

  if (
    text.includes('rain') ||
    text.includes('shower') ||
    text.includes('drizzle')
  ) {
    return <RainIcon size={iconSize} />;
  }
  if (text.includes('snow') || text.includes('blizzard')) {
    return <SnowIcon size={iconSize} />;
  }
  if (text.includes('thunder') || text.includes('storm')) {
    return <ThunderIcon size={iconSize} />;
  }
  if (text.includes('fog') || text.includes('mist')) {
    return <FogIcon size={iconSize} />;
  }
  if (text.includes('cloud') || text.includes('overcast')) {
    return <CloudIcon size={iconSize} />;
  }
  if (text.includes('clear') || text.includes('sunny')) {
    return icon.includes('night') ? (
      <MoonIcon size={iconSize} />
    ) : (
      <SunIcon size={iconSize} />
    );
  }

  return icon.includes('night') ? (
    <MoonIcon size={iconSize} />
  ) : (
    <PartlyCloudyIcon size={iconSize} />
  );
};

export const getUVDescription = (uv: number): string => {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
};

export const getHumidityDescription = (humidity: number): string => {
  if (humidity <= 30) return 'Dry';
  if (humidity <= 60) return 'Normal';
  if (humidity <= 80) return 'Humid';
  return 'Very Humid';
};

export const getVisibilityDescription = (visibility: number): string => {
  if (visibility >= 10) return 'Excellent';
  if (visibility >= 5) return 'Good';
  if (visibility >= 2) return 'Moderate';
  return 'Poor';
};
