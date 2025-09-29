import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useScrollIndicators } from '../useScrollIndicators';

describe('useScrollIndicators', () => {
  let mockScrollElement: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();

    // Create a mock scroll element
    mockScrollElement = document.createElement('div');
    Object.defineProperties(mockScrollElement, {
      scrollLeft: { value: 0, writable: true, configurable: true },
      scrollWidth: { value: 500, writable: true, configurable: true },
      clientWidth: { value: 200, writable: true, configurable: true },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useScrollIndicators());

    expect(result.current.scrollRef.current).toBeNull();
    expect(result.current.showLeftIndicator).toBe(false);
    expect(result.current.showRightIndicator).toBe(true);
    expect(typeof result.current.handleScroll).toBe('function');
  });

  it('sets up scroll event listener after timeout', () => {
    const { result } = renderHook(() => useScrollIndicators());

    // Set the ref to our mock element
    result.current.scrollRef.current = mockScrollElement;
    const addEventListenerSpy = vi.spyOn(mockScrollElement, 'addEventListener');

    // Fast-forward the timer
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should be called after timeout
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });

  it('handles scroll to update indicators - scrolled to start', () => {
    const { result } = renderHook(() => useScrollIndicators());

    result.current.scrollRef.current = mockScrollElement;
    Object.defineProperty(mockScrollElement, 'scrollLeft', { value: 0 });

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.showLeftIndicator).toBe(false);
    expect(result.current.showRightIndicator).toBe(true);
  });

  it('handles scroll to update indicators - scrolled to middle', () => {
    const { result } = renderHook(() => useScrollIndicators());

    result.current.scrollRef.current = mockScrollElement;
    Object.defineProperty(mockScrollElement, 'scrollLeft', { value: 100 });

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.showLeftIndicator).toBe(true);
    expect(result.current.showRightIndicator).toBe(true);
  });

  it('handles scroll to update indicators - scrolled to end', () => {
    const { result } = renderHook(() => useScrollIndicators());

    result.current.scrollRef.current = mockScrollElement;
    Object.defineProperty(mockScrollElement, 'scrollLeft', { value: 295 });

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.showLeftIndicator).toBe(true);
    expect(result.current.showRightIndicator).toBe(false);
  });

  it('handles scroll to update indicators - scrolled near end with threshold', () => {
    const { result } = renderHook(() => useScrollIndicators());

    result.current.scrollRef.current = mockScrollElement;
    Object.defineProperty(mockScrollElement, 'scrollLeft', { value: 289 });

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.showLeftIndicator).toBe(true);
    // scrollLeft (289) < scrollWidth (500) - clientWidth (200) - 10 = 290, so true
    expect(result.current.showRightIndicator).toBe(true);
  });

  it('does nothing when scrollRef is null', () => {
    const { result } = renderHook(() => useScrollIndicators());

    result.current.scrollRef.current = null;

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.showLeftIndicator).toBe(false);
    expect(result.current.showRightIndicator).toBe(true);
  });

  it('handles errors in scroll calculation gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      /* empty */
    });
    const { result } = renderHook(() => useScrollIndicators());

    result.current.scrollRef.current = mockScrollElement;

    // Make scrollWidth throw an error
    Object.defineProperty(mockScrollElement, 'scrollWidth', {
      get() {
        throw new Error('Test error');
      },
      configurable: true,
    });

    act(() => {
      result.current.handleScroll();
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Error in handleScroll:',
      expect.any(Error)
    );
    consoleWarnSpy.mockRestore();
  });

  it('cleans up event listener on unmount', async () => {
    const { result, unmount } = renderHook(() => useScrollIndicators());

    result.current.scrollRef.current = mockScrollElement;
    const removeEventListenerSpy = vi.spyOn(
      mockScrollElement,
      'removeEventListener'
    );

    // Fast-forward the timer to setup listener
    act(() => {
      vi.advanceTimersByTime(100);
    });

    unmount();

    // Since cleanup happens synchronously on unmount, we can check immediately
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });

  it('clears timeout on unmount if not yet executed', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useScrollIndicators());

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('re-initializes when dependencies change', async () => {
    const { result, rerender } = renderHook(
      ({ deps }) => useScrollIndicators(deps),
      { initialProps: { deps: [1] } }
    );

    result.current.scrollRef.current = mockScrollElement;
    const addEventListenerSpy = vi.spyOn(mockScrollElement, 'addEventListener');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

    // Change dependencies - this should trigger useEffect again
    rerender({ deps: [2] });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Check that listener was added again
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
  });

  it('calls handleScroll initially after setup', async () => {
    const { result } = renderHook(() => useScrollIndicators());

    result.current.scrollRef.current = mockScrollElement;
    Object.defineProperty(mockScrollElement, 'scrollLeft', { value: 150 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // The scroll position should be reset to 0, so left indicator should be false
    expect(result.current.showLeftIndicator).toBe(false);
    expect(result.current.showRightIndicator).toBe(true);
  });

  it('handles empty dependencies array', () => {
    const { result } = renderHook(() => useScrollIndicators([]));

    expect(result.current.scrollRef.current).toBeNull();
    expect(result.current.showLeftIndicator).toBe(false);
    expect(result.current.showRightIndicator).toBe(true);
  });

  it('handles undefined dependencies (default parameter)', () => {
    const { result } = renderHook(() => useScrollIndicators());

    expect(result.current.scrollRef.current).toBeNull();
    expect(result.current.showLeftIndicator).toBe(false);
    expect(result.current.showRightIndicator).toBe(true);
  });

  it('correctly identifies when scrollbar is at various positions', () => {
    const { result } = renderHook(() => useScrollIndicators());

    result.current.scrollRef.current = mockScrollElement;

    // Test various scroll positions
    const positions = [
      { scrollLeft: 0, expectLeft: false, expectRight: true },
      { scrollLeft: 1, expectLeft: true, expectRight: true },
      { scrollLeft: 50, expectLeft: true, expectRight: true },
      { scrollLeft: 150, expectLeft: true, expectRight: true },
      { scrollLeft: 289, expectLeft: true, expectRight: true },
      { scrollLeft: 290, expectLeft: true, expectRight: false },
      { scrollLeft: 300, expectLeft: true, expectRight: false },
    ];

    positions.forEach(({ scrollLeft, expectLeft, expectRight }) => {
      Object.defineProperty(mockScrollElement, 'scrollLeft', {
        value: scrollLeft,
      });

      act(() => {
        result.current.handleScroll();
      });

      expect(result.current.showLeftIndicator).toBe(expectLeft);
      expect(result.current.showRightIndicator).toBe(expectRight);
    });
  });
});
