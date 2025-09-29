import axios, { type AxiosError, AxiosHeaders } from 'axios';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockedFunction,
} from 'vitest';

import { ERROR_MESSAGES } from '../../constants';
import { WeatherApiService, WeatherApiError } from '../weatherApi';
import { type ForecastApiResponse } from '../../types';

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof axios>();
  return {
    ...actual,
    default: {
      get: vi.fn(),
      isAxiosError: vi.fn(),
    },
  };
});

vi.mock('../../utils/retry', () => ({
  CircuitBreaker: class MockCircuitBreaker {
    async call<T>(fn: () => Promise<T>): Promise<T> {
      return fn();
    }
  },
  withRetry: <T extends (...args: unknown[]) => Promise<unknown>>(fn: T): T =>
    fn,
}));

vi.mock('../../utils/validation', () => ({
  validateApiResponse: vi.fn().mockImplementation((data) => data),
}));

const MOCK_API_RESPONSE: ForecastApiResponse = {
  location: {
    name: 'London',
    country: 'GB',
    localtime: '2024-01-15 12:00',
  },
  current: {
    temp_c: 20.5,
    condition: {
      text: 'clear sky',
      icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      code: 1000,
    },
    wind_kph: 12.6,
    humidity: 65,
    last_updated_epoch: 1705320000,
    feelslike_c: 22.0,
  },
  forecast: {
    forecastday: [
      {
        date: '2024-01-15',
        day: {
          mintemp_c: 18.2,
          maxtemp_c: 22.8,
          condition: {
            text: 'clear sky',
            icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
            code: 1000,
          },
          uv: 5,
          avgvis_km: 10,
          totalprecip_mm: 0,
        },
        astro: {
          sunrise: '07:48 AM',
          sunset: '04:38 PM',
          moon_phase: 'Waxing Crescent',
          moon_illumination: 25,
        },
        hour: [
          {
            time: '2024-01-15 12:00',
            temp_c: 20.5,
            condition: {
              text: 'clear sky',
              icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
              code: 1000,
            },
            time_epoch: 1705320000,
            pressure_mb: 1013,
            gust_kph: 15.0,
          },
        ],
      },
    ],
  },
};

const EXPECTED_WEATHER_DATA = {
  id: expect.stringContaining('London-GB'),
  city: 'London',
  country: 'GB',
  temperature: 21,
  minTemperature: 18,
  maxTemperature: 23,
  description: 'clear sky',
  icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png',
  windSpeed: 3.5,
  humidity: 65,
  timestamp: 1705320000000,
  localtime: '2024-01-15 12:00',
  sunrise: '07:48 AM',
  sunset: '04:38 PM',
  uv: 5,
  visibility: 10,
  pressure: 1013,
  feelsLike: 22,
  moonPhase: 'Waxing Crescent',
  moonIllumination: 25,
  precipitation: 0,
  windGust: expect.any(Number),
  hourlyForecast: expect.any(Array),
  dailyForecast: expect.any(Array),
};

// Helper functions
const createAxiosError = (status: number): Partial<AxiosError> => ({
  response: {
    status,
    statusText: 'Error',
    headers: new AxiosHeaders(),
    config: {
      url: 'https://test-api.com',
      method: 'get',
      headers: new AxiosHeaders(),
    },
    data: null,
  },
  request: {},
  config: {
    url: 'https://test-api.com',
    method: 'get',
    headers: new AxiosHeaders(),
  },
  code: 'ERR_REQUEST',
  name: 'AxiosError',
  message: `Request failed with status code ${status}`,
  isAxiosError: true,
  toJSON: () => ({}),
});

const createNetworkError = (): Partial<AxiosError> => ({
  request: {},
  config: {
    url: 'https://test-api.com',
    method: 'get',
    headers: new AxiosHeaders(),
  },
  code: 'ENOTFOUND',
  name: 'AxiosError',
  message: 'Network Error',
  isAxiosError: true,
  toJSON: () => ({}),
});

interface MockedAxios {
  get: MockedFunction<typeof axios.get>;
  isAxiosError: MockedFunction<typeof axios.isAxiosError>;
}

const mockSuccessfulApiCall = (
  mockedAxios: MockedAxios,
  responseData: ForecastApiResponse = MOCK_API_RESPONSE
): void => {
  mockedAxios.get.mockResolvedValueOnce({ data: responseData });
};

const mockFailedApiCall = (
  mockedAxios: MockedAxios,
  error: Partial<AxiosError>
): void => {
  mockedAxios.isAxiosError.mockReturnValue(true);
  mockedAxios.get.mockRejectedValueOnce(error);
};

describe('WeatherApiService', () => {
  let weatherApi: WeatherApiService;
  const mockedAxios = vi.mocked(axios, true) as MockedAxios;

  beforeEach(() => {
    weatherApi = new WeatherApiService('https://test-api.com', 'test-key');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should return transformed weather data for valid city', async () => {
      mockSuccessfulApiCall(mockedAxios);

      const result = await weatherApi.getCurrentWeather('London');

      expect(result).toEqual(EXPECTED_WEATHER_DATA);
    });

    it('should throw WeatherApiError for empty city input', async () => {
      await expect(weatherApi.getCurrentWeather('')).rejects.toThrow(
        new WeatherApiError(ERROR_MESSAGES.INVALID_INPUT, 'INVALID_INPUT')
      );

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should throw WeatherApiError for city not found (404)', async () => {
      mockFailedApiCall(mockedAxios, createAxiosError(404));

      await expect(weatherApi.getCurrentWeather('InvalidCity')).rejects.toThrow(
        new WeatherApiError(
          ERROR_MESSAGES.CITY_NOT_FOUND,
          'CITY_NOT_FOUND',
          404
        )
      );
    });

    it('should throw WeatherApiError for rate limit (429)', async () => {
      mockFailedApiCall(mockedAxios, createAxiosError(429));

      await expect(weatherApi.getCurrentWeather('London')).rejects.toThrow(
        new WeatherApiError(ERROR_MESSAGES.RATE_LIMIT, 'RATE_LIMIT', 429)
      );
    });

    it('should throw WeatherApiError for other API errors', async () => {
      mockFailedApiCall(mockedAxios, createAxiosError(500));

      await expect(weatherApi.getCurrentWeather('London')).rejects.toThrow(
        new WeatherApiError(ERROR_MESSAGES.API_ERROR, 'API_ERROR', 500)
      );
    });

    it('should throw WeatherApiError for network errors', async () => {
      mockFailedApiCall(mockedAxios, createNetworkError());

      await expect(weatherApi.getCurrentWeather('London')).rejects.toThrow(
        new WeatherApiError(ERROR_MESSAGES.NETWORK_ERROR, 'NETWORK_ERROR')
      );
    });

    it('should trim whitespace from city input', async () => {
      mockSuccessfulApiCall(mockedAxios);

      await weatherApi.getCurrentWeather('  London  ');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('q=London&')
      );
    });
  });

  describe('getWeatherByCoordinates', () => {
    it('should return weather data with isCurrentLocation flag', async () => {
      mockSuccessfulApiCall(mockedAxios);

      const result = await weatherApi.getWeatherByCoordinates(51.5074, -0.1278);

      expect(result.isCurrentLocation).toBe(true);
      expect(result.city).toBe('London');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('q=51.5074%2C-0.1278')
      );
    });
  });
});
