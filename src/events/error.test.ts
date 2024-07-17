import { describe, expect, test, vi } from 'vitest';

// Mock the logger to track output
vi.mock('../logger.js');
import { error as mockLoggerError } from '../logger.js';

// Import the code to test
import { error } from './error.js';

// A basic error to test with
const mockClientError = new Error('This is a test error');

describe('on(error)', () => {
	test('logs client errors', () => {
		error.execute(mockClientError);
		expect(mockLoggerError).toHaveBeenCalledWith(
			expect.stringContaining('client error'),
			mockClientError
		);
	});
});
