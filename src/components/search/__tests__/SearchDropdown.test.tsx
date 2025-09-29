import { type RefObject } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { type SearchDropdownProps } from '../../../types';
import { SearchDropdown } from '../SearchDropdown';

// Mock child components
vi.mock('../SearchDropdownLoading', () => ({
  SearchDropdownLoading: ({
    dropdownRef,
  }: {
    dropdownRef: RefObject<HTMLDivElement>;
  }) => (
    <div data-testid='loading' ref={dropdownRef}>
      Loading...
    </div>
  ),
}));

vi.mock('../SearchHistoryList', () => ({
  SearchHistoryList: ({ searchHistory }: { searchHistory: unknown[] }) => (
    <div data-testid='history-list'>History: {searchHistory.length} items</div>
  ),
}));

vi.mock('../CitySearchListItem.tsx', () => ({
  CitySearchListItem: ({ city }: { city: { name: string } }) => (
    <div data-testid='city-item'>{city.name}</div>
  ),
}));

describe('SearchDropdown', () => {
  const defaultProps: SearchDropdownProps = {
    isVisible: true,
    loading: false,
    searchTerm: '',
    suggestions: [],
    searchHistory: [],
    selectedIndex: -1,
    selectedItemId: '',
    onCitySelect: vi.fn(),
    onHistorySelect: vi.fn(),
    onMouseEnterItem: vi.fn(),
    dropdownRef: { current: null },
  };

  it('returns null when not visible', () => {
    const { container } = render(
      <SearchDropdown {...defaultProps} isVisible={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows loading component when loading', () => {
    render(<SearchDropdown {...defaultProps} loading={true} />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows search history when searchTerm is empty and history exists', () => {
    const searchHistory = [
      { id: '1', city: 'London', country: 'UK', searchedAt: Date.now() },
    ];

    render(
      <SearchDropdown
        {...defaultProps}
        searchTerm=''
        searchHistory={searchHistory}
      />
    );

    expect(screen.getByTestId('history-list')).toBeInTheDocument();
  });

  it('shows "No search history yet" when searchTerm is empty and no history', () => {
    render(
      <SearchDropdown {...defaultProps} searchTerm='' searchHistory={[]} />
    );

    expect(screen.getByText('No search history yet')).toBeInTheDocument();
  });

  it('shows city suggestions when searchTerm exists and suggestions available', () => {
    const suggestions = [
      {
        name: 'London',
        country: 'UK',
        countryCode: 'GB',
        lat: 51.5074,
        lng: -0.1278,
      },
      {
        name: 'Paris',
        country: 'France',
        countryCode: 'FR',
        lat: 48.8566,
        lng: 2.3522,
      },
    ];

    render(
      <SearchDropdown
        {...defaultProps}
        searchTerm='lon'
        suggestions={suggestions}
      />
    );

    const cityItems = screen.getAllByTestId('city-item');
    expect(cityItems).toHaveLength(2);
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('shows "No cities found" when searchTerm exists but no suggestions', () => {
    render(
      <SearchDropdown {...defaultProps} searchTerm='xyz' suggestions={[]} />
    );

    expect(screen.getByText('No cities found')).toBeInTheDocument();
  });

  it('applies correct CSS classes to dropdown container', () => {
    const { container } = render(<SearchDropdown {...defaultProps} />);

    const dropdown = container.querySelector('.search-dropdown');
    expect(dropdown).toHaveClass(
      'absolute',
      'top-full',
      'left-0',
      'right-0',
      'mt-2',
      'bg-gray-900/95',
      'backdrop-blur-md',
      'border',
      'border-gray-600',
      'rounded-xl',
      'shadow-2xl',
      'max-h-60',
      'md:max-h-80',
      'overflow-y-auto'
    );
  });

  it('sets correct z-index and position styles', () => {
    const { container } = render(<SearchDropdown {...defaultProps} />);

    const dropdown = container.querySelector('.search-dropdown');
    expect(dropdown).toHaveStyle({
      zIndex: '9999',
      position: 'absolute',
    });
  });

  it('renders multiple city suggestions correctly', () => {
    const suggestions = [
      {
        name: 'London',
        country: 'UK',
        countryCode: 'GB',
        lat: 51.5074,
        lng: -0.1278,
      },
      {
        name: 'Paris',
        country: 'France',
        countryCode: 'FR',
        lat: 48.8566,
        lng: 2.3522,
      },
      {
        name: 'Berlin',
        country: 'Germany',
        countryCode: 'DE',
        lat: 52.52,
        lng: 13.405,
      },
    ];

    render(
      <SearchDropdown
        {...defaultProps}
        searchTerm='test'
        suggestions={suggestions}
      />
    );

    const cityItems = screen.getAllByTestId('city-item');
    expect(cityItems).toHaveLength(3);
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
  });
});
