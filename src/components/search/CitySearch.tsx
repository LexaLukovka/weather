import { type FC } from 'react';

import { useSearchLogic } from '../../hooks';
import { useWeatherStore } from '../../stores';
import { type CitySearchProps } from '../../types';

import { SearchDropdown } from './SearchDropdown';
import { SearchInput } from './SearchInput';

export const CitySearch: FC<CitySearchProps> = ({
  className,
  isLightTheme = false,
}) => {
  const { searchLocalWeather } = useWeatherStore();
  const {
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
  } = useSearchLogic();

  const handleLocationClick = async () => {
    await searchLocalWeather();
  };

  return (
    <div className={className}>
      <div className='mb-6 md:mb-8 relative'>
        <form onSubmit={handleSubmit} className='relative'>
          <SearchInput
            inputRef={inputRef}
            searchTerm={searchTerm}
            isLightTheme={isLightTheme}
            onSearchTermChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onLocationClick={handleLocationClick}
          />
        </form>

        <SearchDropdown
          isVisible={showDropdown}
          loading={loading}
          searchTerm={searchTerm}
          suggestions={suggestions}
          searchHistory={searchHistory}
          selectedIndex={selectedIndex}
          selectedItemId={selectedItemId}
          onCitySelect={handleCitySelect}
          onHistorySelect={handleHistorySelect}
          onMouseEnterItem={setSelectedIndex}
          dropdownRef={dropdownRef}
        />
      </div>
    </div>
  );
};
