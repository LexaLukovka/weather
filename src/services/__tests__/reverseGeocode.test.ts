import axios from 'axios';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ReverseGeocodeService } from '../reverseGeocode';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('ReverseGeocodeService', () => {
  let service: ReverseGeocodeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ReverseGeocodeService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns location data on successful response', async () => {
    const mockResponse = {
      data: {
        address: {
          city: 'London',
          country: 'United Kingdom',
          country_code: 'gb',
          state: 'England',
        },
        lat: 51.5074,
        lon: -0.1278,
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await service.getCityFromCoordinates(51.5074, -0.1278);

    expect(result).toEqual({
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      state: 'England',
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://nominatim.openstreetmap.org/reverse',
      expect.objectContaining({
        params: expect.objectContaining({
          lat: 51.5074,
          lon: -0.1278,
          format: 'json',
          zoom: 10,
          addressdetails: 1,
        }),
        headers: {
          'User-Agent': 'WeatherApp/1.0',
        },
      })
    );
  });

  it('handles town when city is not available', async () => {
    const mockResponse = {
      data: {
        address: {
          town: 'Cambridge',
          country: 'United Kingdom',
          country_code: 'gb',
        },
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await service.getCityFromCoordinates(52.2053, 0.1218);

    expect(result).toEqual({
      city: 'Cambridge',
      country: 'United Kingdom',
      countryCode: 'GB',
      state: undefined,
    });
  });

  it('handles village when city and town are not available', async () => {
    const mockResponse = {
      data: {
        address: {
          village: 'Grantchester',
          country: 'United Kingdom',
          country_code: 'gb',
        },
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await service.getCityFromCoordinates(52.1753, 0.0953);

    expect(result).toEqual({
      city: 'Grantchester',
      country: 'United Kingdom',
      countryCode: 'GB',
      state: undefined,
    });
  });

  it('returns fallback location when API request fails', async () => {
    // Mock console.error to suppress expected error output during test
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {
        /* empty */
      });

    const mockError = new Error('Network error');
    mockedAxios.get.mockRejectedValueOnce(mockError);

    const result = await service.getCityFromCoordinates(51.5074, -0.1278);

    // Should return London as fallback (closest to the provided coordinates)
    expect(result).toEqual({
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      state: undefined,
    });

    // Verify console.error was called with the error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Reverse geocoding error:',
      mockError
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('handles missing address data gracefully', async () => {
    const mockResponse = {
      data: {
        // Missing address field
        lat: 51.5074,
        lon: -0.1278,
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await service.getCityFromCoordinates(51.5074, -0.1278);

    expect(result).toEqual({
      city: 'Unknown Location',
      country: 'Unknown Country',
      countryCode: 'XX',
      state: undefined,
    });
  });

  it('calls axios with correct parameters', async () => {
    const mockResponse = {
      data: {
        address: {
          city: 'Test City',
          country: 'Test Country',
          country_code: 'tc',
        },
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    await service.getCityFromCoordinates(40.7128, -74.006);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          lat: 40.7128,
          lon: -74.006,
          format: 'json',
          zoom: 10,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'WeatherApp/1.0',
        },
      }
    );
  });
});
