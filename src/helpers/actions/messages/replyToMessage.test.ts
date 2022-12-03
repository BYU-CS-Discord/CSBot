import type { CommandInteraction, Message, TextChannel, User } from 'discord.js';

// Mock the logger to track output
jest.mock('../../../logger');
import { error as mockLoggerError } from '../../../logger';

import { replyWithPrivateMessage, sendMessageInChannel } from './replyToMessage';

describe('Replies', () => {
	const mockUserSend = jest.fn();

	describe('to interactions', () => {
		const mockReply = jest.fn();
		let interaction: CommandInteraction;

		beforeEach(() => {
			mockReply.mockResolvedValue({});
			mockUserSend.mockResolvedValue({});
			interaction = {
				user: {
					id: 'user-1234',
					send: mockUserSend,
				},
				channel: {
					id: 'channel-1234',
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

		describe('in DMs', () => {
			test('sends text DM to user with return prompt', async () => {
				const content = 'yo';
				await expect(replyWithPrivateMessage(interaction, content, true)).resolves.toBeObject();
				expect(mockReply).not.toHaveBeenCalled();
				expect(mockUserSend).toHaveBeenCalledOnce();
				expect(mockUserSend).toHaveBeenCalledWith(`(Reply from <#channel-1234>)\n${content}`);
			});

			test('sends object DM to user with return prompt', async () => {
				const options = { content: 'yo' };
				await expect(replyWithPrivateMessage(interaction, options, true)).resolves.toBeObject();
				expect(mockReply).not.toHaveBeenCalled();
				expect(mockUserSend).toHaveBeenCalledOnce();
				expect(mockUserSend).toHaveBeenCalledWith({
					content: `(Reply from <#channel-1234>)\n${options.content}`,
				});
			});

			test('informs the user if the text DM failed', async () => {
				const error = new Error('This is a test');
				mockUserSend.mockRejectedValueOnce(error);

				const content = 'yo';
				await expect(replyWithPrivateMessage(interaction, content, true)).resolves.toBeTrue();
				expect(mockUserSend).toHaveBeenCalledOnce();
				expect(mockUserSend).toHaveBeenCalledWith(`(Reply from <#channel-1234>)\n${content}`);
				expect(mockReply).toHaveBeenCalledOnce();
				expect(mockReply).toHaveBeenCalledWith({
					content: expect.stringContaining('tried to DM you') as string,
					ephemeral: true,
				});
			});

			test('informs the user if the object DM failed', async () => {
				const error = new Error('This is a test');
				mockUserSend.mockRejectedValueOnce(error);

				const options = { content: 'yo' };
				await expect(replyWithPrivateMessage(interaction, options, true)).resolves.toBeTrue();
				expect(mockUserSend).toHaveBeenCalledOnce();
				expect(mockUserSend).toHaveBeenCalledWith({
					content: `(Reply from <#channel-1234>)\n${options.content}`,
				});
				expect(mockReply).toHaveBeenCalledOnce();
				expect(mockReply).toHaveBeenCalledWith({
					content: expect.stringContaining('tried to DM you') as string,
					ephemeral: true,
				});
			});
		});
	});

	describe('to messages', () => {
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

describe('Cold calls', () => {
	const mockChannelSend = jest.fn().mockResolvedValue({ id: 'the-message' });
	const mockChannel = {
		send: mockChannelSend,
	} as unknown as TextChannel;

	test('sends a message in the given channel', async () => {
		await expect(sendMessageInChannel(mockChannel, 'yo')).resolves.toBeObject();
		expect(mockChannelSend).toHaveBeenCalledOnce();
		expect(mockChannelSend).toHaveBeenCalledWith('yo');
		expect(mockLoggerError).not.toHaveBeenCalled();
	});

	test('logs an error and returns null if the send fails', async () => {
		const error = new Error('This is a test');
		mockChannelSend.mockRejectedValueOnce(error);
		await expect(sendMessageInChannel(mockChannel, 'yo')).resolves.toBeNull();
		expect(mockChannelSend).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('send message'), error);
	});
});
