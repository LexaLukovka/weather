import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { WeatherProvider } from '../../../contexts/WeatherProvider';
import { SidebarWithToggle } from '../SidebarWithToggle';

// Mock the Sidebar component
vi.mock('../Sidebar', () => ({
  Sidebar: ({
    isOpen,
    onToggle,
  }: {
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <div data-testid='sidebar' data-open={isOpen} onClick={onToggle}>
      Sidebar
    </div>
  ),
}));

describe('SidebarWithToggle', () => {
  const defaultProps = {
    isOpen: false,
    onToggle: vi.fn(),
  };

  it('renders Sidebar component', () => {
    render(
      <WeatherProvider>
        <SidebarWithToggle {...defaultProps} />
      </WeatherProvider>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('passes props to Sidebar component', () => {
    render(
      <WeatherProvider>
        <SidebarWithToggle {...defaultProps} isOpen={true} />
      </WeatherProvider>
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'true');
  });

  it('shows toggle button when sidebar is closed', () => {
    render(
      <WeatherProvider>
        <SidebarWithToggle {...defaultProps} isOpen={false} />
      </WeatherProvider>
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  it('hides toggle button when sidebar is open', () => {
    render(
      <WeatherProvider>
        <SidebarWithToggle {...defaultProps} isOpen={true} />
      </WeatherProvider>
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onToggle when toggle button is clicked', () => {
    const onToggle = vi.fn();
    render(
      <WeatherProvider>
        <SidebarWithToggle
          {...defaultProps}
          onToggle={onToggle}
          isOpen={false}
        />
      </WeatherProvider>
    );

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders Menu icon in toggle button', () => {
    const { container } = render(
      <WeatherProvider>
        <SidebarWithToggle {...defaultProps} isOpen={false} />
      </WeatherProvider>
    );

    const icon = container.querySelector('.lucide-menu');
    expect(icon).toBeInTheDocument();
  });

  it('applies correct CSS classes to toggle button', () => {
    render(
      <WeatherProvider>
        <SidebarWithToggle {...defaultProps} isOpen={false} />
      </WeatherProvider>
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass(
      'absolute',
      'top-4',
      'left-4',
      'z-40',
      'glass-morphism',
      'p-2',
      'md:p-3',
      'rounded-lg',
      'text-white',
      'hover:bg-white/20'
    );
  });
});
