import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { type CityOption } from '../../../types';
import { CitySearchListItem } from '../CitySearchListItem';

describe('CitySearchListItem', () => {
  const mockCity: CityOption = {
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    state: 'England',
    lat: 51.5074,
    lng: -0.1278,
  };

  const defaultProps = {
    city: mockCity,
    index: 0,
    selectedIndex: -1,
    searchTerm: '',
    onCitySelect: vi.fn(),
    onMouseEnterItem: vi.fn(),
  };

  it('renders city name', () => {
    render(<CitySearchListItem {...defaultProps} />);

    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('renders city location with state and country', () => {
    render(<CitySearchListItem {...defaultProps} />);

    expect(screen.getByText('England, United Kingdom')).toBeInTheDocument();
  });

  it('renders city location with only country when no state', () => {
    const cityWithoutState = { ...mockCity, state: undefined };
    render(<CitySearchListItem {...defaultProps} city={cityWithoutState} />);

    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('renders MapPin icon', () => {
    const { container } = render(<CitySearchListItem {...defaultProps} />);

    const icon = container.querySelector('.lucide-map-pin');
    expect(icon).toBeInTheDocument();
  });

  it('calls onCitySelect when clicked', () => {
    const onCitySelect = vi.fn();
    const { container } = render(
      <CitySearchListItem {...defaultProps} onCitySelect={onCitySelect} />
    );

    const item = container.firstChild as HTMLElement;
    fireEvent.mouseDown(item);

    expect(onCitySelect).toHaveBeenCalledWith(mockCity);
  });

  it('calls onMouseEnterItem when mouse enters', () => {
    const onMouseEnterItem = vi.fn();
    const { container } = render(
      <CitySearchListItem
        {...defaultProps}
        onMouseEnterItem={onMouseEnterItem}
      />
    );

    const item = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(item);

    expect(onMouseEnterItem).toHaveBeenCalledWith(0);
  });

  it('applies selected styles when item is selected', () => {
    const { container } = render(
      <CitySearchListItem
        {...defaultProps}
        selectedIndex={0}
        searchTerm='London'
      />
    );

    const item = container.firstChild as HTMLElement;
    expect(item).toHaveClass('bg-white/5');
    expect(item).not.toHaveClass('hover:bg-white/5');
  });

  it('applies hover styles when item is not selected', () => {
    const { container } = render(
      <CitySearchListItem
        {...defaultProps}
        selectedIndex={1}
        searchTerm='London'
      />
    );

    const item = container.firstChild as HTMLElement;
    expect(item).toHaveClass('hover:bg-white/5');
    expect(item).not.toHaveClass('bg-white/5');
  });

  it('applies correct base CSS classes', () => {
    const { container } = render(<CitySearchListItem {...defaultProps} />);

    const item = container.firstChild as HTMLElement;
    expect(item).toHaveClass(
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

  it('handles empty state gracefully', () => {
    const cityWithEmptyState = { ...mockCity, state: '' };
    render(<CitySearchListItem {...defaultProps} city={cityWithEmptyState} />);

    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });
});
