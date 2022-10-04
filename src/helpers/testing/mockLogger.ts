/**
 * Import this file from test scripts to mock the default logger.
 * To simply overwrite the default logger to prevent output, use
 * `import {} from './testing/mockLogger';`
 * If you wish to monitor the usage of one of the endpoints, you can import
 * the specific endpoints you want. For example, if you wish to track error output, use
 * `import { error as mockErrorLogger } from './testing/mockLogger';`
 * `expect(mockLoggerWarn).toHaveBeenCalledWith('warn');`
 */

jest.mock('../../logger');
import { getLogger } from '../../logger';
const mockGetLogger = getLogger as jest.Mock;

const mockLogger = {
	debug: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
} as unknown as Console;
mockGetLogger.mockImplementation(() => mockLogger);

/**
 * The entire mocked Logger, with every endpoint as a jest Mock for output tracking purposes.
 * Only import from test scripts.
 */
export default mockLogger;

/**
 * The jest Mock serving as the 'debug' endpoint of the logger.
 * Only import from test scripts.
 */
export const debug = mockLogger.debug;

/**
 * The jest Mock serving as the 'info' endpoint of the logger.
 * Only import from test scripts.
 */
export const info = mockLogger.info;

/**
 * The jest Mock serving as the 'warn' endpoint of the logger.
 * Only import from test scripts.
 */
export const warn = mockLogger.warn;

/**
 * The jest Mock serving as the 'error' endpoint of the logger.
 * Only import from test scripts.
 */
export const error = mockLogger.error;
