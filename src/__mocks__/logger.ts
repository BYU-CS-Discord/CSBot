/**
 * The jest Mock serving as the `debug` endpoint of the logger.
 * @public
 */
export const debug = jest.fn();

/**
 * The jest Mock serving as the `info` endpoint of the logger.
 * @public
 */
export const info = jest.fn();

/**
 * The jest Mock serving as the `warn` endpoint of the logger.
 * @public
 */
export const warn = jest.fn();

/**
 * The jest Mock serving as the `error` endpoint of the logger.
 * @public
 */
export const error = jest.fn();

/**
 * The entire mocked logger, with every endpoint as a jest Mock for output tracking purposes.
 * @public
 */
const logger = {
	debug,
	info,
	warn,
	error,
} as unknown as Console;
export default logger;
