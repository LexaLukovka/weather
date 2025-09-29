import { type FC } from 'react';

import { X, Trash2, Undo2 } from 'lucide-react';

import { type SearchHistoryItem } from '../../types';

interface UndoToastProps {
  isVisible: boolean;
  undoItem: SearchHistoryItem | null;
  onUndo: () => void;
  onHide: () => void;
}

export const UndoToast: FC<UndoToastProps> = ({
  isVisible,
  undoItem,
  onUndo,
  onHide,
}) => {
  if (!isVisible || !undoItem) return null;

  return (
    <div className='absolute bottom-4 left-4 right-4 glass-morphism rounded-lg p-3 border border-white/20'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Trash2 className='w-4 h-4 text-white/60' />
          <span className='text-white text-sm'>Removed "{undoItem.city}"</span>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={onUndo}
            className='flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm'
          >
            <Undo2 className='w-3 h-3' />
            Undo
          </button>
          <button
            onClick={onHide}
            className='text-white/60 hover:text-white p-1'
          >
            <X className='w-3 h-3' />
          </button>
        </div>
      </div>
    </div>
  );
};
