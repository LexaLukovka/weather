import { type FC } from 'react';

import { Menu } from 'lucide-react';

import { Sidebar } from './Sidebar';

interface SidebarWithToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SidebarWithToggle: FC<SidebarWithToggleProps> = ({
  isOpen,
  onToggle,
}) => {
  return (
    <>
      <Sidebar isOpen={isOpen} onToggle={onToggle} />
      {!isOpen && (
        <button
          onClick={onToggle}
          className='absolute top-4 left-4 z-40 glass-morphism p-2 md:p-3 rounded-lg text-white hover:bg-white/20'
        >
          <Menu className='w-5 h-5 md:w-6 md:h-6 stroke-2' />
        </button>
      )}
    </>
  );
};
