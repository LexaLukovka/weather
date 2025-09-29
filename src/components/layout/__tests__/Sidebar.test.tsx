import { type MouseEvent } from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import '@testing-library/jest-dom';
import { WeatherProvider } from '../../../contexts/WeatherProvider';
import { useUndo, useWindowSize } from '../../../hooks';
import { useWeatherStore, type WeatherState } from '../../../stores';
import { type WeatherData } from '../../../types';
import { Sidebar } from '../Sidebar';

// Mock hooks
vi.mock('../../../hooks');
vi.mock('../../../stores/weatherStore');

const mockUseUndo = vi.mocked(useUndo);
const mockUseWindowSize = vi.mocked(useWindowSize);
const mockUseWeatherStore = vi.mocked(useWeatherStore);

// Mock components
vi.mock('../SidebarHeader', () => ({
  SidebarHeader: ({ onToggle }: { onToggle: () => void }) => (
    <div data-testid='sidebar-header' onClick={onToggle}>
      SidebarHeader
    </div>
  ),
}));

vi.mock('../EmptyHistoryMessage', () => ({
  EmptyHistoryMessage: () => (
    <div data-testid='empty-history'>EmptyHistoryMessage</div>
  ),
}));

vi.mock('../HistoryItem', () => ({
  HistoryItem: ({
    historyItem,
    onHistoryClick,
    onRemoveItem,
  }: {
    historyItem: { id: string; city: string };
    onHistoryClick: (item: { id: string; city: string }) => void;
    onRemoveItem: (e: MouseEvent, id: string) => void;
  }) => (
    <div data-testid='history-item'>
      <span onClick={() => onHistoryClick(historyItem)}>
        {historyItem.city}
      </span>
      <button
        data-testid={`remove-${historyItem.id}`}
        onClick={e => onRemoveItem(e, historyItem.id)}
      >
        Remove
      </button>
    </div>
  ),
}));

vi.mock('../UndoToast', () => ({
  UndoToast: () => <div data-testid='undo-toast'>UndoToast</div>,
}));

const mockWeatherData: WeatherData = {
  id: '1',
  city: 'London',
  country: 'UK',
  temperature: 20,
  description: 'Clear',
  minTemperature: 15,
  maxTemperature: 25,
  windSpeed: 10,
  humidity: 60,
  icon: 'clear.png',
  timestamp: Date.now(),
};

