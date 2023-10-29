import { describe, expect, test, vi } from 'vitest';

// Mock the logger to track output
vi.mock('../logger');
import { error as mockLoggerError } from '../logger';

// Import the code to test
import { error } from './error';

// A basic error to test with
const mockClientError = new Error('This is a test error');

describe('on(error)', () => {
	test('logs client errors', () => {
		expect(error.execute(mockClientError)).toBeUndefined();
		expect(mockLoggerError).toHaveBeenCalledWith(
			expect.stringContaining('client error'),
			mockClientError
		);
	});
});
