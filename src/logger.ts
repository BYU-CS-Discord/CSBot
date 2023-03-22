/**
 * The default logger for this application. Set to the console for now.
 * Should not be accessed outside this logger file - instead, use the endpoint methods.
 * The goal is to define our own interface to separate usage from implementation.
 * To import the entire logger with all endpoints, use `import * as logger from './logger';`
 * If you add any more endpoints to this file, remember to mock them in './\_\_mocks\_\_/logger.ts'
 * @private
 */
const logger: Console = console;

/**
 * The logger endpoint for `debug` logging
 * @param message the message to print to `debug`
 * @param optionalParams any additional messages or objects to print to `debug`
 * @public
 */
export function debug(message?: unknown, ...optionalParams: ReadonlyArray<unknown>): void {
	logger.debug(message, ...optionalParams);
}

/**
 * The logger endpoint for `info` logging
 * @param message the message to print to `info`
 * @param optionalParams any additional messages or objects to print to `info`
 * @public
 */
export function info(message?: unknown, ...optionalParams: ReadonlyArray<unknown>): void {
	logger.info(message, ...optionalParams);
}

/**
 * The logger endpoint for `warn` logging
 * @param message the message to print to `warn`
 * @param optionalParams any additional messages or objects to print to `warn`
 * @public
 */
export function warn(message?: unknown, ...optionalParams: ReadonlyArray<unknown>): void {
	logger.warn(message, ...optionalParams);
}

/**
 * The logger endpoint for `error` logging
 * @param message the message to print to `error`
 * @param optionalParams any additional messages or objects to print to `error`
 * @public
 */
export function error(message?: unknown, ...optionalParams: ReadonlyArray<unknown>): void {
	logger.error(message, ...optionalParams);
}
