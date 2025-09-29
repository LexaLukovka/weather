import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GeolocationService } from '../geolocation';

describe('GeolocationService', () => {
  let mockGeolocation: {
    getCurrentPosition: ReturnType<typeof vi.fn>;
  };
  let geolocationService: GeolocationService;

  beforeEach(() => {
    geolocationService = new GeolocationService();
    vi.clearAllMocks();

    // Setup mock geolocation
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };

    // Reset navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });
  });

  it('returns coordinates when geolocation succeeds', async () => {
    const mockPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 100,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    mockGeolocation.getCurrentPosition.mockImplementation(
      (success: (position: GeolocationPosition) => void) => {
        success(mockPosition);
      }
    );

    const result = await geolocationService.getCurrentPosition();

    expect(result).toEqual({
      latitude: 51.5074,
      longitude: -0.1278,
    });
  });

  it('throws error when geolocation is not supported', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    await expect(geolocationService.getCurrentPosition()).rejects.toEqual({
      code: 'POSITION_UNAVAILABLE',
      message: 'Geolocation is not supported by your browser',
    });
  });

  it('throws error when user denies permission', async () => {
    const mockError = {
      code: 1, // PERMISSION_DENIED
      message: 'User denied permission',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: unknown, error: (error: GeolocationPositionError) => void) => {
        error(mockError);
      }
    );

    await expect(geolocationService.getCurrentPosition()).rejects.toEqual({
      code: 'PERMISSION_DENIED',
      message:
        'Location permission denied. Please enable location access to see local weather.',
    });
  });

  it('throws error when position is unavailable', async () => {
    const mockError = {
      code: 2, // POSITION_UNAVAILABLE
      message: 'Position unavailable',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: unknown, error: (error: GeolocationPositionError) => void) => {
        error(mockError);
      }
    );

    await expect(geolocationService.getCurrentPosition()).rejects.toEqual({
      code: 'POSITION_UNAVAILABLE',
      message: 'Location information is unavailable.',
    });
  });

  it('throws error on timeout', async () => {
    const mockError = {
      code: 3, // TIMEOUT
      message: 'Timeout',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: unknown, error: (error: GeolocationPositionError) => void) => {
        error(mockError);
      }
    );

    await expect(geolocationService.getCurrentPosition()).rejects.toEqual({
      code: 'TIMEOUT',
      message: 'Location request timed out.',
    });
  });

  it('throws generic error for unknown error codes', async () => {
    const mockError = {
      code: 999,
      message: 'Unknown error',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: unknown, error: (error: GeolocationPositionError) => void) => {
        error(mockError);
      }
    );

    await expect(geolocationService.getCurrentPosition()).rejects.toEqual({
      code: 'UNKNOWN',
      message: 'An unknown error occurred while getting your location.',
    });
  });

  it('uses correct options for getCurrentPosition', async () => {
    const mockPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 100,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    mockGeolocation.getCurrentPosition.mockImplementation(
      (success: (position: GeolocationPosition) => void) => {
        success(mockPosition);
      }
    );

    await geolocationService.getCurrentPosition();

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
});
