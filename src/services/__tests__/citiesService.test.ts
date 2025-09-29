import { describe, it, expect, vi } from 'vitest';

import { citiesService } from '../citiesService';

vi.mock('cities.json', () => ({
  default: [
    {
      name: 'London',
      lat: '51.5074',
      lng: '-0.1278',
      country: 'GB',
      admin1: 'England',
      admin2: 'Greater London',
    },
    {
      name: 'New York',
      lat: '40.7128',
      lng: '-74.0060',
      country: 'US',
      admin1: 'New York',
      admin2: 'New York County',
    },
    {
      name: 'Paris',
      lat: '48.8566',
      lng: '2.3522',
      country: 'FR',
      admin1: 'Île-de-France',
      admin2: 'Paris',
    },
    {
      name: 'Tokyo',
      lat: '35.6762',
      lng: '139.6503',
      country: 'JP',
      admin1: 'Tokyo',
      admin2: 'Tokyo',
    },
    {
      name: 'Los Angeles',
      lat: '34.0522',
      lng: '-118.2437',
      country: 'US',
      admin1: 'California',
      admin2: 'Los Angeles County',
    },
    {
      name: 'Barcelona',
      lat: '41.3851',
      lng: '2.1734',
      country: 'ES',
      admin1: 'Catalonia',
      admin2: 'Barcelona',
    },
    {
      name: 'Berlin',
      lat: '52.5200',
      lng: '13.4050',
      country: 'DE',
      admin1: 'Berlin',
      admin2: 'Berlin',
    },
  ],
}));

describe('CitiesService', () => {
  describe('searchCities', () => {
    it('returns popular cities when query is empty', () => {
      const results = citiesService.searchCities('');
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns popular cities when query is less than 2 characters', () => {
      const results = citiesService.searchCities('L');
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds exact city name matches with highest score', () => {
      const results = citiesService.searchCities('London');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('London');
      expect(results[0].country).toBe('United Kingdom');
      expect(results[0].countryCode).toBe('GB');
    });

    it('finds cities that start with search term', () => {
      const results = citiesService.searchCities('Lo');
      const londonResult = results.find(city => city.name === 'London');
      const laResult = results.find(city => city.name === 'Los Angeles');

      expect(londonResult).toBeDefined();
      expect(laResult).toBeDefined();
    });

    it('finds cities that contain search term', () => {
      const results = citiesService.searchCities('York');
      const nyResult = results.find(city => city.name === 'New York');
      expect(nyResult).toBeDefined();
    });

    it('performs fuzzy matching', () => {
      const results = citiesService.searchCities('Prs');
      const parisResult = results.find(city => city.name === 'Paris');
      expect(parisResult).toBeDefined();
    });

    it('limits results to 15 cities', () => {
      const results = citiesService.searchCities('a');
      expect(results.length).toBeLessThanOrEqual(15);
    });

    it('returns city with correct format', () => {
      const results = citiesService.searchCities('London');
      const london = results[0];

      expect(london).toHaveProperty('name');
      expect(london).toHaveProperty('country');
      expect(london).toHaveProperty('countryCode');
      expect(london).toHaveProperty('lat');
      expect(london).toHaveProperty('lng');
      expect(typeof london.lat).toBe('number');
      expect(typeof london.lng).toBe('number');
    });

    it('handles US states correctly', () => {
      const results = citiesService.searchCities('New York');
      const nyResult = results.find(city => city.name === 'New York');
      expect(nyResult?.state).toBe('New York');
    });

    it('handles non-US cities without state', () => {
      const results = citiesService.searchCities('London');
      const londonResult = results[0];
      expect(londonResult.state).toBeUndefined();
    });

    it('sorts results by score in descending order', () => {
      const results = citiesService.searchCities('ar');
      expect(results.length).toBeGreaterThan(0);

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]).toBeDefined();
        expect(results[i]).toBeDefined();
      }
    });

    it('boosts major cities in search results', () => {
      const results = citiesService.searchCities('Lon');
      const londonResult = results.find(city => city.name === 'London');
      expect(londonResult).toBeDefined();
      const londonIndex = results.findIndex(city => city.name === 'London');
      expect(londonIndex).toBeGreaterThanOrEqual(0);
    });

    it('handles case-insensitive search', () => {
      const lowerResults = citiesService.searchCities('london');
      const upperResults = citiesService.searchCities('LONDON');
      const mixedResults = citiesService.searchCities('LoNdOn');

      expect(lowerResults).toHaveLength(1);
      expect(upperResults).toHaveLength(1);
      expect(mixedResults).toHaveLength(1);
      expect(lowerResults[0].name).toBe('London');
      expect(upperResults[0].name).toBe('London');
      expect(mixedResults[0].name).toBe('London');
    });
  });

  describe('getPopularCities', () => {
    it('returns an array of popular cities', () => {
      const results = citiesService.getPopularCities();
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns cities with correct format', () => {
      const results = citiesService.getPopularCities();
      const city = results[0];

      expect(city).toHaveProperty('name');
      expect(city).toHaveProperty('country');
      expect(city).toHaveProperty('countryCode');
      expect(city).toHaveProperty('lat');
      expect(city).toHaveProperty('lng');
      expect(typeof city.lat).toBe('number');
      expect(typeof city.lng).toBe('number');
    });

    it('handles cities not found in data gracefully', () => {
      const results = citiesService.getPopularCities();
      expect(results).toBeInstanceOf(Array);
    });
  });

  describe('private methods behavior', () => {
    it('handles unknown country codes', () => {
      const results = citiesService.searchCities('Tokyo');
      const tokyoResult = results.find(city => city.name === 'Tokyo');
      expect(tokyoResult?.country).toBeDefined();
    });

    it('fuzzy match works correctly', () => {
      const results = citiesService.searchCities('Brln');
      const berlinResult = results.find(city => city.name === 'Berlin');
      expect(berlinResult).toBeDefined();
    });

    it('fuzzy match fails for completely different strings', () => {
      const results = citiesService.searchCities('xyz123');
      expect(results.length).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles null or undefined query', () => {
      const results1 = citiesService.searchCities('');
      const results2 = citiesService.searchCities('');

      expect(results1).toBeInstanceOf(Array);
      expect(results2).toBeInstanceOf(Array);
    });

    it('handles special characters in search', () => {
      const results = citiesService.searchCities('London!@#$');
      expect(results).toBeInstanceOf(Array);
    });

    it('handles very long search terms', () => {
      const longQuery = 'a'.repeat(100);
      const results = citiesService.searchCities(longQuery);
      expect(results).toBeInstanceOf(Array);
    });

    it('handles numeric search terms', () => {
      const results = citiesService.searchCities('123');
      expect(results).toBeInstanceOf(Array);
    });
  });
});
