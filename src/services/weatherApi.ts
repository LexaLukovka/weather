import axios, { type AxiosResponse } from 'axios';

import { API_CONFIG, ERROR_MESSAGES } from '../constants/api';
import { type ForecastApiResponse, type WeatherData } from '../types';

export class WeatherApiError extends Error {
  public code?: string;
  public statusCode?: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class WeatherApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    baseUrl: string = API_CONFIG.BASE_URL,
    apiKey: string = API_CONFIG.API_KEY
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Fetches current weather data by coordinates
   * @param lat - Latitude
   * @param lon - Longitude
   * @returns Promise<WeatherData> - Transformed weather data
   * @throws {WeatherApiError} - When API call fails
   */
  async getWeatherByCoordinates(
    lat: number,
    lon: number
  ): Promise<WeatherData> {
    const url = this.buildUrl(API_CONFIG.ENDPOINTS.FORECAST, {
      key: this.apiKey,
      q: `${lat},${lon}`,
      days: '7',
      aqi: 'no',
      alerts: 'no',
    });

    try {
      const response: AxiosResponse<ForecastApiResponse> = await axios.get(url);

      const data = response.data;
      const weatherData = this.transformForecastData(data);

      return {
        ...weatherData,
        isCurrentLocation: true,
      };
    } catch (error) {
      if (error instanceof WeatherApiError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        if (error.response) {
          await this.handleAxiosError(error.response.status);
        } else if (error.request) {
          throw new WeatherApiError(
            ERROR_MESSAGES.NETWORK_ERROR,
            'NETWORK_ERROR'
          );
        }
      }

      throw new WeatherApiError(ERROR_MESSAGES.NETWORK_ERROR, 'NETWORK_ERROR');
    }
  }

  /**
   * Fetches current weather data for a given city
   * @param city - The city name to search for
   * @returns Promise<WeatherData> - Transformed weather data
   * @throws {WeatherApiError} - When API call fails or city is not found
   */
  async getCurrentWeather(city: string): Promise<WeatherData> {
    if (!city.trim()) {
      throw new WeatherApiError(ERROR_MESSAGES.INVALID_INPUT, 'INVALID_INPUT');
    }

    const url = this.buildUrl(API_CONFIG.ENDPOINTS.FORECAST, {
      key: this.apiKey,
      q: city.trim(),
      days: '7',
      aqi: 'no',
      alerts: 'no',
    });

    try {
      const response: AxiosResponse<ForecastApiResponse> = await axios.get(url);

      const data = response.data;
      return this.transformForecastData(data);
    } catch (error) {
      if (error instanceof WeatherApiError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        if (error.response) {
          await this.handleAxiosError(error.response.status);
        } else if (error.request) {
          throw new WeatherApiError(
            ERROR_MESSAGES.NETWORK_ERROR,
            'NETWORK_ERROR'
          );
        } else {
          throw new WeatherApiError(error.message, 'REQUEST_ERROR');
        }
      }

      throw new WeatherApiError(ERROR_MESSAGES.NETWORK_ERROR, 'NETWORK_ERROR');
    }
  }

  private buildUrl(endpoint: string, params: Record<string, string>): string {
    const baseUrl = this.baseUrl.startsWith('http')
      ? this.baseUrl
      : window.location.origin + this.baseUrl;

    const fullUrl = baseUrl.endsWith('/')
      ? baseUrl + endpoint.replace(/^\//, '')
      : baseUrl + endpoint;

    const url = new URL(fullUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  }

  private async handleAxiosError(statusCode: number): Promise<never> {
    switch (statusCode) {
      case 400:
        throw new WeatherApiError(
          ERROR_MESSAGES.CITY_NOT_FOUND,
          'CITY_NOT_FOUND',
          statusCode
        );
      case 401:
        throw new WeatherApiError(
          'Invalid API key. Please check your WeatherAPI key.',
          'INVALID_API_KEY',
          statusCode
        );
      case 403:
        throw new WeatherApiError(
          'API key has exceeded calls per month quota.',
          'QUOTA_EXCEEDED',
          statusCode
        );
      case 404:
        throw new WeatherApiError(
          ERROR_MESSAGES.CITY_NOT_FOUND,
          'CITY_NOT_FOUND',
          statusCode
        );
      case 429:
        throw new WeatherApiError(
          ERROR_MESSAGES.RATE_LIMIT,
          'RATE_LIMIT',
          statusCode
        );
      default:
        throw new WeatherApiError(
          ERROR_MESSAGES.API_ERROR,
          'API_ERROR',
          statusCode
        );
    }
  }

  private transformForecastData(data: ForecastApiResponse): WeatherData {
    const today = data.forecast.forecastday[0];
    const current = data.current;
    const astro = today.astro;

    const currentHour =
      today.hour.find(hour => hour.time_epoch <= current.last_updated_epoch) ||
      today.hour[0];

    return {
      id: `${data.location.name}-${data.location.country}-${Date.now()}`,
      city: data.location.name,
      country: data.location.country,
      temperature: Math.round(current.temp_c),
      description: current.condition.text,
      minTemperature: Math.round(today.day.mintemp_c),
      maxTemperature: Math.round(today.day.maxtemp_c),
      windSpeed: current.wind_kph / 3.6,
      humidity: current.humidity,
      icon: current.condition.icon.replace('//', 'https://'),
      timestamp: current.last_updated_epoch * 1000,
      localtime: data.location.localtime,
      sunrise: astro.sunrise,
      sunset: astro.sunset,
      uv: today.day.uv,
      visibility: today.day.avgvis_km,
      pressure: currentHour.pressure_mb,
      feelsLike: Math.round(current.feelslike_c),
      moonPhase: astro.moon_phase,
      moonIllumination: astro.moon_illumination,
      precipitation: today.day.totalprecip_mm,
      windGust: currentHour.gust_kph / 3.6,
      hourlyForecast: (() => {
        const allHours: Array<{
          time: string;
          temp_c: number;
          condition: { text: string; icon: string };
        }> = [];
        data.forecast.forecastday.forEach(day => {
          allHours.push(...day.hour);
        });

        return allHours.map(hour => ({
          time: hour.time,
          temp_c: hour.temp_c,
          condition: {
            text: hour.condition.text,
            icon: hour.condition.icon,
          },
        }));
      })(),
      dailyForecast: data.forecast.forecastday.map((day, index) => {
        const dayNames = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const date = new Date(day.date);
        const dayName = index === 0 ? 'Today' : dayNames[date.getDay()];

        return {
          date: day.date,
          day: dayName,
          maxTemp: Math.round(day.day.maxtemp_c),
          minTemp: Math.round(day.day.mintemp_c),
          condition: {
            text: day.day.condition.text,
            icon: day.day.condition.icon,
          },
        };
      }),
    };
  }
}

export const weatherApiService = new WeatherApiService();
