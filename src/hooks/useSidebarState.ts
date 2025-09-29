import { useEffect, useRef, useCallback } from 'react';

import { useLocalStorage } from './useLocalStorage';
import { useWindowSize } from './useWindowSize';

interface UseSidebarStateReturn {
  sidebarOpen: boolean;
  handleToggleSidebar: () => void;
}

export const useSidebarState = (debounce = 150): UseSidebarStateReturn => {
  const { isDesktop, isMobile } = useWindowSize(debounce);

  const [sidebarOpen, setSidebarOpen] = useLocalStorage(
    'sidebar-open',
    isDesktop
  );

  const prevIsMobile = useRef(isMobile);

  useEffect(() => {
    if (isMobile && !prevIsMobile.current) {
      setSidebarOpen(false);
    }
    prevIsMobile.current = isMobile;
  }, [isMobile, setSidebarOpen]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, [setSidebarOpen]);

  return {
    sidebarOpen,
    handleToggleSidebar,
  };
};
