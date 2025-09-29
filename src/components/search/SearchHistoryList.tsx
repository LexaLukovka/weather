import { memo, type FC, useCallback } from 'react';

import { type SearchHistoryItem } from '../../types';

import { SearchHistoryItemComponent } from './SearchHistoryItem';

interface SearchHistoryListProps {
  searchHistory: SearchHistoryItem[];
  selectedIndex: number;
  selectedItemId: string | null;
  searchTerm: string;
  onHistorySelect: (historyItem: SearchHistoryItem) => void;
  onMouseEnterItem: (index: number) => void;
}

export const SearchHistoryList: FC<SearchHistoryListProps> = memo(
  ({
    searchHistory,
    selectedIndex,
    selectedItemId,
    searchTerm,
    onHistorySelect,
    onMouseEnterItem,
  }) => {
    const formatTime = useCallback((timestamp: number) => {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }, []);

    return (
      <>
        <div className='px-3 md:px-4 py-2 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700'>
          Search History
        </div>
        <div className='max-h-60 md:max-h-80 overflow-y-auto'>
          {searchHistory.map((historyItem, index) => (
            <SearchHistoryItemComponent
              key={historyItem.id}
              historyItem={historyItem}
              index={index}
              searchTerm={searchTerm}
              selectedItemId={selectedItemId}
              selectedIndex={selectedIndex}
              onHistorySelect={onHistorySelect}
              onMouseEnterItem={onMouseEnterItem}
              formatTime={formatTime}
            />
          ))}
        </div>
      </>
    );
  }
);

SearchHistoryList.displayName = 'SearchHistoryList';
