import { type FC } from 'react';

import { X } from 'lucide-react';

interface SidebarHeaderProps {
  onToggle: () => void;
}

export const SidebarHeader: FC<SidebarHeaderProps> = ({ onToggle }) => {
  return (
    <div className='flex-shrink-0 p-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-white text-xl font-medium'>Search History</h2>
        <button
          onClick={onToggle}
          className='glass-morphism p-2 rounded-lg text-white hover:bg-white/20'
        >
          <X className='w-5 h-5' />
        </button>
      </div>
    </div>
  );
};
