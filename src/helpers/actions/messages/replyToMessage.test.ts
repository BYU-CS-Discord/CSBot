import type { CommandInteraction, Message, User } from 'discord.js';

// Mock the logger so nothing is printed
import '../../testing/mockLogger';

import { replyWithPrivateMessage } from './replyToMessage';

describe('Message replies', () => {
	const mockUserSend = jest.fn().mockResolvedValue({});

	describe('interaction replies', () => {
		const mockReply = jest.fn();
		let interaction: CommandInteraction;

		beforeEach(() => {
			interaction = {
				user: {
					id: 'user-1234',
				},
				reply: mockReply,
			} as unknown as CommandInteraction;
		});

		test('sends an ephemeral reply with text', async () => {
			const content = 'yo';
			await expect(replyWithPrivateMessage(interaction, content, false)).resolves.toBeTrue();
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith({ content, ephemeral: true });
		});

		test('returns false when an ephemeral reply with text fails', async () => {
			mockReply.mockRejectedValueOnce(new Error('This is a test'));
			const content = 'yo';
			await expect(replyWithPrivateMessage(interaction, content, false)).resolves.toBeFalse();
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith({ content, ephemeral: true });
		});

		test('sends an ephemeral reply with options', async () => {
			const content = 'yo';
			await expect(replyWithPrivateMessage(interaction, { content }, false)).resolves.toBeTrue();
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith({ content, ephemeral: true });
		});

		test('returns false when an ephemeral reply with options fails', async () => {
			mockReply.mockRejectedValueOnce(new Error('This is a test'));
			const content = 'yo';
			await expect(replyWithPrivateMessage(interaction, { content }, false)).resolves.toBeFalse();
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith({ content, ephemeral: true });
		});
	});

	describe('message replies', () => {
		const mockReply = jest.fn();
		const mockChannelSend = jest.fn();
		let author: User;
		let message: Message;

		beforeEach(() => {
			author = {
				id: 'user-1234',
				send: mockUserSend,
			} as unknown as User;
			message = {
				author,
				channel: {
					id: 'the-channel-1234',
					send: mockChannelSend,
				},
				reply: mockReply,
			} as unknown as Message;
		});

		test('sends a DM with a return prefix from text', async () => {
			const content = 'yo';
			await expect(replyWithPrivateMessage(message, content, true)).resolves.toBeTruthy();
			expect(mockReply).not.toHaveBeenCalled();
			expect(mockChannelSend).not.toHaveBeenCalled();
			expect(mockUserSend).toHaveBeenCalledOnce();
			expect(mockUserSend).toHaveBeenCalledWith(
				`(Reply from <#${message.channel.id}>)\n${content}`
			);
		});

		test('sends a DM with a return prefix from missing text', async () => {
			await expect(
				replyWithPrivateMessage(message, { content: undefined }, true)
			).resolves.toBeTruthy();
			expect(mockReply).not.toHaveBeenCalled();
			expect(mockChannelSend).not.toHaveBeenCalled();
			expect(mockUserSend).toHaveBeenCalledOnce();
			expect(mockUserSend).toHaveBeenCalledWith({
				content: `(Reply from <#${message.channel.id}>)\n`,
			});
		});

		test('sends a DM with a return prefix from options', async () => {
			const content = 'yo';
			await expect(replyWithPrivateMessage(message, { content }, true)).resolves.toBeTruthy();
			expect(mockReply).not.toHaveBeenCalled();
			expect(mockChannelSend).not.toHaveBeenCalled();
			expect(mockUserSend).toHaveBeenCalledOnce();
			expect(mockUserSend).toHaveBeenCalledWith({
				content: `(Reply from <#${message.channel.id}>)\n${content}`,
			});
		});

		test('informs the user when DMs failed', async () => {
			mockUserSend.mockRejectedValueOnce(new Error('This is a test'));
			const content = 'yo';
			await expect(replyWithPrivateMessage(message, content, true)).resolves.toBeFalse();
			expect(mockReply).not.toHaveBeenCalled();
			expect(mockUserSend).toHaveBeenCalledOnce();
			expect(mockUserSend).toHaveBeenCalledWith(
				`(Reply from <#${message.channel.id}>)\n${content}`
			);
			expect(mockChannelSend).toHaveBeenCalledOnce();
			expect(mockChannelSend).toHaveBeenCalledWith(expect.stringContaining('tried to DM you'));
		});
	});
});
