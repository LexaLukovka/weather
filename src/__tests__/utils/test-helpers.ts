import { expect } from 'vitest';

export const createMockRef = <T>(value: T | null = null) => ({
  current: value,
});

export const expectElementToHaveClasses = (
  element: Element | null,
  classes: string[]
) => {
  expect(element).toBeInTheDocument();
  classes.forEach(className => {
    expect(element).toHaveClass(className);
  });
};
