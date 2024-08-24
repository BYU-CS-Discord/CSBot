import { describe, expect, test, vi } from 'vitest';

import type { RepliableInteraction } from 'discord.js';

// Mock the logger to track output
vi.mock('../logger.js');
import { error as mockLoggerError } from '../logger.js';

import { replyFactory as factory } from './reply.js';

describe('public reply', () => {
	const mockInteractionReply = vi.fn<RepliableInteraction['reply']>();

	const interaction = {
		user: { id: 'user-id-1234' },
		reply: mockInteractionReply,
	} as unknown as RepliableInteraction;

	const reply = factory(interaction);

	test('sends public reply to interaction with text', async () => {
		await reply('yo');
		expect(mockInteractionReply).toHaveBeenCalledWith('yo');
	});

	test('sends an ephemeral reply to the interaction', async () => {
		await reply({ content: 'yo in secret', ephemeral: true });
		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: 'yo in secret',
			ephemeral: true,
		});
	});

	test('trusts that discord.js defaults to mentioning the other user', async () => {
		await reply({ content: 'yo', shouldMention: true });
		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockInteractionReply).toHaveBeenCalledWith({ content: 'yo' });
	});

	test('requests that the other user not be mentioned', async () => {
		await reply({ content: 'yo', shouldMention: false });
		expect(mockLoggerError).not.toHaveBeenCalled();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: 'yo',
			allowedMentions: { users: [], repliedUser: false },
		});
	});

	test('logs an error if the interaction fails', async () => {
		const testError = new Error('This is a test');
		mockInteractionReply.mockRejectedValueOnce(testError);
		await reply('yo');
		expect(mockLoggerError).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledWith(
			expect.stringContaining('reply to interaction'),
			testError
		);
	});
});
