import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { getErrorTitle, getErrorIcon } from '../errorHelpers';

describe('errorHelpers', () => {
  describe('getErrorTitle', () => {
    it('returns correct title for CITY_NOT_FOUND error', () => {
      const result = getErrorTitle('CITY_NOT_FOUND');
      expect(result).toBe('City Not Found');
    });

    it('returns correct title for NETWORK_ERROR error', () => {
      const result = getErrorTitle('NETWORK_ERROR');
      expect(result).toBe('Connection Error');
    });

    it('returns correct title for RATE_LIMIT error', () => {
      const result = getErrorTitle('RATE_LIMIT');
      expect(result).toBe('Too Many Requests');
    });

    it('returns correct title for INVALID_INPUT error', () => {
      const result = getErrorTitle('INVALID_INPUT');
      expect(result).toBe('Invalid Input');
    });

    it('returns default title for unknown error code', () => {
      const result = getErrorTitle('UNKNOWN_ERROR');
      expect(result).toBe('Something went wrong');
    });

    it('returns default title when no code is provided', () => {
      const result = getErrorTitle();
      expect(result).toBe('Something went wrong');
    });

    it('returns default title for undefined code', () => {
      const result = getErrorTitle(undefined);
      expect(result).toBe('Something went wrong');
    });

    it('returns default title for empty string code', () => {
      const result = getErrorTitle('');
      expect(result).toBe('Something went wrong');
    });

    it('handles case sensitivity correctly', () => {
      const result = getErrorTitle('city_not_found');
      expect(result).toBe('Something went wrong');
    });
  });

  describe('getErrorIcon', () => {
    it('returns RefreshCw icon for NETWORK_ERROR', () => {
      const result = getErrorIcon('NETWORK_ERROR');
      const { container } = render(result);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4', 'text-red-500');
    });

    it('returns AlertCircle icon for CITY_NOT_FOUND error', () => {
      const result = getErrorIcon('CITY_NOT_FOUND');
      const { container } = render(result);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4', 'text-red-500');
    });

    it('returns AlertCircle icon for RATE_LIMIT error', () => {
      const result = getErrorIcon('RATE_LIMIT');
      const { container } = render(result);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4', 'text-red-500');
    });

    it('returns AlertCircle icon for INVALID_INPUT error', () => {
      const result = getErrorIcon('INVALID_INPUT');
      const { container } = render(result);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4', 'text-red-500');
    });

    it('returns default AlertCircle icon for unknown error code', () => {
      const result = getErrorIcon('UNKNOWN_ERROR');
      const { container } = render(result);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4', 'text-red-500');
    });

    it('returns default AlertCircle icon when no code is provided', () => {
      const result = getErrorIcon();
      const { container } = render(result);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4', 'text-red-500');
    });

    it('returns default AlertCircle icon for undefined code', () => {
      const result = getErrorIcon(undefined);
      const { container } = render(result);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4', 'text-red-500');
    });

    it('returns default AlertCircle icon for empty string code', () => {
      const result = getErrorIcon('');
      const { container } = render(result);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4', 'text-red-500');
    });

    it('handles case sensitivity correctly', () => {
      const result = getErrorIcon('network_error');
      const { container } = render(result);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4', 'text-red-500');
    });

    it('returns valid JSX element', () => {
      const result = getErrorIcon('NETWORK_ERROR');
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
      expect(result.props).toBeDefined();
    });

    it('icon components have correct props structure', () => {
      const networkResult = getErrorIcon('NETWORK_ERROR');
      const defaultResult = getErrorIcon('OTHER');

      expect(networkResult.props.className).toBe('h-4 w-4 text-red-500');
      expect(defaultResult.props.className).toBe('h-4 w-4 text-red-500');
    });
  });

  describe('Integration tests', () => {
    it('getErrorTitle and getErrorIcon work together for all error codes', () => {
      const errorCodes = [
        'CITY_NOT_FOUND',
        'NETWORK_ERROR',
        'RATE_LIMIT',
        'INVALID_INPUT',
        'UNKNOWN_ERROR',
      ];

      errorCodes.forEach(code => {
        const title = getErrorTitle(code);
        const icon = getErrorIcon(code);

        expect(title).toBeDefined();
        expect(typeof title).toBe('string');
        expect(title.length).toBeGreaterThan(0);

        expect(icon).toBeDefined();
        expect(icon.type).toBeDefined();
        expect(icon.props.className).toBe('h-4 w-4 text-red-500');
      });
    });

    it('handles null and undefined consistently', () => {
      const codes = [null, undefined, ''];

      codes.forEach(code => {
        const title = getErrorTitle(code as string | undefined);
        const icon = getErrorIcon(code as string | undefined);

        expect(title).toBe('Something went wrong');
        expect(icon.props.className).toBe('h-4 w-4 text-red-500');
      });
    });
  });
});
