import { describe, expect, test, vi } from 'vitest';

// Mock the logger to track output
vi.mock('../logger.ts');
import { error as mockLoggerError } from '../logger.ts';

// Import the code to test
import { error } from './error.ts';

// A basic error to test with
const mockClientError = new Error('This is a test error');

describe('on(error)', () => {
	test('logs client errors', async () => {
		await error.execute(mockClientError);
		expect(mockLoggerError).toHaveBeenCalledWith(
			expect.stringContaining('client error'),
			mockClientError
		);
	});
});
