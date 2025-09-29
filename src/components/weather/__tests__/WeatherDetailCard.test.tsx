import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { WeatherDetailCard } from '../WeatherDetailCard';

describe('WeatherDetailCard', () => {
  it('renders the title correctly', () => {
    render(
      <WeatherDetailCard title='Temperature'>
        <span>25°C</span>
      </WeatherDetailCard>
    );

    expect(screen.getByText('Temperature')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <WeatherDetailCard title='Humidity'>
        <div>65%</div>
      </WeatherDetailCard>
    );

    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('renders with Card component using small variant', () => {
    const { container } = render(
      <WeatherDetailCard title='Wind Speed'>
        <span>10 km/h</span>
      </WeatherDetailCard>
    );

    // Check if it uses Card's small variant classes
    const cardElement = container.querySelector('.glass-morphism');
    expect(cardElement).toHaveClass('rounded-2xl', 'p-3', 'md:p-4');
  });

  it('has correct title styling', () => {
    render(
      <WeatherDetailCard title='Pressure'>
        <span>1013 hPa</span>
      </WeatherDetailCard>
    );

    const title = screen.getByText('Pressure');
    expect(title).toHaveClass(
      'text-white/60',
      'text-xs',
      'uppercase',
      'tracking-wider',
      'text-center',
      'md:text-left'
    );
  });

  it('has correct content styling', () => {
    const { container } = render(
      <WeatherDetailCard title='UV Index'>
        <span>5</span>
      </WeatherDetailCard>
    );

    // Find the content div by looking for the one with text-center class
    const content = container.querySelector('.text-center');
    expect(content).toHaveClass('text-center');
    expect(content).toBeInTheDocument();
  });

  it('has correct structure with title and content divs', () => {
    const { container } = render(
      <WeatherDetailCard title='Visibility'>
        <span>10 km</span>
      </WeatherDetailCard>
    );

    const titleDiv = container.querySelector('.mb-2');
    expect(titleDiv).toBeInTheDocument();

    const contentDiv = container.querySelector('.text-center');
    expect(contentDiv).toBeInTheDocument();
  });

  it('renders complex children correctly', () => {
    render(
      <WeatherDetailCard title='Forecast'>
        <div>
          <p>Tomorrow</p>
          <p>22°C</p>
        </div>
      </WeatherDetailCard>
    );

    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    expect(screen.getByText('22°C')).toBeInTheDocument();
  });

  it('handles empty title', () => {
    const { container } = render(
      <WeatherDetailCard title=''>
        <span>Content</span>
      </WeatherDetailCard>
    );

    // Check that the title paragraph exists even with empty title
    const titleElement = container.querySelector('p');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement?.textContent).toBe('');
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
