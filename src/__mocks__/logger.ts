import { vi } from 'vitest';

import type * as logger from '../logger.js';

/**
 * The mock function serving as the `debug` method of the logger.
 * @public
 */
export const debug = vi.fn<typeof logger.debug>();

/**
 * The mock function serving as the `info` method of the logger.
 * @public
 */
export const info = vi.fn<typeof logger.info>();

/**
 * The mock function serving as the `warn` method of the logger.
 * @public
 */
export const warn = vi.fn<typeof logger.warn>();

/**
 * The mock function serving as the `error` method of the logger.
 * @public
 */
export const error = vi.fn<typeof logger.error>();
