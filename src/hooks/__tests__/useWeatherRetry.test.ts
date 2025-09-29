import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { useWeatherStore } from '../../stores';
import { useWeatherRetry } from '../useWeatherRetry';

vi.mock('../../stores/weatherStore', () => ({
  useWeatherStore: vi.fn(),
}));

describe('useWeatherRetry', () => {
  const mockSearchWeather = vi.fn();
  const mockSearchLocalWeather = vi.fn();
  const mockClearError = vi.fn();

  const mockStore = {
    searchWeather: mockSearchWeather,
    searchLocalWeather: mockSearchLocalWeather,
    clearError: mockClearError,
    error: null,
    currentWeather: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWeatherStore).mockReturnValue(mockStore);
  });

  it('returns a retry function', () => {
    const { result } = renderHook(() => useWeatherRetry());

    expect(typeof result.current).toBe('function');
  });

  it('clears error when retrying', async () => {
    const { result } = renderHook(() => useWeatherRetry());

    await act(async () => {
      await result.current();
    });

    expect(mockClearError).toHaveBeenCalled();
  });

  it('searches local weather when permission denied', async () => {
    const storeWithPermissionError = {
      ...mockStore,
      error: { code: 'PERMISSION_DENIED', message: 'Permission denied' },
    };
    vi.mocked(useWeatherStore).mockReturnValue(storeWithPermissionError);

    const { result } = renderHook(() => useWeatherRetry());

    await act(async () => {
      await result.current();
    });

    expect(mockSearchLocalWeather).toHaveBeenCalled();
    expect(mockSearchWeather).not.toHaveBeenCalled();
  });

  it('searches local weather when current location is active', async () => {
    const storeWithCurrentLocation = {
      ...mockStore,
      currentWeather: {
        city: 'London',
        isCurrentLocation: true,
        country: 'UK',
        temperature: 20,
        condition: 'Clear',
        icon: '01d',
      },
    };
    vi.mocked(useWeatherStore).mockReturnValue(storeWithCurrentLocation);

    const { result } = renderHook(() => useWeatherRetry());

    await act(async () => {
      await result.current();
    });

    expect(mockSearchLocalWeather).toHaveBeenCalled();
    expect(mockSearchWeather).not.toHaveBeenCalled();
  });

  it('searches by city when current weather has city', async () => {
    const storeWithCity = {
      ...mockStore,
      currentWeather: {
        city: 'Paris',
        isCurrentLocation: false,
        country: 'France',
        temperature: 22,
        condition: 'Cloudy',
        icon: '03d',
      },
    };
    vi.mocked(useWeatherStore).mockReturnValue(storeWithCity);

    const { result } = renderHook(() => useWeatherRetry());

    await act(async () => {
      await result.current();
    });

    expect(mockSearchWeather).toHaveBeenCalledWith('Paris');
    expect(mockSearchLocalWeather).not.toHaveBeenCalled();
  });

  it('defaults to local weather when no current weather', async () => {
    const { result } = renderHook(() => useWeatherRetry());

    await act(async () => {
      await result.current();
    });

    expect(mockSearchLocalWeather).toHaveBeenCalled();
    expect(mockSearchWeather).not.toHaveBeenCalled();
  });

  it('updates when dependencies change', () => {
    const { result, rerender } = renderHook(() => useWeatherRetry());
    const firstRetry = result.current;

    vi.mocked(useWeatherStore).mockReturnValue({
      ...mockStore,
      currentWeather: {
        city: 'Berlin',
        isCurrentLocation: false,
        country: 'Germany',
        temperature: 18,
        condition: 'Rain',
        icon: '10d',
      },
    });

    rerender();
    const secondRetry = result.current;

    expect(firstRetry).not.toBe(secondRetry);
  });

  it('handles async errors gracefully', async () => {
    mockSearchLocalWeather.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useWeatherRetry());

    await expect(
      act(async () => {
        await result.current();
      })
    ).rejects.toThrow('Network error');

    expect(mockClearError).toHaveBeenCalled();
  });
});
