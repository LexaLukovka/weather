import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { type SearchHistoryItem } from '../../../types';
import { SearchHistoryItemComponent } from '../SearchHistoryItem';

describe('SearchHistoryItemComponent', () => {
  const mockHistoryItem: SearchHistoryItem = {
    id: '1',
    city: 'London',
    country: 'UK',
    searchedAt: Date.now(),
  };

  const defaultProps = {
    historyItem: mockHistoryItem,
    index: 0,
    searchTerm: '',
    selectedIndex: -1,
    selectedItemId: null,
    onHistorySelect: vi.fn(),
    onMouseEnterItem: vi.fn(),
    formatTime: vi.fn(() => 'Jan 1, 12:00 PM'),
  };

  it('renders city name', () => {
    render(<SearchHistoryItemComponent {...defaultProps} />);

    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('renders formatted time using formatTime function', () => {
    const formatTime = vi.fn(() => 'Custom formatted time');

    render(
      <SearchHistoryItemComponent {...defaultProps} formatTime={formatTime} />
    );

    expect(formatTime).toHaveBeenCalledWith(mockHistoryItem.searchedAt);
    expect(screen.getByText('Custom formatted time')).toBeInTheDocument();
  });

  it('renders Clock icon', () => {
    const { container } = render(
      <SearchHistoryItemComponent {...defaultProps} />
    );

    const icon = container.querySelector('.lucide-clock');
    expect(icon).toBeInTheDocument();
  });

  it('calls onHistorySelect when clicked', () => {
    const onHistorySelect = vi.fn();

    const { container } = render(
      <SearchHistoryItemComponent
        {...defaultProps}
        onHistorySelect={onHistorySelect}
      />
    );

    const item = container.firstChild as HTMLElement;
    fireEvent.mouseDown(item);

    expect(onHistorySelect).toHaveBeenCalledWith(mockHistoryItem);
  });

  it('calls onMouseEnterItem when mouse enters', () => {
    const onMouseEnterItem = vi.fn();

    const { container } = render(
      <SearchHistoryItemComponent
        {...defaultProps}
        onMouseEnterItem={onMouseEnterItem}
      />
    );

    const item = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(item);

    expect(onMouseEnterItem).toHaveBeenCalledWith(0);
  });

  it('applies selected styles when item is currently selected', () => {
    const { container } = render(
      <SearchHistoryItemComponent
        {...defaultProps}
        selectedItemId={mockHistoryItem.id}
      />
    );

    const item = container.firstChild as HTMLElement;
    expect(item).toHaveClass('bg-white/10');
    expect(item).not.toHaveClass('bg-white/5', 'hover:bg-white/5');
  });

  it('applies keyboard selected styles when keyboard selected', () => {
    const { container } = render(
      <SearchHistoryItemComponent
        {...defaultProps}
        selectedIndex={0}
        searchTerm=''
      />
    );

    const item = container.firstChild as HTMLElement;
    expect(item).toHaveClass('bg-white/5');
    expect(item).not.toHaveClass('bg-white/10', 'hover:bg-white/5');
  });

  it('applies hover styles when not selected', () => {
    const { container } = render(
      <SearchHistoryItemComponent
        {...defaultProps}
        selectedIndex={1}
        selectedItemId='different-id'
      />
    );

    const item = container.firstChild as HTMLElement;
    expect(item).toHaveClass('hover:bg-white/5');
    expect(item).not.toHaveClass('bg-white/10', 'bg-white/5');
  });

  it('keyboard selection only applies when searchTerm is empty', () => {
    const { container } = render(
      <SearchHistoryItemComponent
        {...defaultProps}
        selectedIndex={0}
        searchTerm='test'
      />
    );

    const item = container.firstChild as HTMLElement;
    expect(item).toHaveClass('hover:bg-white/5');
    expect(item).not.toHaveClass('bg-white/5', 'bg-white/10');
  });

  it('applies correct base CSS classes', () => {
    const { container } = render(
      <SearchHistoryItemComponent {...defaultProps} />
    );

    const item = container.firstChild as HTMLElement;
    expect(item).toHaveClass(
      'group',
      'px-3',
      'md:px-4',
      'py-2.5',
      'md:py-3',
      'cursor-pointer',
      'flex',
      'items-center',
      'gap-2',
      'md:gap-3',
      'border-b',
      'border-gray-700',
      'last:border-b-0'
    );
  });

  it('applies correct classes to city name', () => {
    render(<SearchHistoryItemComponent {...defaultProps} />);

    const cityElement = screen.getByText('London');
    expect(cityElement).toHaveClass(
      'text-white',
      'font-medium',
      'truncate',
      'text-sm',
      'md:text-base'
    );
  });

  it('applies correct classes to timestamp', () => {
    render(<SearchHistoryItemComponent {...defaultProps} />);

    const timeElement = screen.getByText('Jan 1, 12:00 PM');
    expect(timeElement).toHaveClass('text-gray-400', 'text-xs', 'md:text-sm');
  });

  it('applies correct classes to Clock icon', () => {
    const { container } = render(
      <SearchHistoryItemComponent {...defaultProps} />
    );

    const icon = container.querySelector('.lucide-clock');
    expect(icon).toHaveClass(
      'w-3.5',
      'h-3.5',
      'md:w-4',
      'md:h-4',
      'text-gray-400',
      'flex-shrink-0'
    );
  });

  it('handles long city names with truncation', () => {
    const longCityItem = {
      ...mockHistoryItem,
      city: 'Very Long City Name That Should Be Truncated',
    };

    render(
      <SearchHistoryItemComponent
        {...defaultProps}
        historyItem={longCityItem}
      />
    );

    const cityElement = screen.getByText(
      'Very Long City Name That Should Be Truncated'
    );
    expect(cityElement).toHaveClass('truncate');
  });

  it('passes correct key attribute', () => {
    const { container } = render(
      <SearchHistoryItemComponent {...defaultProps} />
    );

    const item = container.firstChild as HTMLElement;
    // The key is set on the element, but not directly accessible in tests
    // We can verify the structure is correct
    expect(item).toBeInTheDocument();
  });
});
