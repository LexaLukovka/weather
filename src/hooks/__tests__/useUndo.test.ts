import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useUndo } from '../useUndo';

describe('useUndo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useUndo<string>());

    expect(result.current.undoItem).toBe(null);
    expect(result.current.isUndoVisible).toBe(false);
    expect(typeof result.current.showUndo).toBe('function');
    expect(typeof result.current.hideUndo).toBe('function');
    expect(typeof result.current.executeUndo).toBe('function');
  });

  it('shows undo with item data', () => {
    const { result } = renderHook(() => useUndo<string>());

    act(() => {
      result.current.showUndo('test item');
    });

    expect(result.current.undoItem).toBe('test item');
    expect(result.current.isUndoVisible).toBe(true);
  });

  it('hides undo after default timeout', () => {
    const { result } = renderHook(() => useUndo<string>());

    act(() => {
      result.current.showUndo('test item');
    });

    expect(result.current.isUndoVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000); // Default timeout
    });

    expect(result.current.undoItem).toBe(null);
    expect(result.current.isUndoVisible).toBe(false);
  });

  it('hides undo after custom timeout', () => {
    const { result } = renderHook(() => useUndo<string>(3000));

    act(() => {
      result.current.showUndo('test item');
    });

    expect(result.current.isUndoVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(result.current.isUndoVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.undoItem).toBe(null);
    expect(result.current.isUndoVisible).toBe(false);
  });

  it('hides undo immediately when hideUndo is called', () => {
    const { result } = renderHook(() => useUndo<string>());

    act(() => {
      result.current.showUndo('test item');
    });

    expect(result.current.isUndoVisible).toBe(true);

    act(() => {
      result.current.hideUndo();
    });

    expect(result.current.undoItem).toBe(null);
    expect(result.current.isUndoVisible).toBe(false);
  });

  it('executes undo and returns item', () => {
    const { result } = renderHook(() => useUndo<string>());

    act(() => {
      result.current.showUndo('test item');
    });

    let returnedItem: string | null = null;

    act(() => {
      returnedItem = result.current.executeUndo();
    });

    expect(returnedItem).toBe('test item');
    expect(result.current.undoItem).toBe(null);
    expect(result.current.isUndoVisible).toBe(false);
  });

  it('clears previous timeout when showUndo is called again', () => {
    const { result } = renderHook(() => useUndo<string>(5000));

    act(() => {
      result.current.showUndo('first item');
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Show new undo before first timeout
    act(() => {
      result.current.showUndo('second item');
    });

    expect(result.current.undoItem).toBe('second item');
    expect(result.current.isUndoVisible).toBe(true);

    // Advance past what would have been the first timeout
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    // Should still be visible because new timeout was set
    expect(result.current.isUndoVisible).toBe(true);

    // Advance to complete second timeout
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.isUndoVisible).toBe(false);
  });

  it('clears timeout when hideUndo is called', () => {
    const { result } = renderHook(() => useUndo<string>());

    act(() => {
      result.current.showUndo('test item');
    });

    act(() => {
      result.current.hideUndo();
    });

    // Advance past original timeout to ensure it was cleared
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.undoItem).toBe(null);
    expect(result.current.isUndoVisible).toBe(false);
  });

  it('works with different types', () => {
    interface TestItem {
      id: string;
      name: string;
    }

    const { result } = renderHook(() => useUndo<TestItem>());
    const testItem: TestItem = { id: '1', name: 'Test' };

    act(() => {
      result.current.showUndo(testItem);
    });

    expect(result.current.undoItem).toEqual(testItem);
    expect(result.current.isUndoVisible).toBe(true);

    let returnedItem: TestItem | null = null;

    act(() => {
      returnedItem = result.current.executeUndo();
    });

    expect(returnedItem).toEqual(testItem);
  });

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { result, unmount } = renderHook(() => useUndo<string>());

    act(() => {
      result.current.showUndo('test item');
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('handles executeUndo when no item is present', () => {
    const { result } = renderHook(() => useUndo<string>());

    let returnedItem: string | null = null;

    act(() => {
      returnedItem = result.current.executeUndo();
    });

    expect(returnedItem).toBe(null);
    expect(result.current.undoItem).toBe(null);
    expect(result.current.isUndoVisible).toBe(false);
  });

  it('handles multiple hideUndo calls gracefully', () => {
    const { result } = renderHook(() => useUndo<string>());

    act(() => {
      result.current.showUndo('test item');
    });

    act(() => {
      result.current.hideUndo();
      result.current.hideUndo();
      result.current.hideUndo();
    });

    expect(result.current.undoItem).toBe(null);
    expect(result.current.isUndoVisible).toBe(false);
  });

  it('does not break when timeout is 0', () => {
    const { result } = renderHook(() => useUndo<string>(0));

    act(() => {
      result.current.showUndo('test item');
    });

    expect(result.current.isUndoVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current.isUndoVisible).toBe(false);
  });
});
