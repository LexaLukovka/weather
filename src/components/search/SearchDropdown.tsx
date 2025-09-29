import { type FC } from 'react';

import { type SearchDropdownProps } from '../../types';

import { CitySearchListItem } from './CitySearchListItem.tsx';
import { SearchDropdownLoading } from './SearchDropdownLoading';
import { SearchHistoryList } from './SearchHistoryList';

export const SearchDropdown: FC<SearchDropdownProps> = ({
  isVisible,
  loading,
  searchTerm,
  suggestions,
  searchHistory,
  selectedIndex,
  selectedItemId,
  onCitySelect,
  onHistorySelect,
  onMouseEnterItem,
  dropdownRef,
}) => {
  if (!isVisible) return null;
  if (loading) return <SearchDropdownLoading dropdownRef={dropdownRef} />;

  return (
    <div
      ref={dropdownRef}
      className='search-dropdown absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl max-h-60 md:max-h-80 overflow-y-auto'
      style={{ zIndex: 9999, position: 'absolute' }}
    >
      {searchTerm.length === 0 && searchHistory.length > 0 && (
        <SearchHistoryList
          searchHistory={searchHistory}
          selectedIndex={selectedIndex}
          selectedItemId={selectedItemId}
          searchTerm={searchTerm}
          onHistorySelect={onHistorySelect}
          onMouseEnterItem={onMouseEnterItem}
        />
      )}

      {searchTerm.length === 0 && searchHistory.length === 0 && (
        <div className='px-3 md:px-4 py-4 text-center text-gray-400 text-sm'>
          No search history yet
        </div>
      )}

      {searchTerm.length > 0 &&
        suggestions.length > 0 &&
        suggestions.map((city, index) => (
          <CitySearchListItem
            city={city}
            key={`${city.name}-${city.country}-${index}`}
            index={index}
            selectedIndex={selectedIndex}
            searchTerm={searchTerm}
            onCitySelect={onCitySelect}
            onMouseEnterItem={onMouseEnterItem}
          />
        ))}

      {searchTerm.length > 0 && suggestions.length === 0 && (
        <div className='px-3 md:px-4 py-4 text-center text-gray-400 text-sm'>
          No cities found
        </div>
      )}
    </div>
  );
};
