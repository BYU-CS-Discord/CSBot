import { afterEach, describe, expect, test, vi } from 'vitest';

import type { RepliableInteraction } from 'discord.js';

// Mock the logger to track output
vi.mock('../logger.js');
import { error as mockLoggerError } from '../logger.js';

import { prepareForLongRunningTasksFactory as factory } from './prepareForLongRunningTasks.js';

describe('prepareForLongRunningTasks', () => {
	const mockInteractionDeferReply = vi.fn();

	const interaction = {
		deferReply: mockInteractionDeferReply,
	} as unknown as RepliableInteraction;

	const prepareForLongRunningTasks = factory(interaction);

	afterEach(() => {
		vi.resetAllMocks();
	});

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
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('defer reply'), testError);
	});
});
