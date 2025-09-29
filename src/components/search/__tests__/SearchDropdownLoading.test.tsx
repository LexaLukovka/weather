import { createRef } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { SearchDropdownLoading } from '../SearchDropdownLoading';

describe('SearchDropdownLoading', () => {
  it('renders loading message', () => {
    const dropdownRef = createRef<HTMLDivElement>();
    render(<SearchDropdownLoading dropdownRef={dropdownRef} />);

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const dropdownRef = createRef<HTMLDivElement>();
    const { container } = render(
      <SearchDropdownLoading dropdownRef={dropdownRef} />
    );

    const dropdown = container.firstChild as HTMLElement;
    expect(dropdown).toHaveClass(
      'search-dropdown',
      'absolute',
      'top-full',
      'left-0',
      'right-0',
      'mt-2',
      'bg-gray-900/95',
      'backdrop-blur-md',
      'border',
      'border-gray-600',
      'rounded-xl',
      'shadow-2xl',
      'max-h-60',
      'md:max-h-80',
      'overflow-y-auto'
    );
  });

  it('applies correct inline styles', () => {
    const dropdownRef = createRef<HTMLDivElement>();
    const { container } = render(
      <SearchDropdownLoading dropdownRef={dropdownRef} />
    );

    const dropdown = container.firstChild as HTMLElement;
    expect(dropdown).toHaveStyle({
      zIndex: '9999',
      position: 'absolute',
    });
  });

  it('renders loading text with correct styling', () => {
    const dropdownRef = createRef<HTMLDivElement>();
    render(<SearchDropdownLoading dropdownRef={dropdownRef} />);

    const loadingText = screen.getByText('Searching...');
    expect(loadingText).toHaveClass(
      'px-3',
      'md:px-4',
      'py-2',
      'md:py-3',
      'text-white/60',
      'text-center',
      'text-sm'
    );
  });

  it('assigns ref correctly', () => {
    const dropdownRef = createRef<HTMLDivElement>();
    render(<SearchDropdownLoading dropdownRef={dropdownRef} />);

    expect(dropdownRef.current).not.toBeNull();
    expect(dropdownRef.current?.tagName).toBe('DIV');
  });

  it('has correct structure', () => {
    const dropdownRef = createRef<HTMLDivElement>();
    const { container } = render(
      <SearchDropdownLoading dropdownRef={dropdownRef} />
    );

    const dropdown = container.firstChild as HTMLElement;
    expect(dropdown.children).toHaveLength(1);
    expect(dropdown.children[0]).toHaveTextContent('Searching...');
  });
});
