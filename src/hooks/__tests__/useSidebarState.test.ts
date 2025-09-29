import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useLocalStorage } from '../useLocalStorage';
import { useSidebarState } from '../useSidebarState';
import { useWindowSize } from '../useWindowSize';

// Mock the dependencies
vi.mock('../useLocalStorage');
vi.mock('../useWindowSize');

const mockUseLocalStorage = vi.mocked(useLocalStorage);
const mockUseWindowSize = vi.mocked(useWindowSize);

describe('useSidebarState', () => {
  const mockSetSidebarOpen = vi.fn();
  const mockRemoveSidebarValue = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseLocalStorage.mockReturnValue([
      false,
      mockSetSidebarOpen,
      mockRemoveSidebarValue,
    ]);
    mockUseWindowSize.mockReturnValue({
      width: 1024,
      height: 768,
      isDesktop: true,
      isMobile: false,
    });
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useSidebarState());

    expect(result.current.sidebarOpen).toBe(false);
    expect(typeof result.current.handleToggleSidebar).toBe('function');
  });

  it('initializes sidebar open on desktop', () => {
    mockUseWindowSize.mockReturnValue({
      width: 1024,
      height: 768,
      isDesktop: true,
      isMobile: false,
    });
    mockUseLocalStorage.mockReturnValue([
      true,
      mockSetSidebarOpen,
      mockRemoveSidebarValue,
    ]);

    const { result } = renderHook(() => useSidebarState());

    expect(result.current.sidebarOpen).toBe(true);
  });

  it('passes correct parameters to useLocalStorage', () => {
    mockUseWindowSize.mockReturnValue({
      width: 1024,
      height: 768,
      isDesktop: true,
      isMobile: false,
    });

    renderHook(() => useSidebarState());

    expect(mockUseLocalStorage).toHaveBeenCalledWith('sidebar-open', true);
  });

  it('passes debounce value to useWindowSize', () => {
    renderHook(() => useSidebarState(300));

    expect(mockUseWindowSize).toHaveBeenCalledWith(300);
  });

  it('uses default debounce value when not provided', () => {
    renderHook(() => useSidebarState());

    expect(mockUseWindowSize).toHaveBeenCalledWith(150);
  });

  it('toggles sidebar state when handleToggleSidebar is called', () => {
    const { result } = renderHook(() => useSidebarState());

    act(() => {
      result.current.handleToggleSidebar();
    });

    expect(mockSetSidebarOpen).toHaveBeenCalledWith(expect.any(Function));

    // Test the function passed to setSidebarOpen
    const toggleFunction = mockSetSidebarOpen.mock.calls[0][0];
    expect(toggleFunction(false)).toBe(true);
    expect(toggleFunction(true)).toBe(false);
  });

  it('closes sidebar when transitioning from desktop to mobile', () => {
    // Start on desktop
    mockUseWindowSize.mockReturnValue({
      width: 1024,
      height: 768,
      isDesktop: true,
      isMobile: false,
    });

    const { rerender } = renderHook(() => useSidebarState());

    // Transition to mobile
    mockUseWindowSize.mockReturnValue({
      width: 375,
      height: 667,
      isDesktop: false,
      isMobile: true,
    });

    rerender();

    expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('does not close sidebar when starting on mobile', () => {
    // Start on mobile
    mockUseWindowSize.mockReturnValue({
      width: 375,
      height: 667,
      isDesktop: false,
      isMobile: true,
    });

    renderHook(() => useSidebarState());

    // Should not call setSidebarOpen(false) because we started on mobile
    expect(mockSetSidebarOpen).not.toHaveBeenCalledWith(false);
  });

  it('does not close sidebar when staying on desktop', () => {
    // Start on desktop
    mockUseWindowSize.mockReturnValue({
      width: 1024,
      height: 768,
      isDesktop: true,
      isMobile: false,
    });

    const { rerender } = renderHook(() => useSidebarState());

    // Stay on desktop (re-render with same values)
    mockUseWindowSize.mockReturnValue({
      width: 1024,
      height: 768,
      isDesktop: true,
      isMobile: false,
    });

    rerender();

    expect(mockSetSidebarOpen).not.toHaveBeenCalledWith(false);
  });

  it('does not close sidebar when transitioning from mobile to desktop', () => {
    // Start on mobile
    mockUseWindowSize.mockReturnValue({
      width: 375,
      height: 667,
      isDesktop: false,
      isMobile: true,
    });

    const { rerender } = renderHook(() => useSidebarState());

    vi.clearAllMocks(); // Clear the initial calls

    // Transition to desktop
    mockUseWindowSize.mockReturnValue({
      width: 1024,
      height: 768,
      isDesktop: true,
      isMobile: false,
    });

    rerender();

    expect(mockSetSidebarOpen).not.toHaveBeenCalledWith(false);
  });

  it('tracks previous mobile state correctly through multiple changes', () => {
    // Start on desktop
    mockUseWindowSize.mockReturnValue({
      width: 1024,
      height: 768,
      isDesktop: true,
      isMobile: false,
    });

    const { rerender } = renderHook(() => useSidebarState());

    vi.clearAllMocks();

    // Go to mobile (should close sidebar)
    mockUseWindowSize.mockReturnValue({
      width: 375,
      height: 667,
      isDesktop: false,
      isMobile: true,
    });
    rerender();

    expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);

    vi.clearAllMocks();

    // Stay on mobile (should not close again)
    mockUseWindowSize.mockReturnValue({
      width: 375,
      height: 667,
      isDesktop: false,
      isMobile: true,
    });
    rerender();

    expect(mockSetSidebarOpen).not.toHaveBeenCalledWith(false);

    vi.clearAllMocks();

    // Go back to desktop (should not close)
    mockUseWindowSize.mockReturnValue({
      width: 1024,
      height: 768,
      isDesktop: true,
      isMobile: false,
    });
    rerender();

    expect(mockSetSidebarOpen).not.toHaveBeenCalledWith(false);

    vi.clearAllMocks();

    // Go to mobile again (should close again)
    mockUseWindowSize.mockReturnValue({
      width: 375,
      height: 667,
      isDesktop: false,
      isMobile: true,
    });
    rerender();

    expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('handleToggleSidebar function is stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useSidebarState());

    const firstToggleFunction = result.current.handleToggleSidebar;

    rerender();

    const secondToggleFunction = result.current.handleToggleSidebar;

    expect(firstToggleFunction).toBe(secondToggleFunction);
  });

  it('works with different initial localStorage values', () => {
    mockUseLocalStorage.mockReturnValue([
      true,
      mockSetSidebarOpen,
      mockRemoveSidebarValue,
    ]);

    const { result } = renderHook(() => useSidebarState());

    expect(result.current.sidebarOpen).toBe(true);
  });
});
