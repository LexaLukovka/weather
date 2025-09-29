import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  retryWithBackoff,
  withRetry,
  CircuitBreaker,
  type RetryOptions,
} from '../retry';

describe('retry utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('retryWithBackoff', () => {
    it('returns result on first successful attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and succeeds on second attempt', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('throws final error after max attempts reached', async () => {
      const error = new Error('Persistent failure');
      const mockFn = vi.fn().mockRejectedValue(error);

      const promise = retryWithBackoff(mockFn, { maxAttempts: 2 });

      // Fast-forward through all delays and wait for the promise
      const [result] = await Promise.allSettled([
        promise,
        vi.runAllTimersAsync(),
      ]);

      expect(result.status).toBe('rejected');
      if (result.status === 'rejected') {
        expect(result.reason).toEqual(error);
      }
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('respects custom retry options', async () => {
      const error = new Error('Failure');
      const mockFn = vi.fn().mockRejectedValue(error);
      const options: RetryOptions = {
        maxAttempts: 3,
        baseDelay: 500,
        backoffFactor: 1.5,
      };

      const promise = retryWithBackoff(mockFn, options);

      // Fast-forward through all delays and wait for the promise
      const [result] = await Promise.allSettled([
        promise,
        vi.runAllTimersAsync(),
      ]);

      expect(result.status).toBe('rejected');
      if (result.status === 'rejected') {
        expect(result.reason).toEqual(error);
      }
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('respects maxDelay limit', async () => {
      const error = new Error('Failure');
      const mockFn = vi.fn().mockRejectedValue(error);
      const options: RetryOptions = {
        maxAttempts: 5,
        baseDelay: 1000,
        maxDelay: 2000,
        backoffFactor: 3,
      };

      const promise = retryWithBackoff(mockFn, options);

      // Fast-forward through all delays and wait for the promise
      const [result] = await Promise.allSettled([
        promise,
        vi.runAllTimersAsync(),
      ]);

      expect(result.status).toBe('rejected');
      if (result.status === 'rejected') {
        expect(result.reason).toEqual(error);
      }
      expect(mockFn).toHaveBeenCalledTimes(5);
    });

    it('uses custom shouldRetry function', async () => {
      const error1 = { statusCode: 500 };
      const error2 = { statusCode: 400 };
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2);

      const options: RetryOptions = {
        shouldRetry: (error: unknown) => {
          if (error && typeof error === 'object' && 'statusCode' in error) {
            return (error as { statusCode: number }).statusCode >= 500;
          }
          return false;
        },
      };

      const promise = retryWithBackoff(mockFn, options);

      // Fast-forward through all delays and wait for the promise
      const [result] = await Promise.allSettled([
        promise,
        vi.runAllTimersAsync(),
      ]);

      expect(result.status).toBe('rejected');
      if (result.status === 'rejected') {
        expect(result.reason).toEqual(error2);
      }
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('handles 429 rate limiting errors', async () => {
      const error = { statusCode: 429 };
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);
      await vi.runAllTimersAsync();

      const result = await promise;
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('does not retry 400 level errors (except 429)', async () => {
      const error = { statusCode: 404 };
      const mockFn = vi.fn().mockRejectedValue(error);
      const promise = retryWithBackoff(mockFn);

      try {
        await promise;
        expect.fail('Promise should have rejected');
      } catch (err) {
        expect(err).toEqual(error);
        expect(mockFn).toHaveBeenCalledTimes(1);
      }
    });

    it('adds jitter to delays', async () => {
      const error = new Error('Failure');
      const mockFn = vi.fn().mockRejectedValue(error);

      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0.5);

      const promise = retryWithBackoff(mockFn, { maxAttempts: 2 });

      // Fast-forward through all delays and wait for the promise
      const [result] = await Promise.allSettled([
        promise,
        vi.runAllTimersAsync(),
      ]);

      expect(result.status).toBe('rejected');
      if (result.status === 'rejected') {
        expect(result.reason).toEqual(error);
      }

      Math.random = originalRandom;
    });

    it('logs retry attempts in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        // Mock implementation for testing
      });
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);
      await vi.runAllTimersAsync();
      await promise;

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('withRetry', () => {
    it('creates a retry wrapper function', async () => {
      const originalFn = vi.fn().mockResolvedValue('success');
      const wrappedFn = withRetry(originalFn);

      const result = await wrappedFn('arg1', 'arg2');

      expect(result).toBe('success');
      expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('passes through arguments correctly', async () => {
      const originalFn = vi.fn().mockResolvedValue('success');
      const wrappedFn = withRetry(originalFn);

      await wrappedFn('test', 123, { key: 'value' });

      expect(originalFn).toHaveBeenCalledWith('test', 123, { key: 'value' });
    });

    it('retries wrapped function on failure', async () => {
      const originalFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('success');
      const wrappedFn = withRetry(originalFn, { maxAttempts: 2 });

      const promise = wrappedFn();
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(originalFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('CircuitBreaker', () => {
    it('allows calls when circuit is closed', async () => {
      const circuitBreaker = new CircuitBreaker(3, 1000);
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await circuitBreaker.call(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('opens circuit after failure threshold is reached', async () => {
      const circuitBreaker = new CircuitBreaker(2, 1000);
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'));

      await expect(circuitBreaker.call(mockFn)).rejects.toThrow('Failure');
      await expect(circuitBreaker.call(mockFn)).rejects.toThrow('Failure');

      await expect(circuitBreaker.call(mockFn)).rejects.toThrow(
        'Circuit breaker is OPEN'
      );

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('transitions to half-open after reset timeout', async () => {
      const circuitBreaker = new CircuitBreaker(1, 1000);
      const mockFn = vi.fn().mockRejectedValue(new Error('Failure'));

      await expect(circuitBreaker.call(mockFn)).rejects.toThrow('Failure');
      await expect(circuitBreaker.call(mockFn)).rejects.toThrow(
        'Circuit breaker is OPEN'
      );

      vi.advanceTimersByTime(1001);
      const successFn = vi.fn().mockResolvedValue('success');
      const result = await circuitBreaker.call(successFn);

      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('closes circuit on successful call in half-open state', async () => {
      const circuitBreaker = new CircuitBreaker(1, 1000);
      const failFn = vi.fn().mockRejectedValue(new Error('Failure'));
      const successFn = vi.fn().mockResolvedValue('success');
      await expect(circuitBreaker.call(failFn)).rejects.toThrow('Failure');

      vi.advanceTimersByTime(1001);

      await circuitBreaker.call(successFn);
      await circuitBreaker.call(successFn);

      expect(successFn).toHaveBeenCalledTimes(2);
    });

    it('resets failure count on successful call', async () => {
      const circuitBreaker = new CircuitBreaker(3, 1000);
      const failFn = vi.fn().mockRejectedValue(new Error('Failure'));
      const successFn = vi.fn().mockResolvedValue('success');

      await expect(circuitBreaker.call(failFn)).rejects.toThrow('Failure');
      await expect(circuitBreaker.call(failFn)).rejects.toThrow('Failure');

      await circuitBreaker.call(successFn);

      await expect(circuitBreaker.call(failFn)).rejects.toThrow('Failure');
      await expect(circuitBreaker.call(failFn)).rejects.toThrow('Failure');
      await expect(circuitBreaker.call(failFn)).rejects.toThrow('Failure');
      await expect(circuitBreaker.call(failFn)).rejects.toThrow(
        'Circuit breaker is OPEN'
      );
    });

    it('works with custom failure threshold and reset timeout', async () => {
      const circuitBreaker = new CircuitBreaker(5, 5000);
      const failFn = vi.fn().mockRejectedValue(new Error('Failure'));

      for (let i = 0; i < 5; i++) {
        await expect(circuitBreaker.call(failFn)).rejects.toThrow('Failure');
      }

      await expect(circuitBreaker.call(failFn)).rejects.toThrow(
        'Circuit breaker is OPEN'
      );

      vi.advanceTimersByTime(4999);
      await expect(circuitBreaker.call(failFn)).rejects.toThrow(
        'Circuit breaker is OPEN'
      );

      vi.advanceTimersByTime(2);
      const successFn = vi.fn().mockResolvedValue('success');
      await circuitBreaker.call(successFn);

      expect(failFn).toHaveBeenCalledTimes(5);
      expect(successFn).toHaveBeenCalledTimes(1);
    });
  });
});
