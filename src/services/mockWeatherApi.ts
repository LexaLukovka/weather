import { ERROR_MESSAGES } from '../constants';
import { type WeatherData } from '../types';

import { reverseGeocodeService } from './reverseGeocode';
import { WeatherApiError } from './weatherApi';

export class MockWeatherApiService {
  private readonly delay: number;

  constructor(delay: number = 800) {
    this.delay = delay;
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    if (!city.trim()) {
      throw new WeatherApiError(ERROR_MESSAGES.INVALID_INPUT, 'INVALID_INPUT');
    }

    await this.wait(this.delay);

    const normalizedCity = city.toLowerCase().trim();

    if (normalizedCity === 'invalidcity' || normalizedCity === 'notfound') {
      throw new WeatherApiError(
        ERROR_MESSAGES.CITY_NOT_FOUND,
        'CITY_NOT_FOUND',
        404
      );
    }

    return this.getMockWeatherData(city);
  }

  async getWeatherByCoordinates(
    lat: number,
    lon: number
  ): Promise<WeatherData> {
    await this.wait(this.delay / 2);

    try {
      const location = await reverseGeocodeService.getCityFromCoordinates(
        lat,
        lon
      );

      const mockData = this.getMockWeatherData(location.city);

      return {
        ...mockData,
        city: location.city,
        country: location.countryCode,
        isCurrentLocation: true,
      };
    } catch {
      const fallbackCity = this.getFallbackCityFromCoordinates(lat, lon);
      const mockData = this.getMockWeatherData(fallbackCity);

      return {
        ...mockData,
        isCurrentLocation: true,
      };
    }
  }

  private getFallbackCityFromCoordinates(lat: number, lon: number): string {
    if (lat > 51 && lat < 52 && lon > -1 && lon < 1) {
      return 'London';
    } else if (lat > 48 && lat < 49 && lon > 2 && lon < 3) {
      return 'Paris';
    } else if (lat > 35 && lat < 36 && lon > 139 && lon < 140) {
      return 'Tokyo';
    } else if (lat > 40 && lat < 41 && lon > -74 && lon < -73) {
      return 'New York';
    } else if (lat > 37 && lat < 38 && lon > -123 && lon < -122) {
      return 'San Francisco';
    } else if (lat > 52 && lat < 53 && lon > 13 && lon < 14) {
      return 'Berlin';
    } else if (lat > -34 && lat < -33 && lon > 151 && lon < 152) {
      return 'Sydney';
    } else {
      if (lat > 45) return 'Stockholm';
      if (lat > 30) return 'Madrid';
      if (lat > 0) return 'Dubai';
      if (lat > -30) return 'Cape Town';
      return 'Melbourne';
    }
  }

  private getMockWeatherData(city: string): WeatherData {
    const mockWeatherOptions = [
      {
        description: 'clear sky',
        icon: '01d',
        temp: 22,
        min: 18,
        max: 25,
        wind: 3.2,
      },
      {
        description: 'few clouds',
        icon: '02d',
        temp: 19,
        min: 16,
        max: 22,
        wind: 2.8,
      },
      {
        description: 'scattered clouds',
        icon: '03d',
        temp: 15,
        min: 12,
        max: 18,
        wind: 4.1,
      },
      {
        description: 'broken clouds',
        icon: '04d',
        temp: 17,
        min: 14,
        max: 20,
        wind: 3.7,
      },
      {
        description: 'shower rain',
        icon: '09d',
        temp: 13,
        min: 10,
        max: 16,
        wind: 5.2,
      },
      {
        description: 'rain',
        icon: '10d',
        temp: 11,
        min: 8,
        max: 14,
        wind: 4.8,
      },
      {
        description: 'thunderstorm',
        icon: '11d',
        temp: 16,
        min: 13,
        max: 19,
        wind: 6.1,
      },
      {
        description: 'snow',
        icon: '13d',
        temp: -2,
        min: -5,
        max: 1,
        wind: 2.3,
      },
      { description: 'mist', icon: '50d', temp: 9, min: 6, max: 12, wind: 1.8 },
    ];

    const cityHash = this.hashCode(city.toLowerCase());
    const weatherIndex = Math.abs(cityHash) % mockWeatherOptions.length;
    const weather = mockWeatherOptions[weatherIndex];

    return {
      id: `${city}-mock-${Date.now()}`,
      city: this.capitalizeWords(city),
      country: this.getMockCountry(city),
      temperature: weather.temp,
      description: weather.description,
      minTemperature: weather.min,
      maxTemperature: weather.max,
      windSpeed: weather.wind,
      humidity: 45 + (Math.abs(cityHash) % 40), // 45-85%
      icon: weather.icon,
      timestamp: Date.now(),
    };
  }

  private getMockCountry(city: string): string {
    const cityHash = Math.abs(this.hashCode(city.toLowerCase()));
    const countries = [
      'US',
      'GB',
      'DE',
      'FR',
      'ES',
      'IT',
      'CA',
      'AU',
      'JP',
      'BR',
    ];
    return countries[cityHash % countries.length];
  }

  private capitalizeWords(str: string): string {
    return str.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
