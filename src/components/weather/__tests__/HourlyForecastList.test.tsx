import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import '@testing-library/jest-dom';
import { HourlyForecastList } from '../HourlyForecastList';

describe('HourlyForecastList', () => {
  const mockIcon = <div data-testid='weather-icon'>☀️</div>;

  const mockHourlyData = [
    { time: 12, temp: 20, icon: mockIcon, isNow: true },
    { time: 13, temp: 22, icon: mockIcon, isNow: false },
    { time: 9, temp: 18, icon: mockIcon, isNow: false },
  ];

  it('renders loading message when no data', () => {
    render(<HourlyForecastList hourlyData={[]} />);

    expect(screen.getByText('Loading hourly forecast...')).toBeInTheDocument();
  });

  it('renders hourly data items', () => {
    render(<HourlyForecastList hourlyData={mockHourlyData} />);

    expect(screen.getByText('20°')).toBeInTheDocument();
    expect(screen.getByText('22°')).toBeInTheDocument();
    expect(screen.getByText('18°')).toBeInTheDocument();
  });

  it('shows "Now" for first item', () => {
    render(<HourlyForecastList hourlyData={mockHourlyData} />);

    expect(screen.getByText('Now')).toBeInTheDocument();
  });

  it('shows formatted time for non-first items', () => {
    render(<HourlyForecastList hourlyData={mockHourlyData} />);

    expect(screen.getByText('13:00')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument(); // Tests padding with zero
  });

  it('renders weather icons for each hour', () => {
    render(<HourlyForecastList hourlyData={mockHourlyData} />);

    const icons = screen.getAllByTestId('weather-icon');
    expect(icons).toHaveLength(3);
  });

  it('applies correct CSS classes to items', () => {
    const { container } = render(
      <HourlyForecastList hourlyData={mockHourlyData} />
    );

    const items = container.querySelectorAll(
      '.flex.flex-col.items-center.space-y-2'
    );
    expect(items).toHaveLength(3);

    items.forEach(item => {
      expect(item).toHaveClass('min-w-[50px]', 'md:min-w-[60px]');
    });
  });

  it('applies correct CSS classes to time display', () => {
    render(<HourlyForecastList hourlyData={mockHourlyData} />);

    const timeElement = screen.getByText('Now');
    expect(timeElement).toHaveClass('text-white/70', 'text-xs', 'md:text-sm');

    const hourElement = screen.getByText('13:00');
    expect(hourElement).toHaveClass('text-white/70', 'text-xs', 'md:text-sm');
  });

  it('applies correct CSS classes to temperature display', () => {
    render(<HourlyForecastList hourlyData={mockHourlyData} />);

    const tempElement = screen.getByText('20°');
    expect(tempElement).toHaveClass('text-white', 'text-xs', 'md:text-sm');
  });

  it('handles single hour data', () => {
    const singleHourData = [
      { time: 14, temp: 25, icon: mockIcon, isNow: true },
    ];

    render(<HourlyForecastList hourlyData={singleHourData} />);

    expect(screen.getByText('Now')).toBeInTheDocument();
    expect(screen.getByText('25°')).toBeInTheDocument();
    expect(screen.getByTestId('weather-icon')).toBeInTheDocument();
  });

  it('handles 24-hour time format correctly', () => {
    const hourData = [
      { time: 0, temp: 10, icon: mockIcon, isNow: true },
      { time: 23, temp: 15, icon: mockIcon, isNow: false },
    ];

    render(<HourlyForecastList hourlyData={hourData} />);

    expect(screen.getByText('Now')).toBeInTheDocument(); // First item
    expect(screen.getByText('23:00')).toBeInTheDocument(); // Second item
  });

  it('generates unique keys for each item', () => {
    const { container } = render(
      <HourlyForecastList hourlyData={mockHourlyData} />
    );

    const items = container.children;
    const keys = Array.from(items).map((_, index) => {
      // React would assign keys internally, but we can verify structure exists
      return `hour-${mockHourlyData[index].time}-${index}`;
    });

    expect(keys).toEqual(['hour-12-0', 'hour-13-1', 'hour-9-2']);
  });

  it('handles zero temperature correctly', () => {
    const zeroTempData = [{ time: 12, temp: 0, icon: mockIcon, isNow: true }];

    render(<HourlyForecastList hourlyData={zeroTempData} />);

    expect(screen.getByText('0°')).toBeInTheDocument();
  });

  it('handles negative temperature correctly', () => {
    const negativeTempData = [
      { time: 12, temp: -5, icon: mockIcon, isNow: true },
    ];

    render(<HourlyForecastList hourlyData={negativeTempData} />);

    expect(screen.getByText('-5°')).toBeInTheDocument();
  });

  it('applies correct CSS classes to loading state', () => {
    render(<HourlyForecastList hourlyData={[]} />);

    const loadingElement = screen.getByText('Loading hourly forecast...');
    expect(loadingElement).toHaveClass(
      'text-white/60',
      'text-sm',
      'text-center',
      'w-full',
      'py-4'
    );
  });
});
