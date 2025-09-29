import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { type SearchHistoryItem } from '../../../types';
import { UndoToast } from '../UndoToast';

const mockUndoItem: SearchHistoryItem = {
  id: 'test-id',
  city: 'London',
  country: 'GB',
  searchedAt: Date.now(),
  isRemoved: true,
};

describe('UndoToast', () => {
  const mockOnUndo = vi.fn();
  const mockOnHide = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isVisible is false', () => {
    const { container } = render(
      <UndoToast
        isVisible={false}
        undoItem={mockUndoItem}
        onUndo={mockOnUndo}
        onHide={mockOnHide}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not render when undoItem is null', () => {
    const { container } = render(
      <UndoToast
        isVisible={true}
        undoItem={null}
        onUndo={mockOnUndo}
        onHide={mockOnHide}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders when isVisible is true and undoItem is provided', () => {
    render(
      <UndoToast
        isVisible={true}
        undoItem={mockUndoItem}
        onUndo={mockOnUndo}
        onHide={mockOnHide}
      />
    );

    expect(screen.getByText('Removed "London"')).toBeInTheDocument();
  });

  it('displays the correct city name in the message', () => {
    const customItem: SearchHistoryItem = {
      ...mockUndoItem,
      city: 'Paris',
    };

    render(
      <UndoToast
        isVisible={true}
        undoItem={customItem}
        onUndo={mockOnUndo}
        onHide={mockOnHide}
      />
    );

    expect(screen.getByText('Removed "Paris"')).toBeInTheDocument();
  });

  it('renders the undo button', () => {
    render(
      <UndoToast
        isVisible={true}
        undoItem={mockUndoItem}
        onUndo={mockOnUndo}
        onHide={mockOnHide}
      />
    );

    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('renders the close button', () => {
    render(
      <UndoToast
        isVisible={true}
        undoItem={mockUndoItem}
        onUndo={mockOnUndo}
        onHide={mockOnHide}
      />
    );

    const buttons = screen.getAllByRole('button');
    // Should have 2 buttons: Undo and Close
    expect(buttons).toHaveLength(2);

    // The close button is the one without text content (just an X icon)
    const closeButton = buttons.find(
      button => !button.textContent?.includes('Undo')
    );
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onUndo when undo button is clicked', () => {
    render(
      <UndoToast
        isVisible={true}
        undoItem={mockUndoItem}
        onUndo={mockOnUndo}
        onHide={mockOnHide}
      />
    );

    const undoButton = screen.getByText('Undo');
    fireEvent.click(undoButton);

    expect(mockOnUndo).toHaveBeenCalledTimes(1);
  });

  it('calls onHide when close button is clicked', () => {
    render(
      <UndoToast
        isVisible={true}
        undoItem={mockUndoItem}
        onUndo={mockOnUndo}
        onHide={mockOnHide}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(
      button =>
        button.querySelector('svg') && !button.textContent?.includes('Undo')
    );

    expect(closeButton).toBeDefined();
    fireEvent.click(closeButton!);

    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('renders with correct styling classes', () => {
    const { container } = render(
      <UndoToast
        isVisible={true}
        undoItem={mockUndoItem}
        onUndo={mockOnUndo}
        onHide={mockOnHide}
      />
    );

    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass(
      'absolute',
      'bottom-4',
      'left-4',
      'right-4',
      'glass-morphism',
      'rounded-lg',
      'p-3',
      'border',
      'border-white/20'
    );
  });

  it('renders icons correctly', () => {
    const { container } = render(
      <UndoToast
        isVisible={true}
        undoItem={mockUndoItem}
        onUndo={mockOnUndo}
        onHide={mockOnHide}
      />
    );

    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(3); // Trash2, Undo2, X icons
  });
});
