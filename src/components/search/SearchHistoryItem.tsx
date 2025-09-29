import { type FC } from 'react';

import { Clock } from 'lucide-react';

import { type SearchHistoryItem } from '../../types';

interface SearchHistoryItemProps {
  historyItem: SearchHistoryItem;
  index: number;
  searchTerm: string;
  selectedIndex: number;
  selectedItemId: string | null;
  onHistorySelect: (historyItem: SearchHistoryItem) => void;
  onMouseEnterItem: (index: number) => void;
  formatTime: (timestamp: number) => string;
}

export const SearchHistoryItemComponent: FC<SearchHistoryItemProps> = ({
  historyItem,
  index,
  selectedItemId,
  searchTerm,
  selectedIndex,
  onHistorySelect,
  onMouseEnterItem,
  formatTime,
}) => {
  const isCurrentlySelected = selectedItemId === historyItem.id;
  const isKeyboardSelected = searchTerm.length === 0 && index === selectedIndex;

  return (
    <div
      key={historyItem.id}
      onMouseDown={() => onHistorySelect(historyItem)}
      onMouseEnter={() => onMouseEnterItem(index)}
      className={`group px-3 md:px-4 py-2.5 md:py-3 cursor-pointer flex items-center gap-2 md:gap-3 border-b border-gray-700 last:border-b-0 ${
        isCurrentlySelected
          ? 'bg-white/10'
          : isKeyboardSelected
            ? 'bg-white/5'
            : 'hover:bg-white/5'
      }`}
    >
      <Clock className='w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0' />
      <div className='flex-1 min-w-0'>
        <div className='text-white font-medium truncate text-sm md:text-base'>
          {historyItem.city}
        </div>
        <div className='text-gray-400 text-xs md:text-sm'>
          {formatTime(historyItem.searchedAt)}
        </div>
      </div>
      <div className='w-3.5' />
    </div>
  );
};
