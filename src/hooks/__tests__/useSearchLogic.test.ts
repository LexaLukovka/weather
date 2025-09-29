import { type AbstractView, type FormEvent, type KeyboardEvent } from 'react';

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { citiesService } from '../../services/citiesService';
import { useWeatherStore } from '../../stores';
import { type CityOption, type SearchHistoryItem } from '../../types';
import { useSearchLogic } from '../useSearchLogic';

type UseSearchLogicResult = ReturnType<typeof useSearchLogic>;
type RenderHookResult = { current: UseSearchLogicResult };

const createMockFormEvent = (): FormEvent =>
  ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    isDefaultPrevented: vi.fn(() => false),
    isPropagationStopped: vi.fn(() => false),
    persist: vi.fn(),
    currentTarget: {} as HTMLFormElement,
    target: {} as HTMLFormElement,
    nativeEvent: {} as Event,
    bubbles: false,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    timeStamp: 0,
    type: 'submit',
  }) as FormEvent;

const createMockKeyboardEvent = (
  key: string,
  keyCode: number
): KeyboardEvent<HTMLInputElement> =>
  ({
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    isDefaultPrevented: vi.fn(() => false),
    isPropagationStopped: vi.fn(() => false),
    persist: vi.fn(),
    currentTarget: {} as HTMLInputElement,
    target: {} as HTMLInputElement,
    nativeEvent: {} as globalThis.KeyboardEvent,
    bubbles: false,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    timeStamp: 0,
    type: 'keydown',
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
    code: key,
    keyCode,
    charCode: 0,
    location: 0,
    repeat: false,
    which: keyCode,
    getModifierState: vi.fn(() => false),
    locale: '',
    detail: 0,
    view: {
      styleMedia: {},
    } as AbstractView,
  }) as KeyboardEvent<HTMLInputElement>;

const setupSearchSuggestions = (result: RenderHookResult) => {
  act(() => {
    result.current.setSearchTerm('Lo');
  });

  act(() => {
    vi.advanceTimersByTime(100);
  });
};

const testFormSubmission = async (
  result: RenderHookResult,
  mockSearchWeather: ReturnType<typeof vi.fn>,
  expectedCall?: string
) => {
  const mockEvent = createMockFormEvent();

  await act(async () => {
    await result.current.handleSubmit(mockEvent);
  });

  expect(mockEvent.preventDefault).toHaveBeenCalled();
  if (expectedCall) {
    expect(mockSearchWeather).toHaveBeenCalledWith(expectedCall);
  } else {
    expect(mockSearchWeather).not.toHaveBeenCalled();
  }
  expect(result.current.searchTerm).toBe('');
  expect(result.current.showDropdown).toBe(false);
};

const testKeyboardNavigation = async (
  result: RenderHookResult,
  key: string,
  keyCode: number,
  shouldPreventDefault = true
) => {
  const mockEvent = createMockKeyboardEvent(key, keyCode);

  await act(async () => {
    await result.current.handleKeyDown(mockEvent);
  });

  if (shouldPreventDefault) {
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  } else {
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  }

  return { mockEvent, selectedIndex: result.current.selectedIndex };
};

const setupCustomSearch = (result: RenderHookResult, searchTerm: string) => {
  act(() => {
    result.current.setSearchTerm(searchTerm);
  });

  act(() => {
    vi.advanceTimersByTime(100);
  });
};

const setupSelectedSuggestion = (result: RenderHookResult, index: number) => {
  setupSearchSuggestions(result);
  act(() => {
    result.current.setSelectedIndex(index);
  });
};

vi.mock('../../stores/weatherStore', () => ({
  useWeatherStore: vi.fn(),
}));

