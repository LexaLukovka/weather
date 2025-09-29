import { useState, useCallback, useEffect, useRef } from 'react';

interface UndoState<T> {
  item: T | null;
  isVisible: boolean;
}

/**
 * Custom hook for undo functionality with auto-dismiss
 * @param timeout - Time in ms before auto-dismissing the undo option (default: 5000)
 * @returns Object with undo state and controls
 */
export function useUndo<T>(timeout: number = 5000) {
  const [undoState, setUndoState] = useState<UndoState<T>>({
    item: null,
    isVisible: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showUndo = useCallback(
    (item: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setUndoState({ item, isVisible: true });

      timeoutRef.current = setTimeout(() => {
        setUndoState({ item: null, isVisible: false });
      }, timeout);
    },
    [timeout]
  );

  const hideUndo = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setUndoState({ item: null, isVisible: false });
  }, []);

  const executeUndo = useCallback(() => {
    const { item } = undoState;
    hideUndo();
    return item;
  }, [undoState, hideUndo]);

  return {
    undoItem: undoState.item,
    isUndoVisible: undoState.isVisible,
    showUndo,
    hideUndo,
    executeUndo,
  };
}
