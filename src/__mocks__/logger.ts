/**
 * The jest Mock serving as the `debug` endpoint of the logger.
 * @public
 */
const debug = jest.fn();
export { debug };

/**
 * The jest Mock serving as the `info` endpoint of the logger.
 * @public
 */
const info = jest.fn();
export { info };

/**
 * The jest Mock serving as the `warn` endpoint of the logger.
 * @public
 */
const warn = jest.fn();
export { warn };

/**
 * The jest Mock serving as the `error` endpoint of the logger.
 * @public
 */
const error = jest.fn();
export { error };

/**
 * The entire mocked Logger, with every endpoint as a jest Mock for output tracking purposes.
 * @public
 */
const logger = {
	debug,
	info,
	warn,
	error,
} as unknown as Console;
export default logger;
