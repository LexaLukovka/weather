import { describe, it, expect } from 'vitest';

import { cn } from '../utils';

describe('cn utility function', () => {
  it('combines class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const condition = false;
    const result = cn('class1', condition && 'class2', 'class3');

    expect(result).toBe('class1 class3');
  });

  it('merges Tailwind classes correctly', () => {
    // Should merge conflicting padding classes
    const result = cn('p-2 p-4');
    expect(result).toBe('p-4');
  });

  it('handles empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles null and undefined values', () => {
    const result = cn('class1', null, undefined, 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles objects with boolean values', () => {
    const result = cn({
      class1: true,
      class2: false,
      class3: true,
    });
    expect(result).toBe('class1 class3');
  });

  it('handles duplicate classes', () => {
    const result = cn('class1', 'class1', 'class2');
    // clsx may not deduplicate simple class strings, but twMerge handles Tailwind conflicts
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('handles complex Tailwind merge scenarios', () => {
    // Should keep the last width class
    const result = cn('w-full w-1/2 w-3/4');
    expect(result).toBe('w-3/4');
  });

  it('handles mixed input types', () => {
    const shouldShow = false;
    const result = cn(
      'base-class',
      ['array-class1', 'array-class2'],
      {
        'conditional-true': true,
        'conditional-false': false,
      },
      shouldShow && 'hidden-class',
      'final-class'
    );
    expect(result).toBe(
      'base-class array-class1 array-class2 conditional-true final-class'
    );
  });
});
