import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { SidebarHeader } from '../SidebarHeader';

describe('SidebarHeader', () => {
  const defaultProps = {
    onToggle: vi.fn(),
  };

  it('renders header title', () => {
    render(<SidebarHeader {...defaultProps} />);

    expect(screen.getByText('Search History')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<SidebarHeader {...defaultProps} />);

    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onToggle when close button is clicked', () => {
    const onToggle = vi.fn();
    render(<SidebarHeader {...defaultProps} onToggle={onToggle} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders X icon', () => {
    const { container } = render(<SidebarHeader {...defaultProps} />);

    const icon = container.querySelector('.lucide-x');
    expect(icon).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<SidebarHeader {...defaultProps} />);

    const headerContainer = container.querySelector('.flex-shrink-0.p-6');
    expect(headerContainer).toBeInTheDocument();

    const title = screen.getByText('Search History');
    expect(title).toHaveClass('text-white', 'text-xl', 'font-medium');

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'glass-morphism',
      'p-2',
      'rounded-lg',
      'text-white',
      'hover:bg-white/20'
    );
  });
});
