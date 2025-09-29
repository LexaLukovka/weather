import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { type SearchInputProps } from '../../../types';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  const defaultProps: SearchInputProps = {
    inputRef: { current: null },
    searchTerm: '',
    isLightTheme: false,
    onSearchTermChange: vi.fn(),
    onKeyDown: vi.fn(),
    onFocus: vi.fn(),
    onBlur: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input with correct placeholder', () => {
    render(<SearchInput {...defaultProps} />);

    expect(
      screen.getByPlaceholderText('Search for a city...')
    ).toBeInTheDocument();
  });

  it('displays search term value', () => {
    render(<SearchInput {...defaultProps} searchTerm='London' />);

    expect(screen.getByDisplayValue('London')).toBeInTheDocument();
  });

  it('applies dark theme styles by default', () => {
    render(<SearchInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a city...');
    expect(input).toHaveClass('text-white', 'placeholder-white/60');
  });

  it('applies light theme styles when isLightTheme is true', () => {
    render(<SearchInput {...defaultProps} isLightTheme={true} />);

    const input = screen.getByPlaceholderText('Search for a city...');
    expect(input).toHaveClass('text-gray-800', 'placeholder-gray-500');
  });

  it('calls onSearchTermChange when input value changes', () => {
    const onSearchTermChange = vi.fn();
    render(
      <SearchInput {...defaultProps} onSearchTermChange={onSearchTermChange} />
    );

    const input = screen.getByPlaceholderText('Search for a city...');
    fireEvent.change(input, { target: { value: 'Paris' } });

    expect(onSearchTermChange).toHaveBeenCalledTimes(1);
  });

  it('calls onKeyDown when key is pressed', () => {
    const onKeyDown = vi.fn();
    render(<SearchInput {...defaultProps} onKeyDown={onKeyDown} />);

    const input = screen.getByPlaceholderText('Search for a city...');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('calls onFocus when input is focused', () => {
    const onFocus = vi.fn();
    render(<SearchInput {...defaultProps} onFocus={onFocus} />);

    const input = screen.getByPlaceholderText('Search for a city...');
    fireEvent.focus(input);

    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur when input loses focus', () => {
    const onBlur = vi.fn();
    render(<SearchInput {...defaultProps} onBlur={onBlur} />);

    const input = screen.getByPlaceholderText('Search for a city...');
    fireEvent.blur(input);

    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('renders location button when onLocationClick is provided', () => {
    const onLocationClick = vi.fn();
    render(<SearchInput {...defaultProps} onLocationClick={onLocationClick} />);

    expect(screen.getByTitle('Use current location')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render location button when onLocationClick is not provided', () => {
    render(<SearchInput {...defaultProps} />);

    expect(screen.queryByTitle('Use current location')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onLocationClick when location button is clicked', () => {
    const onLocationClick = vi.fn();
    render(<SearchInput {...defaultProps} onLocationClick={onLocationClick} />);

    const locationButton = screen.getByTitle('Use current location');
    fireEvent.click(locationButton);

    expect(onLocationClick).toHaveBeenCalledTimes(1);
  });

  it('has correct input attributes', () => {
    render(<SearchInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a city...');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('autoComplete', 'off');
  });

  it('renders search icon with correct styling', () => {
    const { container } = render(<SearchInput {...defaultProps} />);

    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).toHaveClass('w-4', 'h-4', 'md:w-5', 'md:h-5');
  });

  it('applies correct icon colors for light theme', () => {
    const { container } = render(
      <SearchInput {...defaultProps} isLightTheme={true} />
    );

    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toHaveClass('text-gray-500');
  });

  it('applies correct icon colors for dark theme', () => {
    const { container } = render(
      <SearchInput {...defaultProps} isLightTheme={false} />
    );

    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toHaveClass('text-white/60');
  });

  it('has correct structure and layout classes', () => {
    const { container } = render(<SearchInput {...defaultProps} />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('relative');

    const input = screen.getByPlaceholderText('Search for a city...');
    expect(input).toHaveClass('w-full', 'rounded-2xl', 'backdrop-blur-md');
  });
});