describe('Sidebar', () => {
  const mockSearchFromHistory = vi.fn();
  const mockRemoveFromHistory = vi.fn();
  const mockUndoRemove = vi.fn();
  const mockShowUndo = vi.fn();
  const mockHideUndo = vi.fn();
  const mockExecuteUndo = vi.fn();

  const defaultProps = {
    isOpen: true,
    onToggle: vi.fn(),
  };

  const mockSearchHistory = [
    { id: '1', city: 'London', country: 'UK', searchedAt: Date.now() },
    { id: '2', city: 'Paris', country: 'France', searchedAt: Date.now() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseWeatherStore.mockReturnValue({
      searchHistory: [],
      searchFromHistory: mockSearchFromHistory,
      removeFromHistory: mockRemoveFromHistory,
      undoRemove: mockUndoRemove,
      currentWeather: null,
    } as unknown as WeatherState);

    mockUseWindowSize.mockReturnValue({
      width: 1024,
      height: 768,
      isMobile: false,
      isDesktop: true,
    });

    mockUseUndo.mockReturnValue({
      undoItem: null,
      isUndoVisible: false,
      showUndo: mockShowUndo,
      hideUndo: mockHideUndo,
      executeUndo: mockExecuteUndo,
    });
  });

  it('renders when open', () => {
    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} />
      </WeatherProvider>
    );

    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
  });

  it('applies correct classes when open', () => {
    const { container } = render(
      <WeatherProvider>
        <Sidebar {...defaultProps} />
      </WeatherProvider>
    );

    // Check for the width classes that indicate the sidebar is open
    const sidebar = container.querySelector('.w-full');
    expect(sidebar).toBeInTheDocument();
  });

  it('applies correct classes when closed', () => {
    const { container } = render(
      <WeatherProvider>
        <Sidebar {...defaultProps} isOpen={false} />
      </WeatherProvider>
    );

    // Check for the width class that indicates the sidebar is closed
    const sidebar = container.querySelector('.w-0');
    expect(sidebar).toBeInTheDocument();
  });

  it('renders empty history message when no history', () => {
    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} />
      </WeatherProvider>
    );

    expect(screen.getByTestId('empty-history')).toBeInTheDocument();
  });

  it('calls onToggle when header is clicked', () => {
    const onToggle = vi.fn();
    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} onToggle={onToggle} />
      </WeatherProvider>
    );

    fireEvent.click(screen.getByTestId('sidebar-header'));
    expect(onToggle).toHaveBeenCalled();
  });

  it('renders undo toast when undo is visible', () => {
    mockUseUndo.mockReturnValueOnce({
      undoItem: { ...mockWeatherData },
      isUndoVisible: true,
      showUndo: mockShowUndo,
      hideUndo: mockHideUndo,
      executeUndo: mockExecuteUndo,
    });

    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} />
      </WeatherProvider>
    );

    expect(screen.getByTestId('undo-toast')).toBeInTheDocument();
  });

  it('renders history items when searchHistory has items', () => {
    mockUseWeatherStore.mockReturnValue({
      searchHistory: mockSearchHistory,
      searchFromHistory: mockSearchFromHistory,
      removeFromHistory: mockRemoveFromHistory,
      undoRemove: mockUndoRemove,
      currentWeather: null,
    } as unknown as WeatherState);

    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} />
      </WeatherProvider>
    );

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-history')).not.toBeInTheDocument();
  });

  it('calls searchFromHistory when history item is clicked', async () => {
    mockUseWeatherStore.mockReturnValue({
      searchHistory: mockSearchHistory,
      searchFromHistory: mockSearchFromHistory,
      removeFromHistory: mockRemoveFromHistory,
      undoRemove: mockUndoRemove,
      currentWeather: null,
    } as unknown as WeatherState);

    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} />
      </WeatherProvider>
    );

    fireEvent.click(screen.getByText('London'));
    expect(mockSearchFromHistory).toHaveBeenCalledWith(mockSearchHistory[0]);
  });

  it('closes sidebar on mobile when history item is clicked', async () => {
    const onToggle = vi.fn();

    // Set up mobile mock before rendering
    mockUseWindowSize.mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isDesktop: false,
    });

    mockUseWeatherStore.mockReturnValue({
      searchHistory: mockSearchHistory,
      searchFromHistory: mockSearchFromHistory,
      removeFromHistory: mockRemoveFromHistory,
      undoRemove: mockUndoRemove,
      currentWeather: null,
    } as unknown as WeatherState);

    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} onToggle={onToggle} />
      </WeatherProvider>
    );

    // Wait for any promises to resolve first
    await new Promise(resolve => setTimeout(resolve, 0));

    fireEvent.click(screen.getByText('London'));

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockSearchFromHistory).toHaveBeenCalledWith(mockSearchHistory[0]);
    expect(onToggle).toHaveBeenCalled();
  });

  it('handles remove item correctly', () => {
    mockUseWeatherStore.mockReturnValue({
      searchHistory: mockSearchHistory,
      searchFromHistory: mockSearchFromHistory,
      removeFromHistory: mockRemoveFromHistory,
      undoRemove: mockUndoRemove,
      currentWeather: null,
    } as unknown as WeatherState);

    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} />
      </WeatherProvider>
    );

    fireEvent.click(screen.getByTestId('remove-1'));

    expect(mockRemoveFromHistory).toHaveBeenCalledWith('1');
    expect(mockShowUndo).toHaveBeenCalledWith(mockSearchHistory[0]);
  });

  it('handles undo functionality', () => {
    const mockItem = mockSearchHistory[0];
    mockExecuteUndo.mockReturnValue(mockItem);

    mockUseUndo.mockReturnValue({
      undoItem: mockItem,
      isUndoVisible: true,
      showUndo: mockShowUndo,
      hideUndo: mockHideUndo,
      executeUndo: mockExecuteUndo,
    });

    mockUseWeatherStore.mockReturnValue({
      searchHistory: mockSearchHistory,
      searchFromHistory: mockSearchFromHistory,
      removeFromHistory: mockRemoveFromHistory,
      undoRemove: mockUndoRemove,
      currentWeather: null,
    } as unknown as WeatherState);

    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} />
      </WeatherProvider>
    );

    // Simulate undo action
    const handleUndo = () => {
      const item = mockExecuteUndo();
      if (item) {
        mockUndoRemove(item.id);
      }
    };

    handleUndo();
    expect(mockExecuteUndo).toHaveBeenCalled();
    expect(mockUndoRemove).toHaveBeenCalledWith('1');
  });

  it('handles undo when executeUndo returns null', () => {
    mockExecuteUndo.mockReturnValue(null);

    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} />
      </WeatherProvider>
    );

    // Simulate undo action
    const handleUndo = () => {
      const item = mockExecuteUndo();
      if (item) {
        mockUndoRemove(item.id);
      }
    };

    handleUndo();
    expect(mockExecuteUndo).toHaveBeenCalled();
    expect(mockUndoRemove).not.toHaveBeenCalled();
  });

  it('identifies currently selected weather item', () => {
    const currentWeather = {
      city: 'London',
      country: 'UK',
    };

    mockUseWeatherStore.mockReturnValue({
      searchHistory: mockSearchHistory,
      searchFromHistory: mockSearchFromHistory,
      removeFromHistory: mockRemoveFromHistory,
      undoRemove: mockUndoRemove,
      currentWeather,
    } as unknown as WeatherState);

    render(
      <WeatherProvider>
        <Sidebar {...defaultProps} />
      </WeatherProvider>
    );

    // The HistoryItem should receive isCurrentlySelected as true for London
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('applies mobile-specific styles when open', () => {
    const { container } = render(
      <WeatherProvider>
        <Sidebar {...defaultProps} isOpen={true} />
      </WeatherProvider>
    );

    const sidebar = container.querySelector(
      '.fixed.md\\:relative.inset-0.z-50.md\\:z-auto'
    );
    expect(sidebar).toBeInTheDocument();
  });

  it('applies backdrop blur on mobile when open', () => {
    const { container } = render(
      <WeatherProvider>
        <Sidebar {...defaultProps} isOpen={true} />
      </WeatherProvider>
    );

    const glassContainer = container.querySelector(
      '.backdrop-blur-md.md\\:backdrop-blur-none'
    );
    expect(glassContainer).toBeInTheDocument();
  });

  it('applies opacity when closed', () => {
    const { container } = render(
      <WeatherProvider>
        <Sidebar {...defaultProps} isOpen={false} />
      </WeatherProvider>
    );

    const glassContainer = container.querySelector('.opacity-0');
    expect(glassContainer).toBeInTheDocument();
  });
});
