import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type RefObject,
  type DependencyList,
} from 'react';

interface UseScrollIndicatorsReturn {
  scrollRef: RefObject<HTMLDivElement | null>;
  showLeftIndicator: boolean;
  showRightIndicator: boolean;
  handleScroll: () => void;
}

/**
 * Custom hook for managing scroll indicators in horizontally scrollable containers
 * @param dependencies - Array of dependencies that should trigger scroll state recalculation
 * @returns Object with scroll ref, indicator states, and scroll handler
 */
export function useScrollIndicators(
  dependencies: DependencyList = []
): UseScrollIndicatorsReturn {
  const [showLeftIndicator, setShowLeftIndicator] = useState<boolean>(false);
  const [showRightIndicator, setShowRightIndicator] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    try {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftIndicator(scrollLeft > 0);
      setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 10);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Error in handleScroll:', error);
    }
  }, []);

  useEffect(() => {
    let scrollElement: HTMLElement | null = null;

    const timer = setTimeout(() => {
      scrollElement = scrollRef.current;
      if (scrollElement) {
        scrollElement.scrollLeft = 0;
        scrollElement.addEventListener('scroll', handleScroll);
        handleScroll();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    scrollRef,
    showLeftIndicator,
    showRightIndicator,
    handleScroll,
  };
}
