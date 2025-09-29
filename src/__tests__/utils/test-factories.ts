import { type CityOption, type SearchHistoryItem } from '../../types';

// Factory for creating mock CityOption
export const createMockCityOption = (
  overrides: Partial<CityOption> = {}
): CityOption => ({
  name: 'Test City',
  country: 'Test Country',
  countryCode: 'TC',
  lat: 0,
  lng: 0,
  ...overrides,
});

// Factory for creating mock SearchHistoryItem
export const createMockSearchHistoryItem = (
  overrides: Partial<SearchHistoryItem> = {}
): SearchHistoryItem => ({
  id: 'test-id',
  city: 'Test City',
  country: 'Test Country',
  searchedAt: Date.now(),
  isRemoved: false,
  ...overrides,
});

// Factory for creating mock Error objects
export const createMockError = (
  message = 'Test error',
  code = 'TEST_ERROR'
) => ({
  message,
  code,
});

// Common test data sets
export const MOCK_CITIES = {
  LONDON: createMockCityOption({
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.5074,
    lng: -0.1278,
  }),
  PARIS: createMockCityOption({
    name: 'Paris',
    country: 'France',
    countryCode: 'FR',
    lat: 48.8566,
    lng: 2.3522,
  }),
  NEW_YORK: createMockCityOption({
    name: 'New York',
    country: 'United States',
    countryCode: 'US',
    lat: 40.7128,
    lng: -74.006,
  }),
};

// Common test history items
export const MOCK_HISTORY = {
  NEW_YORK: createMockSearchHistoryItem({
    id: 'history-ny',
    city: 'New York',
    country: 'US',
  }),
  TOKYO: createMockSearchHistoryItem({
    id: 'history-tokyo',
    city: 'Tokyo',
    country: 'JP',
  }),
};
