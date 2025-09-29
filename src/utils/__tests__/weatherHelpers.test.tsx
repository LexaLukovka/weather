import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import {
  getWeatherIcon,
  getUVDescription,
  getHumidityDescription,
  getVisibilityDescription,
} from '../weatherHelpers';

describe('weatherHelpers', () => {
  describe('getWeatherIcon', () => {
    it('returns RainIcon for rain conditions', () => {
      const { container: container1 } = render(
        getWeatherIcon('day/116.png', 'Light rain', 32)
      );
      const svg = container1.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');

      const { container: container2 } = render(
        getWeatherIcon('day/116.png', 'Heavy shower')
      );
      expect(container2.querySelector('svg')).toBeInTheDocument();

      const { container: container3 } = render(
        getWeatherIcon('day/116.png', 'Drizzle')
      );
      expect(container3.querySelector('svg')).toBeInTheDocument();
    });

    it('returns SnowIcon for snow conditions', () => {
      const { container: container1 } = render(
        getWeatherIcon('day/116.png', 'Light snow')
      );
      expect(container1.querySelector('svg')).toBeInTheDocument();

      const { container: container2 } = render(
        getWeatherIcon('day/116.png', 'Blizzard')
      );
      expect(container2.querySelector('svg')).toBeInTheDocument();
    });

    it('returns ThunderIcon for thunder conditions', () => {
      const { container: container1 } = render(
        getWeatherIcon('day/116.png', 'Thunderstorm')
      );
      expect(container1.querySelector('svg')).toBeInTheDocument();

      const { container: container2 } = render(
        getWeatherIcon('day/116.png', 'Storm')
      );
      expect(container2.querySelector('svg')).toBeInTheDocument();
    });

    it('returns FogIcon for fog conditions', () => {
      const { container: container1 } = render(
        getWeatherIcon('day/116.png', 'Fog')
      );
      expect(container1.querySelector('svg')).toBeInTheDocument();

      const { container: container2 } = render(
        getWeatherIcon('day/116.png', 'Mist')
      );
      expect(container2.querySelector('svg')).toBeInTheDocument();
    });

    it('returns CloudIcon for cloudy conditions', () => {
      const { container: container1 } = render(
        getWeatherIcon('day/116.png', 'Cloudy')
      );
      expect(container1.querySelector('svg')).toBeInTheDocument();

      const { container: container2 } = render(
        getWeatherIcon('day/116.png', 'Overcast')
      );
      expect(container2.querySelector('svg')).toBeInTheDocument();
    });

    it('returns SunIcon for clear day conditions', () => {
      const { container } = render(getWeatherIcon('day/116.png', 'Clear'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('returns MoonIcon for clear night conditions', () => {
      const { container } = render(getWeatherIcon('night/116.png', 'Clear'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('returns SunIcon for sunny conditions', () => {
      const { container } = render(getWeatherIcon('day/116.png', 'Sunny'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('returns PartlyCloudyIcon as default for day', () => {
      const { container } = render(getWeatherIcon('day/116.png', 'Unknown'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('returns MoonIcon as default for night', () => {
      const { container } = render(getWeatherIcon('night/116.png', 'Unknown'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('uses custom size when provided', () => {
      const { container } = render(getWeatherIcon('day/116.png', 'Clear', 48));
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('width', '48');
      expect(icon).toHaveAttribute('height', '48');
    });

    it('uses default size when not provided', () => {
      const { container } = render(getWeatherIcon('day/116.png', 'Clear'));
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    });
  });

  describe('getUVDescription', () => {
    it('returns Low for UV index 0-2', () => {
      expect(getUVDescription(0)).toBe('Low');
      expect(getUVDescription(1)).toBe('Low');
      expect(getUVDescription(2)).toBe('Low');
    });

    it('returns Moderate for UV index 3-5', () => {
      expect(getUVDescription(3)).toBe('Moderate');
      expect(getUVDescription(4)).toBe('Moderate');
      expect(getUVDescription(5)).toBe('Moderate');
    });

    it('returns High for UV index 6-7', () => {
      expect(getUVDescription(6)).toBe('High');
      expect(getUVDescription(7)).toBe('High');
    });

    it('returns Very High for UV index 8-10', () => {
      expect(getUVDescription(8)).toBe('Very High');
      expect(getUVDescription(9)).toBe('Very High');
      expect(getUVDescription(10)).toBe('Very High');
    });

    it('returns Extreme for UV index > 10', () => {
      expect(getUVDescription(11)).toBe('Extreme');
      expect(getUVDescription(15)).toBe('Extreme');
    });
  });

  describe('getHumidityDescription', () => {
    it('returns Dry for humidity 0-30%', () => {
      expect(getHumidityDescription(0)).toBe('Dry');
      expect(getHumidityDescription(15)).toBe('Dry');
      expect(getHumidityDescription(30)).toBe('Dry');
    });

    it('returns Normal for humidity 31-60%', () => {
      expect(getHumidityDescription(31)).toBe('Normal');
      expect(getHumidityDescription(45)).toBe('Normal');
      expect(getHumidityDescription(60)).toBe('Normal');
    });

    it('returns Humid for humidity 61-80%', () => {
      expect(getHumidityDescription(61)).toBe('Humid');
      expect(getHumidityDescription(70)).toBe('Humid');
      expect(getHumidityDescription(80)).toBe('Humid');
    });

    it('returns Very Humid for humidity > 80%', () => {
      expect(getHumidityDescription(81)).toBe('Very Humid');
      expect(getHumidityDescription(90)).toBe('Very Humid');
      expect(getHumidityDescription(100)).toBe('Very Humid');
    });
  });

  describe('getVisibilityDescription', () => {
    it('returns Excellent for visibility >= 10km', () => {
      expect(getVisibilityDescription(10)).toBe('Excellent');
      expect(getVisibilityDescription(15)).toBe('Excellent');
      expect(getVisibilityDescription(20)).toBe('Excellent');
    });

    it('returns Good for visibility 5-9km', () => {
      expect(getVisibilityDescription(5)).toBe('Good');
      expect(getVisibilityDescription(7)).toBe('Good');
      expect(getVisibilityDescription(9)).toBe('Good');
    });

    it('returns Moderate for visibility 2-4km', () => {
      expect(getVisibilityDescription(2)).toBe('Moderate');
      expect(getVisibilityDescription(3)).toBe('Moderate');
      expect(getVisibilityDescription(4)).toBe('Moderate');
    });

    it('returns Poor for visibility < 2km', () => {
      expect(getVisibilityDescription(0)).toBe('Poor');
      expect(getVisibilityDescription(1)).toBe('Poor');
      expect(getVisibilityDescription(1.5)).toBe('Poor');
    });
  });
});
