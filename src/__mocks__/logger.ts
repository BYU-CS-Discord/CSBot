import { vi } from 'vitest';

/**
 * The mock function serving as the `debug` method of the logger.
 * @public
 */
export const debug = vi.fn();

/**
 * The mock function serving as the `info` method of the logger.
 * @public
 */
export const info = vi.fn();

/**
 * The mock function serving as the `warn` method of the logger.
 * @public
 */
export const warn = vi.fn();

/**
 * The mock function serving as the `error` method of the logger.
 * @public
 */
export const error = vi.fn();
