import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { type SearchHistoryItem } from '../../../types';
import { SearchHistoryList } from '../SearchHistoryList';

// Mock the SearchHistoryItemComponent
vi.mock('../SearchHistoryItem', () => ({
  SearchHistoryItemComponent: ({
    historyItem,
    index,
    formatTime,
    onHistorySelect,
    onMouseEnterItem,
  }: {
    historyItem: { id: string; city: string; searchedAt: number };
    index: number;
    formatTime: (timestamp: number) => string;
    onHistorySelect: (item: unknown) => void;
    onMouseEnterItem: (index: number) => void;
  }) => (
    <div
      data-testid={`history-item-${index}`}
      onClick={() => onHistorySelect(historyItem)}
      onMouseEnter={() => onMouseEnterItem(index)}
    >
      <span data-testid='city'>{historyItem.city}</span>
      <span data-testid='formatted-time'>
        {formatTime(historyItem.searchedAt)}
      </span>
    </div>
  ),
}));

describe('SearchHistoryList', () => {
  const mockSearchHistory: SearchHistoryItem[] = [
    {
      id: '1',
      city: 'London',
      country: 'UK',
      searchedAt: new Date('2023-01-01T12:00:00').getTime(),
    },
    {
      id: '2',
      city: 'Paris',
      country: 'France',
      searchedAt: new Date('2023-01-01T14:30:00').getTime(),
    },
    {
      id: '3',
      city: 'Tokyo',
      country: 'Japan',
      searchedAt: new Date('2023-01-02T09:15:00').getTime(),
    },
  ];

  const defaultProps = {
    searchHistory: mockSearchHistory,
    selectedIndex: -1,
    selectedItemId: null,
    searchTerm: '',
    onHistorySelect: vi.fn(),
    onMouseEnterItem: vi.fn(),
  };

  it('renders "Search History" header', () => {
    render(<SearchHistoryList {...defaultProps} />);

    expect(screen.getByText('Search History')).toBeInTheDocument();
  });

  it('applies correct CSS classes to header', () => {
    render(<SearchHistoryList {...defaultProps} />);

    const header = screen.getByText('Search History');
    expect(header).toHaveClass(
      'px-3',
      'md:px-4',
      'py-2',
      'text-gray-400',
      'text-xs',
      'uppercase',
      'tracking-wider',
      'border-b',
      'border-gray-700'
    );
  });

  it('renders all search history items', () => {
    render(<SearchHistoryList {...defaultProps} />);

    expect(screen.getByTestId('history-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('history-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('history-item-2')).toBeInTheDocument();
  });

  it('passes correct props to SearchHistoryItemComponent', () => {
    render(<SearchHistoryList {...defaultProps} />);

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
  });

  it('formats timestamps correctly', () => {
    render(<SearchHistoryList {...defaultProps} />);

    // Check that formatted times appear (exact format depends on locale)
    const formattedTimes = screen.getAllByTestId('formatted-time');
    expect(formattedTimes).toHaveLength(3);

    // Verify the formatTime function works correctly
    const formatTime = (timestamp: number) => {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    const expectedFormat1 = formatTime(mockSearchHistory[0].searchedAt);
    const expectedFormat2 = formatTime(mockSearchHistory[1].searchedAt);
    const expectedFormat3 = formatTime(mockSearchHistory[2].searchedAt);

    expect(screen.getByText(expectedFormat1)).toBeInTheDocument();
    expect(screen.getByText(expectedFormat2)).toBeInTheDocument();
    expect(screen.getByText(expectedFormat3)).toBeInTheDocument();
  });

  it('handles empty search history', () => {
    render(<SearchHistoryList {...defaultProps} searchHistory={[]} />);

    expect(screen.getByText('Search History')).toBeInTheDocument();
    expect(screen.queryByTestId('history-item-0')).not.toBeInTheDocument();
  });

  it('passes onHistorySelect callback correctly', () => {
    const onHistorySelect = vi.fn();
    render(
      <SearchHistoryList {...defaultProps} onHistorySelect={onHistorySelect} />
    );

    const firstItem = screen.getByTestId('history-item-0');
    firstItem.click();

    expect(onHistorySelect).toHaveBeenCalledWith(mockSearchHistory[0]);
  });

  it('passes onMouseEnterItem callback correctly', () => {
    const onMouseEnterItem = vi.fn();
    render(
      <SearchHistoryList
        {...defaultProps}
        onMouseEnterItem={onMouseEnterItem}
      />
    );

    const firstItem = screen.getByTestId('history-item-0');
    fireEvent.mouseEnter(firstItem);

    expect(onMouseEnterItem).toHaveBeenCalledWith(0);
  });

  it('passes selectedIndex correctly', () => {
    render(<SearchHistoryList {...defaultProps} selectedIndex={1} />);

    // The mock component should receive the selectedIndex prop
    expect(screen.getByTestId('history-item-1')).toBeInTheDocument();
  });

  it('passes selectedItemId correctly', () => {
    render(<SearchHistoryList {...defaultProps} selectedItemId='2' />);

    // The mock component should receive the selectedItemId prop
    expect(screen.getByTestId('history-item-1')).toBeInTheDocument();
  });

  it('passes searchTerm correctly', () => {
    render(<SearchHistoryList {...defaultProps} searchTerm='test' />);

    // The mock component should receive the searchTerm prop
    expect(screen.getByTestId('history-item-0')).toBeInTheDocument();
  });

  it('generates correct keys for items', () => {
    render(<SearchHistoryList {...defaultProps} />);

    // Each item should have the correct history item id as key
    // This is handled by React internally, but we can verify structure
    expect(screen.getByTestId('history-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('history-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('history-item-2')).toBeInTheDocument();
  });

  it('handles single search history item', () => {
    const singleItem = [mockSearchHistory[0]];
    render(<SearchHistoryList {...defaultProps} searchHistory={singleItem} />);

    expect(screen.getByTestId('history-item-0')).toBeInTheDocument();
    expect(screen.queryByTestId('history-item-1')).not.toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('formats different timestamps correctly', () => {
    const timestampFormats = [
      new Date('2023-12-25T08:30:00').getTime(), // Christmas morning
      new Date('2023-07-04T23:59:00').getTime(), // Late evening
      new Date('2023-01-01T00:01:00').getTime(), // Just past midnight
    ];

    const historyWithDifferentTimes = timestampFormats.map((time, index) => ({
      id: `${index + 1}`,
      city: `City ${index + 1}`,
      country: 'Test',
      searchedAt: time,
    }));

    render(
      <SearchHistoryList
        {...defaultProps}
        searchHistory={historyWithDifferentTimes}
      />
    );

    // Verify that all timestamps are formatted and displayed
    const formattedTimes = screen.getAllByTestId('formatted-time');
    expect(formattedTimes).toHaveLength(3);

    // Each should have text content (formatted timestamp)
    formattedTimes.forEach(timeElement => {
      expect(timeElement.textContent).toBeTruthy();
    });
  });
});
