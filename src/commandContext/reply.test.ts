import type { CommandInteraction } from 'discord.js';
import { replyFactory as factory } from './reply';

describe('public reply', () => {
	const mockInteractionReply = jest.fn();
	const mockConsoleInfo = jest.fn();
	const mockConsoleError = jest.fn();

	const mockConsole = {
		info: mockConsoleInfo,
		error: mockConsoleError,
	} as unknown as Console;

	const interaction = {
		user: { id: 'user-id-1234' },
		reply: mockInteractionReply,
	} as unknown as CommandInteraction;

	const reply = factory(interaction, mockConsole);

	test('sends public reply to interaction with text', async () => {
		await expect(reply('yo')).resolves.toBeUndefined();
		expect(mockInteractionReply).toHaveBeenCalledWith('yo');
	});

	test('sends an ephemeral reply to the interaction', async () => {
		await expect(reply({ content: 'yo in secret', ephemeral: true })).resolves.toBeUndefined();
		expect(mockConsoleError).not.toHaveBeenCalled();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: 'yo in secret',
			ephemeral: true,
		});
	});

	test('trusts that discord.js defaults to mentioning the other user', async () => {
		await expect(reply({ content: 'yo', shouldMention: true })).resolves.toBeUndefined();
		expect(mockConsoleError).not.toHaveBeenCalled();
		expect(mockInteractionReply).toHaveBeenCalledWith({ content: 'yo' });
	});

	test('requests that the other user not be mentioned', async () => {
		await expect(reply({ content: 'yo', shouldMention: false })).resolves.toBeUndefined();
		expect(mockConsoleError).not.toHaveBeenCalled();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: 'yo',
			allowedMentions: { users: [], repliedUser: false },
		});
	});

	test('logs an error if the interaction fails', async () => {
		const testError = new Error('This is a test');
		mockInteractionReply.mockRejectedValueOnce(testError);
		await expect(reply('yo')).resolves.toBeUndefined();
		expect(mockConsoleError).toHaveBeenCalledOnce();
		expect(mockConsoleError).toHaveBeenCalledWith(
			expect.stringContaining('reply to interaction'),
			testError
		);
	});
});
