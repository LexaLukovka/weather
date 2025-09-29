import { type FC } from 'react';

import { Clock } from 'lucide-react';

export const EmptyHistoryMessage: FC = () => {
  return (
    <div className='text-center py-8'>
      <Clock className='w-12 h-12 text-white/30 mx-auto mb-3' />
      <p className='text-white/60 text-sm'>No search history yet</p>
      <p className='text-white/40 text-xs mt-1'>
        Search for cities to see them here
      </p>
    </div>
  );
};
