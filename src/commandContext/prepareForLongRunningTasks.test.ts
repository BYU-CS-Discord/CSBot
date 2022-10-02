import type { CommandInteraction } from 'discord.js';

jest.mock('../logger');
import { getLogger } from '../logger';
const mockGetLogger = getLogger as jest.Mock;
const mockConsoleError = jest.fn();
mockGetLogger.mockImplementation(() => {
	return {
		error: mockConsoleError,
	} as unknown as Console;
});

import { prepareForLongRunningTasksFactory as factory } from './prepareForLongRunningTasks';

describe('prepareForLongRunningTasks', () => {
	const mockInteractionDeferReply = jest.fn();

	const interaction = {
		deferReply: mockInteractionDeferReply,
	} as unknown as CommandInteraction;

	const prepareForLongRunningTasks = factory(interaction);

	test('requests interaction deferrment', async () => {
		await expect(prepareForLongRunningTasks()).resolves.toBeUndefined();

		expect(mockConsoleError).not.toHaveBeenCalled();
		expect(mockInteractionDeferReply).toHaveBeenCalledOnce();
		expect(mockInteractionDeferReply).toHaveBeenCalledWith({ ephemeral: undefined });
	});

	test('requests ephemeral interaction deferrment', async () => {
		await expect(prepareForLongRunningTasks(true)).resolves.toBeUndefined();

		expect(mockConsoleError).not.toHaveBeenCalled();
		expect(mockInteractionDeferReply).toHaveBeenCalledOnce();
		expect(mockInteractionDeferReply).toHaveBeenCalledWith({ ephemeral: true });
	});

	test('logs an error if deferrment fails', async () => {
		const testError = new Error('this is a test');
		mockInteractionDeferReply.mockRejectedValueOnce(testError);
		await expect(prepareForLongRunningTasks()).resolves.toBeUndefined();

		expect(mockInteractionDeferReply).toHaveBeenCalledOnce();
		expect(mockConsoleError).toHaveBeenCalledOnce();
		expect(mockConsoleError).toHaveBeenCalledAfter(mockInteractionDeferReply);
		expect(mockConsoleError).toHaveBeenCalledWith(
			expect.stringContaining('defer reply'),
			testError
		);
	});
});
