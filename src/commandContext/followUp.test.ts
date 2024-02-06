import type { RepliableInteraction } from 'discord.js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('../helpers/actions/messages/replyToMessage.js');
import { sendMessageInChannel } from '../helpers/actions/messages/replyToMessage.js';
const mockSendMessageInChannel = sendMessageInChannel as Mock;

// Mock the logger to track output
vi.mock('../logger.js');
import { error as mockLoggerError } from '../logger.js';

import { followUpFactory as factory } from './followUp.js';

describe('follow-up message', () => {
	const testMessage = { id: 'test-message' };
	const mockInteractionFollowUp = vi.fn();

	beforeEach(() => {
		mockSendMessageInChannel.mockResolvedValue(testMessage);
		mockInteractionFollowUp.mockResolvedValue(testMessage);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	const interaction = {
		channel: {
			id: 'user-id-1234',
			isTextBased: () => true,
		},
		followUp: mockInteractionFollowUp,
	} as unknown as RepliableInteraction;

	const followUp = factory(interaction);

	test('sends a followup message to the interaction', async () => {
		await expect(followUp('yo')).resolves.toBe(testMessage);
		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockSendMessageInChannel).not.toHaveBeenCalled();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith('yo');
	});

	test('logs an error if the follow-up fails', async () => {
		const testError = new Error('This is a test');
		mockInteractionFollowUp.mockRejectedValueOnce(testError);
		await expect(followUp('yo')).resolves.toBe(false);
		expect(mockSendMessageInChannel).not.toHaveBeenCalled();
		expect(mockLoggerError).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('follow up'), testError);
	});

	test("uses Discord's default if reply is not specified", async () => {
		await expect(followUp({ content: 'yo' })).resolves.toBe(testMessage);
		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockSendMessageInChannel).not.toHaveBeenCalled();
		expect(mockInteractionFollowUp).toHaveBeenCalledOnce();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({ content: 'yo' });
	});

	test('logs an error if the follow-up with options fails', async () => {
		const testError = new Error('This is a test');
		mockInteractionFollowUp.mockRejectedValueOnce(testError);
		await expect(followUp({ content: 'yo' })).resolves.toBe(false);
		expect(mockSendMessageInChannel).not.toHaveBeenCalled();
		expect(mockLoggerError).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('follow up'), testError);
	});

	test("uses Discord's default if reply is enabled", async () => {
		await expect(followUp({ content: 'yo', reply: true })).resolves.toBe(testMessage);
		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockSendMessageInChannel).not.toHaveBeenCalled();
		expect(mockInteractionFollowUp).toHaveBeenCalledOnce();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({ content: 'yo' });
	});

	test('sends a plain message in the original channel if reply is disabled', async () => {
		await expect(followUp({ content: 'yo', reply: false })).resolves.toBe(testMessage);
		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockInteractionFollowUp).not.toHaveBeenCalled();
		expect(mockSendMessageInChannel).toHaveBeenCalledOnce();
		expect(mockSendMessageInChannel).toHaveBeenCalledWith(interaction.channel, {
			content: 'yo',
		});
	});

	test('returns false if the plain message fallback failed', async () => {
		mockSendMessageInChannel.mockResolvedValueOnce(null);
		await expect(followUp({ content: 'yo', reply: false })).resolves.toBe(false);
		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockInteractionFollowUp).not.toHaveBeenCalled();
		expect(mockSendMessageInChannel).toHaveBeenCalledOnce();
		expect(mockSendMessageInChannel).toHaveBeenCalledWith(interaction.channel, {
			content: 'yo',
		});
	});
});
