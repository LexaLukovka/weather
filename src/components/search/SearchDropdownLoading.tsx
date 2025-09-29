import { type FC, type RefObject } from 'react';

interface SearchDropdownLoadingProps {
  dropdownRef: RefObject<HTMLDivElement | null>;
}

export const SearchDropdownLoading: FC<SearchDropdownLoadingProps> = ({
  dropdownRef,
}) => {
  return (
    <div
      ref={dropdownRef}
      className='search-dropdown absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl max-h-60 md:max-h-80 overflow-y-auto'
      style={{ zIndex: 9999, position: 'absolute' }}
    >
      <div className='px-3 md:px-4 py-2 md:py-3 text-white/60 text-center text-sm'>
        Searching...
      </div>
    </div>
  );
};
