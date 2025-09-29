import { type FormEvent, type KeyboardEvent } from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  MOCK_CITIES,
  MOCK_HISTORY,
  createMockRef,
} from '../../../__tests__/utils';
import { useSearchLogic } from '../../../hooks';
import {
  type CityOption,
  type SearchHistoryItem,
  type SearchInputProps,
  type SearchDropdownProps,
} from '../../../types';
import { CitySearch } from '../CitySearch';

// Mock child components
vi.mock('../SearchInput', () => ({
  SearchInput: ({
    searchTerm,
    onSearchTermChange,
    onKeyDown,
    onFocus,
    onBlur,
    onLocationClick,
    inputRef,
    isLightTheme,
  }: SearchInputProps) => (
    <div data-testid='search-input'>
      <input
        ref={inputRef}
        value={searchTerm}
        onChange={e => onSearchTermChange?.(e)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        data-light-theme={isLightTheme?.toString()}
      />
      <button onClick={onLocationClick} data-testid='location-button'>
        Location
      </button>
    </div>
  ),
}));

vi.mock('../SearchDropdown', () => ({
  SearchDropdown: ({
    suggestions,
    searchHistory,
    selectedIndex,
    selectedItemId,
    onCitySelect,
    onHistorySelect,
    dropdownRef,
    loading,
    isVisible,
  }: SearchDropdownProps) =>
    isVisible ? (
      <div
        ref={dropdownRef}
        data-testid='search-dropdown'
        data-selected-index={selectedIndex}
        data-selected-item-id={selectedItemId}
        data-loading={loading?.toString()}
      >
        {loading && <div data-testid='search-loading'>Loading...</div>}
        {suggestions.map((city: CityOption, index: number) => (
          <button
            key={`${city.name}-${city.country}-${index}`}
            onClick={() => onCitySelect(city)}
            data-testid={`suggestion-${index}`}
          >
            {city.name}
          </button>
        ))}
        {searchHistory.map((item: SearchHistoryItem) => (
          <button
            key={item.id}
            onClick={() => onHistorySelect(item)}
            data-testid={`history-${item.id}`}
          >
            {item.city}
          </button>
        ))}
      </div>
    ) : null,
}));

// Mock hooks
const mockSearchLocalWeather = vi.fn();
vi.mock('../../../stores/weatherStore', () => ({
  useWeatherStore: vi.fn(() => ({
    searchLocalWeather: mockSearchLocalWeather,
  })),
}));

vi.mock('../../../hooks', () => ({
  useSearchLogic: vi.fn(),
}));

describe('CitySearch', () => {
  // Organized mock functions using the test helper
  const mockHandlers = {
    submit: vi.fn().mockResolvedValue(undefined),
    citySelect: vi.fn().mockResolvedValue(undefined),
    historySelect: vi.fn().mockResolvedValue(undefined),
    keyDown: vi.fn().mockResolvedValue(undefined),
    focus: vi.fn(),
    blur: vi.fn(),
    setSearchTerm: vi.fn(),
    setSelectedIndex: vi.fn(),
  };

  const mockHooks = {
    useSearchLogic: vi.mocked(useSearchLogic),
  };

  // Default search logic return value with proper typing
  const createDefaultSearchLogicReturn = (
    overrides: Partial<ReturnType<typeof useSearchLogic>> = {}
  ): ReturnType<typeof useSearchLogic> => ({
    searchTerm: '',
    suggestions: [],
    showDropdown: false,
    selectedIndex: -1,
    loading: false,
    selectedItemId: null,
    searchHistory: [],
    inputRef: createMockRef<HTMLInputElement>(),
    dropdownRef: createMockRef<HTMLDivElement>(),
    setSearchTerm: mockHandlers.setSearchTerm,
    setSelectedIndex: mockHandlers.setSelectedIndex,
    handleSubmit: mockHandlers.submit as (e: FormEvent) => Promise<void>,
    handleCitySelect: mockHandlers.citySelect as (
      city: CityOption
    ) => Promise<void>,
    handleHistorySelect: mockHandlers.historySelect as (
      historyItem: SearchHistoryItem
    ) => Promise<void>,
    handleKeyDown: mockHandlers.keyDown as (
      e: KeyboardEvent<HTMLInputElement>
    ) => Promise<void>,
    handleFocus: mockHandlers.focus,
    handleBlur: mockHandlers.blur,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockHooks.useSearchLogic.mockReturnValue(createDefaultSearchLogicReturn());
  });

  it('renders search input and dropdown', () => {
    mockHooks.useSearchLogic.mockReturnValue(
      createDefaultSearchLogicReturn({
        showDropdown: true,
      })
    );

    render(<CitySearch />);

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
  });

  it('displays suggestions when available', () => {
    const suggestions = [MOCK_CITIES.LONDON, MOCK_CITIES.PARIS];

    mockHooks.useSearchLogic.mockReturnValue(
      createDefaultSearchLogicReturn({
        suggestions,
        showDropdown: true,
      })
    );

    render(<CitySearch />);

    expect(screen.getByTestId('suggestion-0')).toHaveTextContent('London');
    expect(screen.getByTestId('suggestion-1')).toHaveTextContent('Paris');
  });

  it('displays search history when available', () => {
    const searchHistory = [MOCK_HISTORY.NEW_YORK, MOCK_HISTORY.TOKYO];

    mockHooks.useSearchLogic.mockReturnValue(
      createDefaultSearchLogicReturn({
        searchHistory,
        showDropdown: true,
      })
    );

    render(<CitySearch />);

    expect(screen.getByTestId('history-history-ny')).toHaveTextContent(
      'New York'
    );
    expect(screen.getByTestId('history-history-tokyo')).toHaveTextContent(
      'Tokyo'
    );
  });

  it('handles search term changes', () => {
    render(<CitySearch />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'London' } });

    // The event handler calls setSearchTerm with e.target.value
    expect(mockHandlers.setSearchTerm).toHaveBeenCalledWith('London');
  });

  it('handles city selection', () => {
    const city: CityOption = {
      name: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      lat: 51.5074,
      lng: -0.1278,
    };

    mockHooks.useSearchLogic.mockReturnValue({
      ...createDefaultSearchLogicReturn(),
      suggestions: [city],
      showDropdown: true,
    });

    render(<CitySearch />);

    fireEvent.click(screen.getByTestId('suggestion-0'));
    expect(mockHandlers.citySelect).toHaveBeenCalledWith(city);
  });

  it('handles history selection', () => {
    const historyItem: SearchHistoryItem = {
      id: 'h1',
      city: 'New York',
      country: 'US',
      searchedAt: Date.now(),
    };

    mockHooks.useSearchLogic.mockReturnValue({
      ...createDefaultSearchLogicReturn(),
      searchHistory: [historyItem],
      showDropdown: true,
    });

    render(<CitySearch />);

    fireEvent.click(screen.getByTestId('history-h1'));
    expect(mockHandlers.historySelect).toHaveBeenCalledWith(historyItem);
  });

  it('handles keyboard navigation', () => {
    render(<CitySearch />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(mockHandlers.keyDown).toHaveBeenCalled();
  });

  it('handles focus events', () => {
    render(<CitySearch />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(mockHandlers.focus).toHaveBeenCalled();
  });

  it('handles blur events', () => {
    render(<CitySearch />);

    const input = screen.getByRole('textbox');
    fireEvent.blur(input);

    expect(mockHandlers.blur).toHaveBeenCalled();
  });

  it('handles location button click', async () => {
    render(<CitySearch />);

    const locationButton = screen.getByTestId('location-button');
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(mockSearchLocalWeather).toHaveBeenCalled();
    });
  });

  it('passes isLightTheme prop correctly', () => {
    render(<CitySearch isLightTheme={true} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('data-light-theme', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(<CitySearch className='custom-class' />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('shows loading state', () => {
    mockHooks.useSearchLogic.mockReturnValue({
      ...createDefaultSearchLogicReturn(),
      loading: true,
      showDropdown: true,
    });

    render(<CitySearch />);

    expect(screen.getByTestId('search-loading')).toBeInTheDocument();
  });

  it('handles form submission', () => {
    mockHooks.useSearchLogic.mockReturnValue({
      ...createDefaultSearchLogicReturn(),
      searchTerm: 'London',
    });

    const { container } = render(<CitySearch />);
    const form = container.querySelector('form');

    if (form) {
      fireEvent.submit(form);
      expect(mockHandlers.submit).toHaveBeenCalled();
    }
  });

  it('passes selectedIndex to dropdown', () => {
    mockHooks.useSearchLogic.mockReturnValue({
      ...createDefaultSearchLogicReturn(),
      selectedIndex: 2,
      showDropdown: true,
    });

    render(<CitySearch />);

    const dropdown = screen.getByTestId('search-dropdown');
    expect(dropdown).toHaveAttribute('data-selected-index', '2');
  });

  it('passes selectedItemId to dropdown', () => {
    mockHooks.useSearchLogic.mockReturnValue({
      ...createDefaultSearchLogicReturn(),
      selectedItemId: 'item-123',
      showDropdown: true,
    });

    render(<CitySearch />);

    const dropdown = screen.getByTestId('search-dropdown');
    expect(dropdown).toHaveAttribute('data-selected-item-id', 'item-123');
  });
});
