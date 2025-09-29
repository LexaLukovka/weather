import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useWeatherStore } from '../../stores';
import { type WeatherState } from '../../stores';
import { type CityOption } from '../../types';
import { useInitialCity } from '../useInitialCity';

vi.mock('../../stores', () => ({
  useWeatherStore: vi.fn(),
}));

const mockUseWeatherStore = vi.mocked(useWeatherStore);

describe('useInitialCity', () => {
  const mockSearchWeather = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls searchWeather when currentCity exists and loadingState is idle', () => {
    const mockCity: CityOption = {
      name: 'London',
      country: 'UK',
      countryCode: 'GB',
      lat: 51.5074,
      lng: -0.1278,
    };

    mockUseWeatherStore.mockReturnValue({
      currentCity: mockCity,
      searchWeather: mockSearchWeather,
      loadingState: 'idle',
    } as Pick<WeatherState, 'currentCity' | 'searchWeather' | 'loadingState'>);

    renderHook(() => useInitialCity());

    expect(mockSearchWeather).toHaveBeenCalledTimes(1);
    expect(mockSearchWeather).toHaveBeenCalledWith(mockCity);
  });

  it('does not call searchWeather when currentCity is null', () => {
    mockUseWeatherStore.mockReturnValue({
      currentCity: null,
      searchWeather: mockSearchWeather,
      loadingState: 'idle',
    } as Pick<WeatherState, 'currentCity' | 'searchWeather' | 'loadingState'>);

    renderHook(() => useInitialCity());

    expect(mockSearchWeather).not.toHaveBeenCalled();
  });

  it('does not call searchWeather when currentCity is undefined', () => {
    mockUseWeatherStore.mockReturnValue({
      currentCity: null,
      searchWeather: mockSearchWeather,
      loadingState: 'idle',
    } as Pick<WeatherState, 'currentCity' | 'searchWeather' | 'loadingState'>);

    renderHook(() => useInitialCity());

    expect(mockSearchWeather).not.toHaveBeenCalled();
  });

  it('does not call searchWeather when loadingState is not idle', () => {
    const mockCity = 'London';

    mockUseWeatherStore.mockReturnValue({
      currentCity: mockCity,
      searchWeather: mockSearchWeather,
      loadingState: 'loading',
    } as Pick<WeatherState, 'currentCity' | 'searchWeather' | 'loadingState'>);

    renderHook(() => useInitialCity());

    expect(mockSearchWeather).not.toHaveBeenCalled();
  });

  it('does not call searchWeather when loadingState is error', () => {
    const mockCity = 'London';

    mockUseWeatherStore.mockReturnValue({
      currentCity: mockCity,
      searchWeather: mockSearchWeather,
      loadingState: 'error',
    } as Pick<WeatherState, 'currentCity' | 'searchWeather' | 'loadingState'>);

    renderHook(() => useInitialCity());

    expect(mockSearchWeather).not.toHaveBeenCalled();
  });

  it('does not call searchWeather when both currentCity is null and loadingState is not idle', () => {
    mockUseWeatherStore.mockReturnValue({
      currentCity: null,
      searchWeather: mockSearchWeather,
      loadingState: 'loading',
    } as Pick<WeatherState, 'currentCity' | 'searchWeather' | 'loadingState'>);

    renderHook(() => useInitialCity());

    expect(mockSearchWeather).not.toHaveBeenCalled();
  });

  it('only runs effect once on mount due to empty dependency array', () => {
    const mockCity = 'London';

    mockUseWeatherStore.mockReturnValue({
      currentCity: mockCity,
      searchWeather: mockSearchWeather,
      loadingState: 'idle',
    } as Pick<WeatherState, 'currentCity' | 'searchWeather' | 'loadingState'>);

    const { rerender } = renderHook(() => useInitialCity());
    expect(mockSearchWeather).toHaveBeenCalledTimes(1);

    mockUseWeatherStore.mockReturnValue({
      currentCity: 'Paris',
      searchWeather: mockSearchWeather,
      loadingState: 'idle',
    } as Pick<WeatherState, 'currentCity' | 'searchWeather' | 'loadingState'>);

    rerender();
    expect(mockSearchWeather).toHaveBeenCalledTimes(1);
  });

  it('works with different city data structures', () => {
    const mockCityMinimal = 'Tokyo';

    mockUseWeatherStore.mockReturnValue({
      currentCity: mockCityMinimal,
      searchWeather: mockSearchWeather,
      loadingState: 'idle',
    } as Pick<WeatherState, 'currentCity' | 'searchWeather' | 'loadingState'>);

    renderHook(() => useInitialCity());

    expect(mockSearchWeather).toHaveBeenCalledTimes(1);
    expect(mockSearchWeather).toHaveBeenCalledWith(mockCityMinimal);
  });
});
