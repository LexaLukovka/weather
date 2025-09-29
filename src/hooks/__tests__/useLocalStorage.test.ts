import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  // eslint-disable-next-line no-console
  const originalConsoleWarn = console.warn;
  const mockConsoleWarn = vi.fn();

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
    // eslint-disable-next-line no-console
    console.warn = mockConsoleWarn;
    // Set NODE_ENV to development for testing console warnings
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    // eslint-disable-next-line no-console
    console.warn = originalConsoleWarn;
    localStorage.clear();
  });

  it('returns initial value when no stored value exists', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial-value')
    );

    expect(result.current[0]).toBe('initial-value');
  });

  it('returns stored value when it exists in localStorage', () => {
    localStorage.setItem('existing-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() =>
      useLocalStorage('existing-key', 'initial-value')
    );

    expect(result.current[0]).toBe('stored-value');
  });

  it('updates value and stores in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe('"updated"');
  });

  it('accepts function updater', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1](prev => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorage.getItem('counter')).toBe('1');
  });

  it('removes value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('stored');
    });

    expect(localStorage.getItem('test-key')).toBe('"stored"');

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe('initial');
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('works with complex objects', () => {
    const complexObject = {
      name: 'Test',
      nested: { value: 123 },
      array: [1, 2, 3],
    };

    const { result } = renderHook(() =>
      useLocalStorage('complex', complexObject)
    );

    expect(result.current[0]).toEqual(complexObject);

    const updatedObject = { ...complexObject, name: 'Updated' };

    act(() => {
      result.current[1](updatedObject);
    });

    expect(result.current[0]).toEqual(updatedObject);
    expect(JSON.parse(localStorage.getItem('complex')!)).toEqual(updatedObject);
  });

  it('handles arrays correctly', () => {
    const { result } = renderHook(() =>
      useLocalStorage<string[]>('array-key', [])
    );

    act(() => {
      result.current[1](['item1', 'item2']);
    });

    expect(result.current[0]).toEqual(['item1', 'item2']);
    expect(JSON.parse(localStorage.getItem('array-key')!)).toEqual([
      'item1',
      'item2',
    ]);
  });

  it('handles localStorage errors gracefully on read', () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() =>
      useLocalStorage('error-key', 'fallback')
    );

    expect(result.current[0]).toBe('fallback');

    localStorage.getItem = originalGetItem;
  });

  it('handles localStorage errors gracefully on write', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error('Storage full');
    });

    const { result } = renderHook(() =>
      useLocalStorage('write-error-key', 'initial')
    );

    act(() => {
      result.current[1]('new-value');
    });

    // State should still update even if localStorage fails
    expect(result.current[0]).toBe('new-value');

    localStorage.setItem = originalSetItem;
  });

  it('handles localStorage errors gracefully on remove', () => {
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = vi.fn(() => {
      throw new Error('Remove error');
    });

    const { result } = renderHook(() =>
      useLocalStorage('remove-error-key', 'initial')
    );

    act(() => {
      result.current[2]();
    });

    // Should handle error gracefully without crashing
    expect(result.current[0]).toBe('initial');

    localStorage.removeItem = originalRemoveItem;
  });

  it('handles invalid JSON in localStorage', () => {
    localStorage.setItem('invalid-json', 'not valid json{');

    const { result } = renderHook(() =>
      useLocalStorage('invalid-json', 'default')
    );

    expect(result.current[0]).toBe('default');
  });

  it('handles multiple updates correctly', () => {
    const { result } = renderHook(() => useLocalStorage('multi-key', 0));

    act(() => {
      result.current[1](1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1](prev => prev + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(localStorage.getItem('multi-key')).toBe('2');
  });

  it('maintains referential stability for setValue', () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage('stable-key', 'value')
    );

    const firstSetValue = result.current[1];

    rerender();

    const secondSetValue = result.current[1];

    expect(firstSetValue).toBe(secondSetValue);
  });

  it('maintains referential stability for removeValue', () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage('stable-key', 'value')
    );

    const firstRemoveValue = result.current[2];

    rerender();

    const secondRemoveValue = result.current[2];

    expect(firstRemoveValue).toBe(secondRemoveValue);
  });
});
