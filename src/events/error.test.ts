// Mock the logger to track error output
jest.mock('../logger');
import { getLogger } from '../logger';
const mockGetLogger = getLogger as jest.Mock;
const mockConsoleError = jest.fn();
mockGetLogger.mockImplementation(() => {
	return {
		error: mockConsoleError,
	} as unknown as Console;
});

// Import the code to test
import { error } from './error';

// A basic error to test with
const mockClientError = new Error('This is a test error');

describe('on(error)', () => {
	test('logs client errors', () => {
		expect(error.execute(mockClientError)).toBeUndefined();
		expect(mockConsoleError).toHaveBeenCalledWith(
			expect.stringContaining('client error'),
			mockClientError
		);
	});
});
