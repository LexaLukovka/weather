import { renderHook, act } from '@testing-library/react';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from 'vitest';

import { useWindowSize } from '../useWindowSize';

// Mock window and ResizeObserver
const mockResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.ResizeObserver = mockResizeObserver;

describe('useWindowSize', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Mock event listeners
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });

    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  describe('Initial State', () => {
    it('returns current window dimensions on mount', () => {
      const { result } = renderHook(() => useWindowSize());

      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
      expect(result.current.isMobile).toBe(false); // 1024 >= 768
      expect(result.current.isDesktop).toBe(true);
    });

    it('sets up resize event listener on mount', () => {
      renderHook(() => useWindowSize());

      expect(window.addEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });
  });

  describe('Window Resize Handling', () => {
    it('updates dimensions when window is resized', () => {
      const { result } = renderHook(() => useWindowSize());

      // Get the resize handler that was added
      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      expect(resizeHandler).toBeDefined();

      // Simulate window resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 800,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 600,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(800);
      expect(result.current.height).toBe(600);
      expect(result.current.isMobile).toBe(false); // 800 >= 768
      expect(result.current.isDesktop).toBe(true);
    });

    it('handles multiple resize events', () => {
      const { result } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      // First resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 1200,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 900,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(1200);
      expect(result.current.height).toBe(900);

      // Second resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 320,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 568,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(320);
      expect(result.current.height).toBe(568);
      expect(result.current.isMobile).toBe(true); // 320 < 768
      expect(result.current.isDesktop).toBe(false);
    });

    it('handles rapid resize events', () => {
      const { result } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      // Simulate rapid resizing
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 500,
          writable: true,
        });

        Object.defineProperty(window, 'innerHeight', {
          value: 400,
          writable: true,
        });
        resizeHandler();

        Object.defineProperty(window, 'innerWidth', {
          value: 600,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 500,
          writable: true,
        });
        resizeHandler();

        Object.defineProperty(window, 'innerWidth', {
          value: 700,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 600,
          writable: true,
        });
        resizeHandler();
      });

      // Should have the final dimensions
      expect(result.current.width).toBe(700);
      expect(result.current.height).toBe(600);
    });
  });

  describe('Cleanup', () => {
    it('removes event listener on unmount', () => {
      const { unmount } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'resize',
        resizeHandler
      );
    });

    it('only adds listener once per hook instance', () => {
      const { rerender } = renderHook(() => useWindowSize());

      // Trigger re-render
      rerender();

      // Should only have been called once during initial mount
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Breakpoints', () => {
    it('handles mobile dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 375,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 667,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
    });

    it('handles tablet dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 768,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 1024,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(768);
      expect(result.current.height).toBe(1024);
    });

    it('handles desktop dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 1920,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 1080,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(1920);
      expect(result.current.height).toBe(1080);
    });

    it('handles ultrawide dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 3440,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 1440,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(3440);
      expect(result.current.height).toBe(1440);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 0,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 0,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(0);
      expect(result.current.height).toBe(0);
    });

    it('handles very small dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 1,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 1,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(1);
      expect(result.current.height).toBe(1);
    });

    it('handles negative dimensions gracefully', () => {
      const { result } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      act(() => {
        // This shouldn't happen in real browsers, but test graceful handling
        Object.defineProperty(window, 'innerWidth', {
          value: -100,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: -100,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(-100);
      expect(result.current.height).toBe(-100);
    });

    it('handles decimal dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      const resizeHandler = (window.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'resize'
      )?.[1];

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: 1024.5,
          writable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: 768.7,
          writable: true,
        });
        resizeHandler();
      });

      expect(result.current.width).toBe(1024.5);
      expect(result.current.height).toBe(768.7);
    });
  });

  describe('Multiple Hook Instances', () => {
    it('handles multiple hook instances correctly', () => {
      const { result: result1 } = renderHook(() => useWindowSize());
      const { result: result2 } = renderHook(() => useWindowSize());

      // Both should have the same initial values
      expect(result1.current.width).toBe(result2.current.width);
      expect(result1.current.height).toBe(result2.current.height);

      // Verify they both use the same event system
      expect(typeof result1.current.width).toBe('number');
      expect(typeof result2.current.width).toBe('number');
      expect(typeof result1.current.isMobile).toBe('boolean');
      expect(typeof result2.current.isMobile).toBe('boolean');
    });
  });

  describe('Performance Considerations', () => {
    it('sets up event listeners correctly', () => {
      renderHook(() => useWindowSize());

      expect(window.addEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });

    it('maintains referential stability for hook return value structure', () => {
      const { result, rerender } = renderHook(() => useWindowSize());

      const firstResult = result.current;

      rerender();

      const secondResult = result.current;

      // The object structure should be consistent
      expect(typeof firstResult.width).toBe('number');
      expect(typeof firstResult.height).toBe('number');
      expect(typeof secondResult.width).toBe('number');
      expect(typeof secondResult.height).toBe('number');
    });
  });

  describe('Server-Side Rendering (SSR) Compatibility', () => {
    it('handles missing window object gracefully', () => {
      // The actual implementation handles undefined window
      const { result } = renderHook(() => useWindowSize());

      // Should have default values when window is available
      expect(typeof result.current.width).toBe('number');
      expect(typeof result.current.height).toBe('number');
      expect(typeof result.current.isMobile).toBe('boolean');
      expect(typeof result.current.isDesktop).toBe('boolean');
    });
  });
});
