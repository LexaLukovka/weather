import axios from 'axios';

interface GeocodedLocation {
  city: string;
  country: string;
  countryCode: string;
  state?: string;
}

export class ReverseGeocodeService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/reverse';

  /**
   * Get city information from coordinates
   * @param latitude
   * @param longitude
   * @returns City and country information
   */
  async getCityFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<GeocodedLocation> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          zoom: 10,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'WeatherApp/1.0',
        },
      });

      const data = response.data;
      const address = data.address || {};

      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.suburb ||
        address.county ||
        data.name ||
        'Unknown Location';

      const country = address.country || 'Unknown Country';
      const countryCode = address.country_code?.toUpperCase() || 'XX';

      return {
        city: this.formatCityName(city),
        country,
        countryCode,
        state: address.state,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Reverse geocoding error:', error);
      return this.getFallbackLocation(latitude, longitude);
    }
  }

  private formatCityName(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private getFallbackLocation(
    latitude: number,
    longitude: number
  ): GeocodedLocation {
    const fallbackCities = [
      {
        lat: 51.5074,
        lon: -0.1278,
        city: 'London',
        country: 'United Kingdom',
        code: 'GB',
      },
      {
        lat: 48.8566,
        lon: 2.3522,
        city: 'Paris',
        country: 'France',
        code: 'FR',
      },
      {
        lat: 40.7128,
        lon: -74.006,
        city: 'New York',
        country: 'United States',
        code: 'US',
      },
      {
        lat: 35.6762,
        lon: 139.6503,
        city: 'Tokyo',
        country: 'Japan',
        code: 'JP',
      },
      {
        lat: 52.52,
        lon: 13.405,
        city: 'Berlin',
        country: 'Germany',
        code: 'DE',
      },
      {
        lat: -33.8688,
        lon: 151.2093,
        city: 'Sydney',
        country: 'Australia',
        code: 'AU',
      },
      {
        lat: 37.7749,
        lon: -122.4194,
        city: 'San Francisco',
        country: 'United States',
        code: 'US',
      },
      {
        lat: 55.7558,
        lon: 37.6173,
        city: 'Moscow',
        country: 'Russia',
        code: 'RU',
      },
      {
        lat: 28.6139,
        lon: 77.209,
        city: 'New Delhi',
        country: 'India',
        code: 'IN',
      },
      {
        lat: -23.5505,
        lon: -46.6333,
        city: 'São Paulo',
        country: 'Brazil',
        code: 'BR',
      },
    ];

    let nearestCity = fallbackCities[0];
    let minDistance = Number.MAX_VALUE;

    for (const city of fallbackCities) {
      const distance = Math.sqrt(
        Math.pow(latitude - city.lat, 2) + Math.pow(longitude - city.lon, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }

    return {
      city: nearestCity.city,
      country: nearestCity.country,
      countryCode: nearestCity.code,
    };
  }
}

export const reverseGeocodeService = new ReverseGeocodeService();
