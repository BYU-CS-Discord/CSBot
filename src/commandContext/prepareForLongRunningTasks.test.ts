import type { CommandInteraction } from 'discord.js';

// Mock the logger to track output
jest.mock('../logger');
import { error as mockLoggerError } from '../logger';

import { prepareForLongRunningTasksFactory as factory } from './prepareForLongRunningTasks';

describe('prepareForLongRunningTasks', () => {
	const mockInteractionDeferReply = jest.fn();

	const interaction = {
		deferReply: mockInteractionDeferReply,
	} as unknown as CommandInteraction;

	const prepareForLongRunningTasks = factory(interaction);

	test('requests interaction deferrment', async () => {
		await expect(prepareForLongRunningTasks()).resolves.toBeUndefined();

		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockInteractionDeferReply).toHaveBeenCalledOnce();
		expect(mockInteractionDeferReply).toHaveBeenCalledWith({ ephemeral: undefined });
	});

	test('requests ephemeral interaction deferrment', async () => {
		await expect(prepareForLongRunningTasks(true)).resolves.toBeUndefined();

		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockInteractionDeferReply).toHaveBeenCalledOnce();
		expect(mockInteractionDeferReply).toHaveBeenCalledWith({ ephemeral: true });
	});

	test('logs an error if deferrment fails', async () => {
		const testError = new Error('this is a test');
		mockInteractionDeferReply.mockRejectedValueOnce(testError);
		await expect(prepareForLongRunningTasks()).resolves.toBeUndefined();

		expect(mockInteractionDeferReply).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledAfter(mockInteractionDeferReply);
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('defer reply'), testError);
	});
});
