import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { EmptyHistoryMessage } from '../EmptyHistoryMessage';

describe('EmptyHistoryMessage', () => {
  it('renders the main message', () => {
    render(<EmptyHistoryMessage />);

    expect(screen.getByText('No search history yet')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<EmptyHistoryMessage />);

    expect(
      screen.getByText('Search for cities to see them here')
    ).toBeInTheDocument();
  });

  it('renders the clock icon', () => {
    const { container } = render(<EmptyHistoryMessage />);

    const clockIcon = container.querySelector('svg');
    expect(clockIcon).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<EmptyHistoryMessage />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('text-center', 'py-8');
  });

  it('has correct icon styling', () => {
    const { container } = render(<EmptyHistoryMessage />);

    const clockIcon = container.querySelector('svg');
    expect(clockIcon).toHaveClass(
      'w-12',
      'h-12',
      'text-white/30',
      'mx-auto',
      'mb-3'
    );
  });

  it('has correct text styling for main message', () => {
    render(<EmptyHistoryMessage />);

    const mainMessage = screen.getByText('No search history yet');
    expect(mainMessage).toHaveClass('text-white/60', 'text-sm');
  });

  it('has correct text styling for description', () => {
    render(<EmptyHistoryMessage />);

    const description = screen.getByText('Search for cities to see them here');
    expect(description).toHaveClass('text-white/40', 'text-xs', 'mt-1');
  });
});
