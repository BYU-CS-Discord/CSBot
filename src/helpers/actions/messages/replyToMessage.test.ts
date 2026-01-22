import { beforeEach, describe, expect, test, vi } from 'vitest';

import type {
	InteractionResponse,
	Message,
	PartialTextBasedChannelFields,
	RepliableInteraction,
	TextChannel,
	User,
} from 'discord.js';
import { ChannelType } from 'discord.js';

// Mock the logger to track output
vi.mock('../../../logger.js');
import { error as mockLoggerError } from '../../../logger.js';

import { replyWithPrivateMessage, sendMessageInChannel } from './replyToMessage.js';

describe('Replies', () => {
	const mockUserSend = vi.fn<RepliableInteraction['user']['send']>();

	describe('to interactions', () => {
		const mockReply = vi.fn<RepliableInteraction['reply']>();
		let interaction: RepliableInteraction;

		beforeEach(() => {
			mockReply.mockResolvedValue({} as InteractionResponse);
			mockUserSend.mockResolvedValue({} as Message<false>);
			interaction = {
				user: {
					id: 'user-1234',
					username: 'user-1234',
					send: mockUserSend,
				},
				channel: {
					id: 'channel-1234',
				},
				reply: mockReply,
			} as unknown as RepliableInteraction;
		});

		test('sends an ephemeral reply with text', async () => {
			const content = 'yo';
			await expect(replyWithPrivateMessage(interaction, content, false)).resolves.toBe(true);
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith({ content, ephemeral: true });
		});

		test('returns false when an ephemeral reply with text fails', async () => {
			mockReply.mockRejectedValueOnce(new Error('This is a test'));
			const content = 'yo';
			await expect(replyWithPrivateMessage(interaction, content, false)).resolves.toBe(false);
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith({ content, ephemeral: true });
		});

		test('sends an ephemeral reply with options', async () => {
			const content = 'yo';
			await expect(replyWithPrivateMessage(interaction, { content }, false)).resolves.toBe(true);
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith({ content, ephemeral: true });
		});

		test('returns false when an ephemeral reply with options fails', async () => {
			mockReply.mockRejectedValueOnce(new Error('This is a test'));
			const content = 'yo';
			await expect(replyWithPrivateMessage(interaction, { content }, false)).resolves.toBe(false);
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith({ content, ephemeral: true });
		});

		describe('in DMs', () => {
			test('sends text DM to user with return prompt', async () => {
				const content = 'yo';
				await expect(replyWithPrivateMessage(interaction, content, true)).resolves.toBeTypeOf(
					'object'
				);
				expect(mockReply).not.toHaveBeenCalled();
				expect(mockUserSend).toHaveBeenCalledOnce();
				expect(mockUserSend).toHaveBeenCalledWith(`(Reply from <#channel-1234>)\n${content}`);
			});

			test('sends object DM to user with return prompt', async () => {
				const options = { content: 'yo' };
				await expect(replyWithPrivateMessage(interaction, options, true)).resolves.toBeTypeOf(
					'object'
				);
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
				await expect(replyWithPrivateMessage(interaction, content, true)).resolves.toBe(true);
				expect(mockUserSend).toHaveBeenCalledOnce();
				expect(mockUserSend).toHaveBeenCalledWith(`(Reply from <#channel-1234>)\n${content}`);
				expect(mockReply).toHaveBeenCalledOnce();
				expect(mockReply).toHaveBeenCalledWith({
					content: expect.stringContaining('tried to DM you') as string,
					ephemeral: true,
				});
				expect(mockLoggerError).toHaveBeenCalledWith(
					expect.stringContaining('Failed to send direct message'),
					error
				);
			});

			test('informs the user if the object DM failed', async () => {
				const error = new Error('This is a test');
				mockUserSend.mockRejectedValueOnce(error);

				const options = { content: 'yo' };
				await expect(replyWithPrivateMessage(interaction, options, true)).resolves.toBe(true);
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
		const mockReply = vi.fn<RepliableInteraction['reply']>();
		const mockChannelSend = vi.fn<PartialTextBasedChannelFields['send']>();
		let author: User;
		let message: Message;

		beforeEach(() => {
			mockReply.mockResolvedValue({} as InteractionResponse);
			mockChannelSend.mockResolvedValue({} as Message<false>);
			mockUserSend.mockResolvedValue({} as Message<false>);
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
			await expect(replyWithPrivateMessage(message, content, true)).resolves.toBeTypeOf('object');
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
			).resolves.toBeTypeOf('object');
			expect(mockReply).not.toHaveBeenCalled();
			expect(mockChannelSend).not.toHaveBeenCalled();
			expect(mockUserSend).toHaveBeenCalledOnce();
			expect(mockUserSend).toHaveBeenCalledWith({
				content: `(Reply from <#${message.channel.id}>)\n`,
			});
		});

		test('sends a DM with a return prefix from options', async () => {
			const content = 'yo';
			await expect(replyWithPrivateMessage(message, { content }, true)).resolves.toBeTypeOf(
				'object'
			);
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
			await expect(replyWithPrivateMessage(message, content, true)).resolves.toBe(false);
			expect(mockUserSend).toHaveBeenCalledOnce();
			expect(mockUserSend).toHaveBeenCalledWith(
				`(Reply from <#${message.channel.id}>)\n${content}`
			);
			expect(mockChannelSend).not.toHaveBeenCalled();
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith(expect.stringContaining('tried to DM you'));
			expect(mockLoggerError).toHaveBeenCalledOnce();
			expect(mockLoggerError).toHaveBeenCalledWith(
				expect.stringContaining('Failed to send direct message'),
				expect.any(Error)
			);
		});

		test('logs an error when DM fallback fails', async () => {
			const error = new Error('This is a test');
			mockUserSend.mockRejectedValueOnce(error);
			mockReply.mockRejectedValueOnce(error);

			const content = 'yo';
			await expect(replyWithPrivateMessage(message, content, true)).resolves.toBe(false);
			expect(mockUserSend).toHaveBeenCalledOnce();
			expect(mockUserSend).toHaveBeenCalledWith(
				`(Reply from <#${message.channel.id}>)\n${content}`
			);
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith(expect.stringContaining('tried to DM you'));
			expect(mockLoggerError).toHaveBeenCalledTimes(2);
			expect(mockLoggerError).toHaveBeenCalledWith(
				expect.stringContaining('Failed to reply with message'),
				error
			);
		});
	});
});

describe('Cold calls', () => {
	const mockChannelSend = vi.fn<TextChannel['send']>();
	let mockChannel: TextChannel;

	beforeEach(() => {
		mockChannelSend.mockResolvedValue({ id: 'the-message' } as Message<true>);
		mockChannel = {
			send: mockChannelSend,
			type: ChannelType.GuildText,
		} as unknown as TextChannel;
	});

	test('sends a message in the given channel', async () => {
		await expect(sendMessageInChannel(mockChannel, 'yo')).resolves.not.toBeNull();
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
