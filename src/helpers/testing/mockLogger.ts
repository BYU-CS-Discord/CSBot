/**
 * Import this file from test scripts to mock the default logger.
 * To simply overwrite the default logger to prevent output, use
 * `import './testing/mockLogger';`
 * If you wish to monitor the usage of one of the endpoints, you can import
 * the specific endpoints you want. For example, if you wish to track error output, use
 * `import { error as mockErrorLogger } from './testing/mockLogger';`
 * `expect(mockLoggerWarn).toHaveBeenCalledWith('warn');`
 */

jest.mock('../../logger');
import { getLogger } from '../../logger';
const mockGetLogger = getLogger as jest.Mock;

/**
 * The jest Mock serving as the 'debug' endpoint of the logger.
 * Only import from test scripts.
 * @public
 */
const debug = jest.fn();

/**
 * The jest Mock serving as the 'info' endpoint of the logger.
 * Only import from test scripts.
 * @public
 */
const info = jest.fn();

/**
 * The jest Mock serving as the 'warn' endpoint of the logger.
 * Only import from test scripts.
 * @public
 */
const warn = jest.fn();

/**
 * The jest Mock serving as the 'error' endpoint of the logger.
 * Only import from test scripts.
 * @public
 */
const error = jest.fn();

/**
 * The entire mocked Logger, with every endpoint as a jest Mock for output tracking purposes.
 * Only import from test scripts.
 * @public
 */
const mockLogger = {
	debug,
	info,
	warn,
	error,
} as unknown as Console;

// Set getLogger to automatically return the mocked logger
mockGetLogger.mockImplementation(() => mockLogger);

// Export mocks for test file usage
export default mockLogger;
export { debug, info, warn, error };
