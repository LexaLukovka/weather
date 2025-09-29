import { type FC, type MouseEvent } from 'react';

import { MapPin, Clock, Trash2 } from 'lucide-react';

import { type SearchHistoryItem } from '../../types';

interface HistoryItemProps {
  historyItem: SearchHistoryItem;
  index: number;
  totalItems: number;
  isCurrentlySelected: boolean;
  onHistoryClick: (historyItem: SearchHistoryItem) => void;
  onRemoveItem: (e: MouseEvent, historyItemId: string) => void;
}

export const HistoryItem: FC<HistoryItemProps> = ({
  historyItem,
  index,
  totalItems,
  isCurrentlySelected,
  onHistoryClick,
  onRemoveItem,
}) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getItemBackgroundClass = isCurrentlySelected
    ? 'bg-white/10'
    : 'hover:bg-white/5';

  return (
    <div
      key={historyItem.id}
      onClick={() => onHistoryClick(historyItem)}
      className={`group p-4 rounded-2xl cursor-pointer transition-all duration-200 ${getItemBackgroundClass}`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-start gap-2 mb-2'>
            <MapPin className='w-4 h-4 text-white/60 mt-0.5' />
            <h3 className='text-white text-lg font-medium leading-tight'>
              {historyItem.city}
            </h3>
          </div>
          <div className='flex items-center gap-1 text-white/60 text-sm'>
            <Clock className='w-3 h-3' />
            <p>{formatTime(historyItem.searchedAt)}</p>
          </div>
        </div>
        <button
          onClick={e => onRemoveItem(e, historyItem.id)}
          className='opacity-50 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white'
          title='Remove from history'
        >
          <Trash2 className='w-4 h-4 stroke-2' />
        </button>
      </div>
      {index < totalItems - 1 && (
        <div className='mt-4 border-t border-white/20'></div>
      )}
    </div>
  );
};
