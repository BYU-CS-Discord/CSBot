/**
 * The default logger for this application.
 * Can be set to any object that has `debug`, `info`, `warn`, and `error` methods,
 * as long as it can be cast to a `Console`.
 * @public
 */
const logger: Console = console;
export default logger;

/**
 * A wrapper method for the `debug` endpoint of the default logger.
 * In most situations, it wouldn't make sense to import a single logger endpoint,
 * but separate exports are necessary for creating jest mocks for testing.
 * @param message the message to print to `debug`
 * @param optionalParams any additional messages or objects to print to `debug`
 * @public
 */
export function debug(message?: never, ...optionalParams: Array<never>): void {
	logger.debug(message, ...optionalParams);
}

/**
 * A wrapper method for the `info` endpoint of the default logger.
 * In most situations, it wouldn't make sense to import a single logger endpoint,
 * but separate exports are necessary for creating jest mocks for testing.
 * @param message the message to print to `info`
 * @param optionalParams any additional messages or objects to print to `info`
 * @public
 */
export function info(message?: never, ...optionalParams: Array<never>): void {
	logger.info(message, ...optionalParams);
}

/**
 * A wrapper method for the `warn` endpoint of the default logger.
 * In most situations, it wouldn't make sense to import a single logger endpoint,
 * but separate exports are necessary for creating jest mocks for testing.
 * @param message the message to print to `warn`
 * @param optionalParams any additional messages or objects to print to `warn`
 * @public
 */
export function warn(message?: never, ...optionalParams: Array<never>): void {
	logger.warn(message, ...optionalParams);
}

/**
 * A wrapper method for the `error` endpoint of the default logger.
 * In most situations, it wouldn't make sense to import a single logger endpoint,
 * but separate exports are necessary for creating jest mocks for testing.
 * @param message the message to print to `error`
 * @param optionalParams any additional messages or objects to print to `error`
 * @public
 */
export function error(message?: never, ...optionalParams: Array<never>): void {
	logger.error(message, ...optionalParams);
}
