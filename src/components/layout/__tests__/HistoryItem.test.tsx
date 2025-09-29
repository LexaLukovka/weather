import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { type SearchHistoryItem } from '../../../types';
import { HistoryItem } from '../HistoryItem';

const mockItem: SearchHistoryItem = {
  id: '1',
  city: 'London',
  country: 'UK',
  searchedAt: Date.now(),
};

describe('HistoryItem', () => {
  const defaultProps = {
    historyItem: mockItem,
    index: 0,
    totalItems: 1,
    isCurrentlySelected: false,
    onHistoryClick: vi.fn(),
    onRemoveItem: vi.fn(),
  };

  it('renders city name', () => {
    render(<HistoryItem {...defaultProps} />);

    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('renders location icon', () => {
    const { container } = render(<HistoryItem {...defaultProps} />);

    const icon = container.querySelector('.lucide-map-pin');
    expect(icon).toBeInTheDocument();
  });

  it('renders timestamp', () => {
    const searchedAt = Date.now();
    const itemWithTimestamp = { ...mockItem, searchedAt };
    render(<HistoryItem {...defaultProps} historyItem={itemWithTimestamp} />);

    const formattedTime = new Date(searchedAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    expect(screen.getByText(formattedTime)).toBeInTheDocument();
  });

  it('calls onHistoryClick when clicked', () => {
    const onHistoryClick = vi.fn();
    render(<HistoryItem {...defaultProps} onHistoryClick={onHistoryClick} />);

    const item = screen.getByRole('button');
    fireEvent.click(item);

    expect(onHistoryClick).toHaveBeenCalledWith(mockItem);
  });

  it('calls onRemoveItem when remove button is clicked', () => {
    const onRemoveItem = vi.fn();
    render(<HistoryItem {...defaultProps} onRemoveItem={onRemoveItem} />);

    const removeButton = screen.getByTitle('Remove from history');
    fireEvent.click(removeButton);

    expect(onRemoveItem).toHaveBeenCalled();
  });

  it('applies selected styles when isCurrentlySelected is true', () => {
    const { container } = render(
      <HistoryItem {...defaultProps} isCurrentlySelected={true} />
    );

    const item = container.querySelector('.bg-white\\/10');
    expect(item).toBeInTheDocument();
  });

  it('applies hover styles when not selected', () => {
    const { container } = render(
      <HistoryItem {...defaultProps} isCurrentlySelected={false} />
    );

    const item = container.querySelector('.hover\\:bg-white\\/5');
    expect(item).toBeInTheDocument();
  });

  it('handles empty country gracefully', () => {
    const itemWithoutCountry = { ...mockItem, country: '' };
    render(<HistoryItem {...defaultProps} historyItem={itemWithoutCountry} />);

    expect(screen.getByText('London')).toBeInTheDocument();
  });
});