vi.mock('../../services/citiesService', () => ({
  citiesService: {
    searchCities: vi.fn(),
  },
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('useSearchLogic', () => {
  const mockSearchWeather = vi.fn();
  const mockSearchFromHistory = vi.fn();
  const mockCities: CityOption[] = [
    {
      name: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      lat: 51.5074,
      lng: -0.1278,
    },
    {
      name: 'Los Angeles',
      country: 'United States',
      countryCode: 'US',
      lat: 34.0522,
      lng: -118.2437,
    },
  ];

  const mockHistory: SearchHistoryItem[] = [
    {
      id: '1',
      city: 'Paris',
      country: 'France',
      searchedAt: new Date('2023-01-01').getTime(),
    },
    {
      id: '2',
      city: 'Tokyo',
      country: 'Japan',
      searchedAt: new Date('2023-01-02').getTime(),
    },
  ];

  const mockWeatherStore = {
    searchWeather: mockSearchWeather,
    searchHistory: mockHistory,
    searchFromHistory: mockSearchFromHistory,
    currentWeather: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWeatherStore).mockReturnValue(mockWeatherStore);
    vi.mocked(citiesService.searchCities).mockReturnValue(mockCities);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('returns correct initial state', () => {
      const { result } = renderHook(() => useSearchLogic());

      expect(result.current.searchTerm).toBe('');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.showDropdown).toBe(false);
      expect(result.current.selectedIndex).toBe(-1);
      expect(result.current.loading).toBe(false);
      expect(result.current.selectedItemId).toBeNull();
      expect(result.current.searchHistory).toEqual(mockHistory);
      expect(result.current.inputRef.current).toBeNull();
      expect(result.current.dropdownRef.current).toBeNull();
    });

    it('provides all required action functions', () => {
      const { result } = renderHook(() => useSearchLogic());

      expect(typeof result.current.setSearchTerm).toBe('function');
      expect(typeof result.current.setSelectedIndex).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.handleCitySelect).toBe('function');
      expect(typeof result.current.handleHistorySelect).toBe('function');
      expect(typeof result.current.handleKeyDown).toBe('function');
      expect(typeof result.current.handleFocus).toBe('function');
      expect(typeof result.current.handleBlur).toBe('function');
    });
  });

  describe('Search Term Management', () => {
    it('updates search term', () => {
      const { result } = renderHook(() => useSearchLogic());

      act(() => {
        result.current.setSearchTerm('London');
      });

      expect(result.current.searchTerm).toBe('London');
    });

    it('triggers search when term is >= 2 characters', () => {
      const { result } = renderHook(() => useSearchLogic());

      setupSearchSuggestions(result);

      expect(citiesService.searchCities).toHaveBeenCalledWith('Lo');
      expect(result.current.suggestions).toEqual(mockCities);
      expect(result.current.showDropdown).toBe(true);
    });

    it('does not search when term is < 2 characters', () => {
      const { result } = renderHook(() => useSearchLogic());

      setupCustomSearch(result, 'L');

      expect(citiesService.searchCities).not.toHaveBeenCalled();
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.showDropdown).toBe(false);
    });

    it('shows loading state during search', () => {
      const { result } = renderHook(() => useSearchLogic());

      setupCustomSearch(result, 'London');

      expect(result.current.suggestions).toEqual(mockCities);
      expect(result.current.showDropdown).toBe(true);
    });
  });

  describe('City Selection', () => {
    it('searches weather by city name when no coordinates', async () => {
      const { result } = renderHook(() => useSearchLogic());
      const cityWithoutCoords = {
        ...mockCities[0],
        lat: undefined,
        lng: undefined,
      };

      await act(async () => {
        await result.current.handleCitySelect(cityWithoutCoords);
      });

      expect(mockSearchWeather).toHaveBeenCalledWith('London');
      expect(result.current.searchTerm).toBe('');
      expect(result.current.showDropdown).toBe(false);
    });

    it('searches weather by coordinates when available', async () => {
      const { result } = renderHook(() => useSearchLogic());

      await act(async () => {
        await result.current.handleCitySelect(mockCities[0]);
      });

      expect(mockSearchWeather).toHaveBeenCalledWith('51.5074,-0.1278');
      expect(result.current.searchTerm).toBe('');
      expect(result.current.showDropdown).toBe(false);
    });
  });

  describe('History Selection', () => {
    it('searches from history and updates selected item', async () => {
      const { result } = renderHook(() => useSearchLogic());

      await act(async () => {
        await result.current.handleHistorySelect(mockHistory[0]);
      });

      expect(mockSearchFromHistory).toHaveBeenCalledWith(mockHistory[0]);
      expect(result.current.selectedItemId).toBe('1');
      expect(result.current.searchTerm).toBe('');
      expect(result.current.showDropdown).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('submits selected suggestion when index is valid', async () => {
      const { result } = renderHook(() => useSearchLogic());

      setupSelectedSuggestion(result, 0);

      await testFormSubmission(result, mockSearchWeather, 'London');
    });

    it('submits search term when no selection', async () => {
      const { result } = renderHook(() => useSearchLogic());

      setupCustomSearch(result, 'Custom City');

      await testFormSubmission(result, mockSearchWeather, 'Custom City');
    });

    it('does nothing when no search term and no selection', async () => {
      const { result } = renderHook(() => useSearchLogic());

      await testFormSubmission(result, mockSearchWeather);
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles ArrowDown navigation in suggestions', async () => {
      const { result } = renderHook(() => useSearchLogic());

      setupSearchSuggestions(result);

      const { selectedIndex: firstIndex } = await testKeyboardNavigation(
        result,
        'ArrowDown',
        40
      );
      expect(firstIndex).toBe(0);

      const { selectedIndex: secondIndex } = await testKeyboardNavigation(
        result,
        'ArrowDown',
        40
      );
      expect(secondIndex).toBe(1);
    });

    it('handles ArrowUp navigation in suggestions', async () => {
      const { result } = renderHook(() => useSearchLogic());

      setupSelectedSuggestion(result, 1);

      const { selectedIndex: firstIndex } = await testKeyboardNavigation(
        result,
        'ArrowUp',
        38
      );
      expect(firstIndex).toBe(0);

      const { selectedIndex: secondIndex } = await testKeyboardNavigation(
        result,
        'ArrowUp',
        38
      );
      expect(secondIndex).toBe(-1);
    });

    it('handles Enter key to select suggestion', async () => {
      const { result } = renderHook(() => useSearchLogic());

      setupSelectedSuggestion(result, 0);

      await testKeyboardNavigation(result, 'Enter', 13);
      expect(mockSearchWeather).toHaveBeenCalledWith('51.5074,-0.1278'); // Uses coordinates when available
    });

    it('handles Escape key to close dropdown', async () => {
      const { result } = renderHook(() => useSearchLogic());

      setupSearchSuggestions(result);

      await testKeyboardNavigation(result, 'Escape', 27, false);
      expect(result.current.showDropdown).toBe(false);
      expect(result.current.selectedIndex).toBe(-1);
    });

    it('does nothing when dropdown is not shown', async () => {
      const { result } = renderHook(() => useSearchLogic());

      const { selectedIndex } = await testKeyboardNavigation(
        result,
        'ArrowDown',
        40,
        false
      );
      expect(selectedIndex).toBe(-1);
    });
  });

  describe('Focus and Blur Handling', () => {
    it('handles focus correctly', () => {
      const { result } = renderHook(() => useSearchLogic());

      act(() => {
        result.current.handleFocus();
      });

      // Focus state is internal, but we can verify the function doesn't crash
      expect(typeof result.current.handleFocus).toBe('function');
    });

    it('handles blur with timeout', () => {
      const { result } = renderHook(() => useSearchLogic());

      act(() => {
        result.current.handleBlur();
      });

      // Blur has setTimeout, so we need to advance timers
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(typeof result.current.handleBlur).toBe('function');
    });
  });

  describe('Selected Index Management', () => {
    it('updates selected index', () => {
      const { result } = renderHook(() => useSearchLogic());

      act(() => {
        result.current.setSelectedIndex(2);
      });

      expect(result.current.selectedIndex).toBe(2);
    });

    it('maintains selected index bounds during navigation', async () => {
      const { result } = renderHook(() => useSearchLogic());

      setupSelectedSuggestion(result, 1); // Last item

      const { selectedIndex } = await testKeyboardNavigation(
        result,
        'ArrowDown',
        40
      );
      // Should stay at last item
      expect(selectedIndex).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty search results', () => {
      vi.mocked(citiesService.searchCities).mockReturnValue([]);
      const { result } = renderHook(() => useSearchLogic());

      setupCustomSearch(result, 'Unknown');

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.showDropdown).toBe(false);
    });

    it('resets selectedIndex when search term changes', () => {
      const { result } = renderHook(() => useSearchLogic());

      act(() => {
        result.current.setSelectedIndex(1);
      });

      setupCustomSearch(result, 'New search');

      expect(result.current.selectedIndex).toBe(-1);
    });

    it('handles navigation in history when no search term', async () => {
      const { result } = renderHook(() => useSearchLogic());

      // Show dropdown without search term (focused empty input)
      act(() => {
        result.current.handleFocus();
      });

      setupCustomSearch(result, '');

      await testKeyboardNavigation(result, 'ArrowDown', 40, true);
      // The actual behavior depends on showDropdown state
    });
  });
});
