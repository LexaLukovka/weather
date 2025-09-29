import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isDesktop: boolean;
}

/**
 * Custom hook for tracking window size with optional debouncing
 * @param debounceMs - Optional debounce delay in milliseconds
 * @returns WindowSize object with width, height, isMobile, and isDesktop
 */
export function useWindowSize(debounceMs?: number): WindowSize {
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleResize = () => {
      const updateSize = () => {
        try {
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Error in handleResize:', error);
        }
      };

      if (debounceMs) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(updateSize, debounceMs);
      } else {
        updateSize();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [debounceMs]);

  return {
    ...windowSize,
    isMobile: windowSize.width < 768,
    isDesktop: windowSize.width >= 768,
  };
}
