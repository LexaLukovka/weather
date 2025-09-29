import { type FC } from 'react';

import { Search, MapPin } from 'lucide-react';

import { type SearchInputProps } from '../../types';

export const SearchInput: FC<SearchInputProps> = ({
  inputRef,
  searchTerm,
  isLightTheme,
  onSearchTermChange,
  onKeyDown,
  onFocus,
  onBlur,
  onLocationClick,
}) => {
  const getInputStyles = isLightTheme
    ? 'w-full bg-white/10 backdrop-blur-md border border-gray-400 rounded-2xl pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3 text-sm md:text-base text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-600 transition-all duration-200'
    : 'w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200';
  const getSearchIconColor = isLightTheme ? 'text-gray-500' : 'text-white/60';

  return (
    <div className='relative'>
      <Search
        className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 ${getSearchIconColor}`}
      />
      <input
        ref={inputRef}
        type='text'
        value={searchTerm}
        onChange={onSearchTermChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder='Search for a city...'
        className={getInputStyles}
        autoComplete='off'
      />
      {onLocationClick && (
        <button
          type='button'
          onClick={onLocationClick}
          className={`absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors ${getSearchIconColor}`}
          title='Use current location'
        >
          <MapPin className='w-4 h-4 md:w-5 md:h-5' />
        </button>
      )}
    </div>
  );
};
