import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

import { citiesService } from '../services/citiesService';
import { useWeatherStore } from '../stores';
import { type CityOption, type SearchHistoryItem } from '../types';

const SEARCH_DEBOUNCE_MS = 100;
const BLUR_DELAY_MS = 300;

export function useSearchLogic() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const isSelectingRef = useRef<boolean>(false);
  const dropdownShouldStayClosedRef = useRef<boolean>(false);

  const { searchWeather, searchHistory, searchFromHistory, currentWeather } =
    useWeatherStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelectionStart = useCallback(() => {
    isSelectingRef.current = true;
    dropdownShouldStayClosedRef.current = true;
    setShowDropdown(false);
  }, []);

  const handleSelectionComplete = useCallback(() => {
    isSelectingRef.current = false;
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (query.trim().length >= 2) {
      const cities = citiesService.searchCities(query);
      setSuggestions(cities);
      setShowDropdown(cities.length > 0);
      setSelectedIndex(-1);
      setLoading(false);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dropdownShouldStayClosedRef.current) {
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setSelectedIndex(-1);

      const trimmedTerm = searchTerm.trim();
      const shouldShowHistory = isFocused && trimmedTerm.length === 0;
      const shouldSearch = trimmedTerm.length >= 2;

      if (shouldSearch) {
        setLoading(true);
        handleSearch(searchTerm);
      } else if (shouldShowHistory) {
        setSuggestions([]);
        setShowDropdown(true);
        setLoading(false);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isFocused, handleSearch]);

  useEffect(() => {
    if (currentWeather) {
      const matchingHistoryItem = searchHistory.find(
        item =>
          item.city.toLowerCase() === currentWeather.city.toLowerCase() &&
          item.country.toLowerCase() === currentWeather.country.toLowerCase()
      );
      setSelectedItemId(matchingHistoryItem?.id || null);
    } else {
      setSelectedItemId(null);
    }
  }, [currentWeather, searchHistory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      handleSelectionStart();

      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        await searchWeather(suggestions[selectedIndex].name);
      } else if (searchTerm.trim()) {
        await searchWeather(searchTerm.trim());
      }

      setSearchTerm('');
      setShowDropdown(false);
      inputRef.current?.blur();
      handleSelectionComplete();
    },
    [
      selectedIndex,
      suggestions,
      searchTerm,
      searchWeather,
      handleSelectionStart,
      handleSelectionComplete,
    ]
  );

  const handleCitySelect = useCallback(
    async (city: CityOption) => {
      handleSelectionStart();

      if (city.lat && city.lng) {
        await searchWeather(`${city.lat},${city.lng}`);
      } else {
        await searchWeather(city.name);
      }

      setSearchTerm('');
      setShowDropdown(false);
      inputRef.current?.blur();
      handleSelectionComplete();
    },
    [searchWeather, handleSelectionStart, handleSelectionComplete]
  );

  const handleHistorySelect = useCallback(
    async (historyItem: SearchHistoryItem) => {
      handleSelectionStart();

      setSelectedItemId(historyItem.id);
      await searchFromHistory(historyItem);

      setSearchTerm('');
      setShowDropdown(false);
      inputRef.current?.blur();
      handleSelectionComplete();
    },
    [searchFromHistory, handleSelectionStart, handleSelectionComplete]
  );

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) return;

      const totalItems =
        searchTerm.length > 0 ? suggestions.length : searchHistory.length;
      if (totalItems === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex < 0) return;
          if (searchTerm.length > 0 && suggestions[selectedIndex]) {
            await handleCitySelect(suggestions[selectedIndex]);
          } else if (searchTerm.length === 0 && searchHistory[selectedIndex]) {
            await handleHistorySelect(searchHistory[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [
      showDropdown,
      searchTerm,
      suggestions,
      searchHistory,
      selectedIndex,
      handleCitySelect,
      handleHistorySelect,
    ]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    dropdownShouldStayClosedRef.current = false;
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false);
      if (
        !document.activeElement ||
        !inputRef.current?.contains(document.activeElement)
      ) {
        dropdownShouldStayClosedRef.current = false;
      }
    }, BLUR_DELAY_MS);
  }, []);

  return {
    searchTerm,
    suggestions,
    showDropdown,
    selectedIndex,
    loading,
    selectedItemId,
    searchHistory,
    inputRef,
    dropdownRef,
    setSearchTerm,
    setSelectedIndex,
    handleSubmit,
    handleCitySelect,
    handleHistorySelect,
    handleKeyDown,
    handleFocus,
    handleBlur,
  };
}
