import citiesData from 'cities.json';

import { type CityOption } from '../types';

import {
  COUNTRY_NAMES,
  MAJOR_CITIES,
  POPULAR_CITIES_DISPLAY,
} from './citiesService.constants';

interface CityData {
  name: string;
  lat: string;
  lng: string;
  country: string;
  admin1: string;
  admin2: string;
}

class CitiesService {
  private cities: CityData[];
  private searchIndex: Map<string, CityData[]> = new Map();

  constructor() {
    this.cities = citiesData as CityData[];
    this.buildSearchIndex();
  }

  private buildSearchIndex() {
    this.cities.forEach(city => {
      const key = city.name.toLowerCase().substring(0, 3);
      if (!this.searchIndex.has(key)) {
        this.searchIndex.set(key, []);
      }
      this.searchIndex.get(key)?.push(city);
    });
  }

  private getCountryName(countryCode: string): string {
    return COUNTRY_NAMES[countryCode] || countryCode;
  }

  private getStateName(
    admin1: string,
    countryCode: string
  ): string | undefined {
    if (countryCode === 'US' && admin1) {
      return admin1;
    }
    return undefined;
  }

  searchCities(query: string): CityOption[] {
    if (!query || query.length < 2) {
      return this.getPopularCities();
    }

    const searchTerm = query.toLowerCase();
    const results: Array<CityData & { score: number }> = [];

    this.cities.forEach(city => {
      const cityName = city.name.toLowerCase();
      let score = 0;

      if (cityName === searchTerm) {
        score = 100;
      } else if (cityName.startsWith(searchTerm)) {
        score = 90;
      } else if (cityName.includes(searchTerm)) {
        score = 70;
      } else if (this.fuzzyMatch(searchTerm, cityName)) {
        score = 50;
      }

      if (score > 0) {
        if (MAJOR_CITIES.has(city.name)) {
          score += 20;
        }
        results.push({ ...city, score });
      }
    });

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 15).map(city => ({
      name: city.name,
      country: this.getCountryName(city.country),
      countryCode: city.country,
      state: this.getStateName(city.admin1, city.country),
      lat: parseFloat(city.lat),
      lng: parseFloat(city.lng),
    }));
  }

  private fuzzyMatch(search: string, target: string): boolean {
    let searchIndex = 0;
    let targetIndex = 0;

    while (searchIndex < search.length && targetIndex < target.length) {
      if (search[searchIndex] === target[targetIndex]) {
        searchIndex++;
      }
      targetIndex++;
    }

    return searchIndex === search.length;
  }

  getPopularCities(): CityOption[] {
    const popularCities: CityOption[] = [];

    POPULAR_CITIES_DISPLAY.forEach(name => {
      const city = this.cities.find(c => c.name === name);
      if (city) {
        popularCities.push({
          name: city.name,
          country: this.getCountryName(city.country),
          countryCode: city.country,
          state: this.getStateName(city.admin1, city.country),
          lat: parseFloat(city.lat),
          lng: parseFloat(city.lng),
        });
      }
    });

    return popularCities;
  }
}

export const citiesService = new CitiesService();
