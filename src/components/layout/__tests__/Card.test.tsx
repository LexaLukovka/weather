import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Card } from '../Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Test content</div>
      </Card>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default medium variant classes', () => {
    const { container } = render(
      <Card>
        <div>Test content</div>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('rounded-2xl', 'p-4', 'md:p-6');
  });

  it('applies small variant classes', () => {
    const { container } = render(
      <Card variant='small'>
        <div>Test content</div>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('rounded-2xl', 'p-3', 'md:p-4');
  });

  it('applies large variant classes', () => {
    const { container } = render(
      <Card variant='large'>
        <div>Test content</div>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('rounded-3xl', 'p-6', 'md:p-8');
  });

  it('applies animation class when animate is true', () => {
    const { container } = render(
      <Card animate>
        <div>Test content</div>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('animate-slide-in');
  });

  it('does not apply animation class when animate is false', () => {
    const { container } = render(
      <Card animate={false}>
        <div>Test content</div>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('animate-slide-in');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className='custom-class'>
        <div>Test content</div>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('combines variant and animation classes correctly', () => {
    const { container } = render(
      <Card variant='small' animate>
        <div>Test content</div>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass(
      'rounded-2xl',
      'p-3',
      'md:p-4',
      'animate-slide-in'
    );
  });

  it('has correct base class', () => {
    const { container } = render(
      <Card>
        <div>Test content</div>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-morphism');
  });

  it('combines all classes correctly', () => {
    const { container } = render(
      <Card variant='large' animate className='custom-class'>
        <div>Test content</div>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass(
      'glass-morphism',
      'rounded-3xl',
      'p-6',
      'md:p-8',
      'animate-slide-in',
      'custom-class'
    );
  });
});
