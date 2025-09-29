import { type FC, type MouseEvent } from 'react';

import { useUndo, useWindowSize } from '../../hooks';
import { useWeatherStore } from '../../stores';
import { type SearchHistoryItem } from '../../types';

import { EmptyHistoryMessage } from './EmptyHistoryMessage';
import { HistoryItem } from './HistoryItem';
import { SidebarHeader } from './SidebarHeader';
import { UndoToast } from './UndoToast';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const {
    searchHistory,
    searchFromHistory,
    removeFromHistory,
    undoRemove,
    currentWeather,
  } = useWeatherStore();

  const { isMobile } = useWindowSize();

  const { isUndoVisible, undoItem, showUndo, hideUndo, executeUndo } =
    useUndo<SearchHistoryItem>();

  const handleHistoryClick = async (historyItem: SearchHistoryItem) => {
    await searchFromHistory(historyItem);

    if (isMobile) {
      onToggle();
    }
  };

  const handleRemoveItem = (e: MouseEvent, historyItemId: string) => {
    e.stopPropagation();
    removeFromHistory(historyItemId);
    showUndo(
      searchHistory.find(
        history => history.id === historyItemId
      ) as SearchHistoryItem
    );
  };

  const handleUndo = () => {
    const item = executeUndo();
    if (item) {
      undoRemove(item.id);
    }
  };

  return (
    <div
      className={`${
        isOpen ? 'w-full md:w-80' : 'w-0'
      } h-screen transition-all duration-300 relative md:relative ${
        isOpen ? 'fixed md:relative inset-0 z-50 md:z-auto' : ''
      }`}
    >
      <div
        className={`h-full glass-sidebar flex flex-col overflow-hidden ${
          !isOpen && 'opacity-0'
        } ${isOpen ? 'backdrop-blur-md md:backdrop-blur-none' : ''}`}
      >
        <SidebarHeader onToggle={onToggle} />

        <div className='flex-1 min-h-0 overflow-y-auto px-6 pb-6'>
          <div className='space-y-4'>
            {searchHistory.length === 0 ? (
              <EmptyHistoryMessage />
            ) : (
              searchHistory.map((historyItem, index) => {
                const isCurrentlySelected =
                  currentWeather &&
                  historyItem.city.toLowerCase() ===
                    currentWeather.city.toLowerCase() &&
                  historyItem.country.toLowerCase() ===
                    currentWeather.country.toLowerCase();

                return (
                  <HistoryItem
                    key={historyItem.id}
                    historyItem={historyItem}
                    index={index}
                    totalItems={searchHistory.length}
                    isCurrentlySelected={Boolean(isCurrentlySelected)}
                    onHistoryClick={handleHistoryClick}
                    onRemoveItem={handleRemoveItem}
                  />
                );
              })
            )}
          </div>
        </div>

        <UndoToast
          isVisible={isUndoVisible}
          undoItem={undoItem}
          onUndo={handleUndo}
          onHide={hideUndo}
        />
      </div>
    </div>
  );
};
