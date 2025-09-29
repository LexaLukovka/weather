import { type FC } from 'react';

import { MapPin } from 'lucide-react';

import { type CityOption } from '../../types';

interface CitySearchListProps {
  city: CityOption;
  index: number;
  selectedIndex: number;
  searchTerm: string;
  onCitySelect: (city: CityOption) => void;
  onMouseEnterItem: (index: number) => void;
}

export const CitySearchListItem: FC<CitySearchListProps> = ({
  city,
  index,
  selectedIndex,
  searchTerm,
  onCitySelect,
  onMouseEnterItem,
}) => {
  return (
    <div
      key={`${city.name}-${city.country}-${index}`}
      onMouseDown={() => onCitySelect(city)}
      onMouseEnter={() => onMouseEnterItem(index)}
      className={`px-3 md:px-4 py-2.5 md:py-3 cursor-pointer flex items-center gap-2 md:gap-3 border-b border-gray-700 last:border-b-0 ${
        searchTerm.length > 0 && index === selectedIndex
          ? 'bg-white/5'
          : 'hover:bg-white/5'
      }`}
    >
      <MapPin className='w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0' />
      <div className='flex-1 min-w-0'>
        <div className='text-white font-medium truncate text-sm md:text-base'>
          {city.name}
        </div>
        <div className='text-gray-400 text-xs md:text-sm truncate'>
          {city.state ? `${city.state}, ${city.country}` : city.country}
        </div>
      </div>
      <div className='w-3.5' />
    </div>
  );
};
