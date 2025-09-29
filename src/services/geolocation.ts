export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}

export class GeolocationService {
  async getCurrentPosition(): Promise<Coordinates> {
    if (!navigator.geolocation) {
      throw {
        code: 'POSITION_UNAVAILABLE',
        message: 'Geolocation is not supported by your browser',
      } as GeolocationError;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          reject(this.handleGeolocationError(error));
        },
        {
          enableHighAccuracy: false,
          maximumAge: 300000,
          timeout: 10000,
        }
      );
    });
  }

  private handleGeolocationError(
    error: GeolocationPositionError
  ): GeolocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          code: 'PERMISSION_DENIED',
          message:
            'Location permission denied. Please enable location access to see local weather.',
        };
      case error.POSITION_UNAVAILABLE:
        return {
          code: 'POSITION_UNAVAILABLE',
          message: 'Location information is unavailable.',
        };
      case error.TIMEOUT:
        return {
          code: 'TIMEOUT',
          message: 'Location request timed out.',
        };
      default:
        return {
          code: 'UNKNOWN',
          message: 'An unknown error occurred while getting your location.',
        };
    }
  }
}

export const geolocationService = new GeolocationService();
