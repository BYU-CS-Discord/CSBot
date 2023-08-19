import type { RepliableInteraction } from 'discord.js';

// Mock the logger to track output
vi.mock('../logger');
import { error as mockLoggerError } from '../logger';

import { prepareForLongRunningTasksFactory as factory } from './prepareForLongRunningTasks';

describe('prepareForLongRunningTasks', () => {
	const mockInteractionDeferReply = vi.fn();

	const interaction = {
		deferReply: mockInteractionDeferReply,
	} as unknown as RepliableInteraction;

	const prepareForLongRunningTasks = factory(interaction);

	test('requests interaction deferrment', async () => {
		await expect(prepareForLongRunningTasks()).resolves.toBeUndefined();

		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockInteractionDeferReply).toHaveBeenCalledExactlyOnceWith({ ephemeral: undefined });
	});

	test('requests ephemeral interaction deferrment', async () => {
		await expect(prepareForLongRunningTasks(true)).resolves.toBeUndefined();

		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockInteractionDeferReply).toHaveBeenCalledExactlyOnceWith({ ephemeral: true });
	});

	test('logs an error if deferrment fails', async () => {
		const testError = new Error('this is a test');
		mockInteractionDeferReply.mockRejectedValueOnce(testError);
		await expect(prepareForLongRunningTasks()).resolves.toBeUndefined();

		expect(mockInteractionDeferReply).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledAfter(mockInteractionDeferReply);
		expect(mockLoggerError).toHaveBeenCalledExactlyOnceWith(
			expect.stringContaining('defer reply'),
			testError
		);
	});
});
