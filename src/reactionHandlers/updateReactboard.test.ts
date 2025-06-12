import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import type { DeepMockProxy } from 'vitest-mock-extended';

import type { PrismaClient, Reactboard, ReactboardPost } from '@prisma/client';
import { ChannelType, Client, Message, TextChannel, User } from 'discord.js';

import { db } from '../database/index.js';
import { updateReactboard } from './updateReactboard.js';

vi.mock('../database/index.js', () => ({
	db: mockDeep<PrismaClient>(),
}));

describe('updateReactboard', () => {
	const dbMock = db as unknown as DeepMockProxy<PrismaClient>;
	/* eslint-disable @typescript-eslint/unbound-method */
	const mockReactboardCount = dbMock.reactboard.count;
	const mockReactboardPostFindMany = dbMock.reactboardPost.findMany;
	const mockReactboardFindMany = dbMock.reactboard.findMany;
	const mockReactboardPostCreate = dbMock.reactboardPost.create;
	/* eslint-enable @typescript-eslint/unbound-method */

	const mockGuildId = 'test-guild-id';
	const mockMessageId = 'test-message-id';
	const mockReactboardPostId = 'test-reactboard-post-id';
	const mockUsername = 'test-username';
	const mockChannelId = 'test-channel-id';
	const mockReactboardChannelId = 'test-reactboard-channel-id';
	const mockMessageAuthorId = 'test-message-author-id';
	const mockReactorId = 'test-reactor-id';
	const mockReactboardId = 0;
	const mockReact = '⭐';

	const mockReactionFetch = vi.fn<ReactionHandlerContext['reaction']['fetch']>();
	const mockMessageFetch = vi.fn<ReactionHandlerContext['reaction']['message']['fetch']>();
	const mockUserFetch = vi.fn<ReactionHandlerContext['user']['fetch']>();
	const mockChannelFetch = vi.fn<Client['channels']['fetch']>();
	const mockChannelIsDMBased = vi.fn<TextChannel['isDMBased']>();
	const mockMessageFetchById = vi.fn<TextChannel['messages']['fetch']>();
	const mockSend = vi.fn<TextChannel['send']>();
	const mockEdit = vi.fn<Message['edit']>();
	const mockChannelIsTextBased = vi.fn<TextChannel['isTextBased']>();
	const mockRemoveReact = vi.fn<ReactionHandlerContext['reaction']['users']['remove']>();
	const mockAvatarUrl = vi.fn<User['displayAvatarURL']>();
	let context: ReactionHandlerContext;

	const baseAuthor = {
		id: mockMessageAuthorId,
		bot: false,
		username: mockUsername,
		displayAvatarURL: mockAvatarUrl,
	};
	const baseFullMessage = {
		id: mockMessageId,
		guildId: mockGuildId,
		inGuild: (): boolean => true,
		author: baseAuthor,
		channel: {
			id: mockChannelId,
			send: mockSend,
			isTextBased: mockChannelIsTextBased,
		},
		cleanContent: 'something funny',
		attachments: {
			first: (): { contentType: string; url: string } => ({
				contentType: 'image/jpeg',
				url: 'http://test.com/image',
			}),
		},
	};

	beforeEach(() => {
		context = {
			reaction: {
				fetch: mockReactionFetch,
				message: {
					fetch: mockMessageFetch,
					partial: true,
				},
				users: {
					remove: mockRemoveReact,
				},
				partial: true,
			},
			user: {
				id: mockReactorId,
				partial: true,
				fetch: mockUserFetch,
			},
		} as unknown as ReactionHandlerContext;

		mockReactionFetch.mockResolvedValue({
			emoji: {
				name: mockReact,
			},
			message: {
				id: mockMessageId,
				guildId: mockGuildId,
			},
			client: {
				channels: {
					fetch: mockChannelFetch,
				},
			},
			count: 5,
		});

		mockMessageFetch.mockResolvedValue(baseFullMessage);

		mockReactboardCount.mockResolvedValue(1);

		mockReactboardPostFindMany.mockResolvedValue([]);

		mockReactboardFindMany.mockResolvedValue([]);

		mockChannelFetch.mockResolvedValue({
			isTextBased: mockChannelIsTextBased,
			isDMBased: mockChannelIsDMBased,
			type: ChannelType.GuildText,
			messages: {
				fetch: mockMessageFetchById,
			},
			send: mockSend,
		});

		mockChannelIsTextBased.mockReturnValue(true);
		mockChannelIsDMBased.mockReturnValue(false);
		mockMessageFetchById.mockResolvedValue({
			edit: mockEdit,
		});

		mockSend.mockResolvedValue({
			id: mockReactboardPostId,
		});
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('does nothing if the react isnt in a guild', async () => {
		mockMessageFetch.mockResolvedValue({
			...baseFullMessage,
			guildId: null,
			inGuild: () => false,
		});

		await updateReactboard.execute(context);
		expect(mockReactboardPostCreate).not.toHaveBeenCalled();
		expect(mockSend).not.toHaveBeenCalled();
		expect(mockEdit).not.toHaveBeenCalled();
		expect(mockRemoveReact).not.toHaveBeenCalled();
	});

	test('does nothing if the react isnt part of a reactboard', async () => {
		mockReactboardCount.mockResolvedValue(0);

		await updateReactboard.execute(context);
		expect(mockReactboardPostCreate).not.toHaveBeenCalled();
		expect(mockSend).not.toHaveBeenCalled();
		expect(mockEdit).not.toHaveBeenCalled();
		expect(mockRemoveReact).not.toHaveBeenCalled();
	});

	test('prevents the user from reactboard reacting to a bot message', async () => {
		mockMessageFetch.mockResolvedValue({
			...baseFullMessage,
			author: {
				...baseAuthor,
				bot: true,
			},
		});

		await updateReactboard.execute(context);
		expect(mockSend).toHaveBeenCalledTimes(1);
		expect(mockRemoveReact).toHaveBeenCalledTimes(1);
	});

	test('prevents the user from reactboard reacting to their own message', async () => {
		mockMessageFetch.mockResolvedValue({
			...baseFullMessage,
			author: {
				...baseAuthor,
				id: mockReactorId,
			},
		});

		await updateReactboard.execute(context);
		expect(mockSend).toHaveBeenCalledTimes(1);
		expect(mockRemoveReact).toHaveBeenCalledTimes(1);
	});

	test('updates existing posts if there are any', async () => {
		mockReactboardPostFindMany.mockResolvedValue([
			{
				reactboard: {
					channelId: mockReactboardChannelId,
				},
				reactboardPost: mockReactboardPostId,
			} as unknown as ReactboardPost,
		]);

		await updateReactboard.execute(context);
		expect(mockEdit).toHaveBeenCalledTimes(1);
		expect(mockSend).not.toHaveBeenCalled();
		expect(mockReactboardPostCreate).not.toHaveBeenCalled();
	});

	test("creates new reactboard post if one doesn't already exist", async () => {
		mockReactboardFindMany.mockResolvedValue([
			{
				channelId: mockReactboardChannelId,
				id: mockReactboardId,
			} as unknown as Reactboard,
		]);

		await updateReactboard.execute(context);
		expect(mockSend).toHaveBeenCalledTimes(1);
		expect(mockReactboardPostCreate).toHaveBeenCalledTimes(1);
		expect(mockReactboardPostCreate).toHaveBeenCalledWith({
			data: {
				reactboardId: mockReactboardId,
				originalMessageId: mockMessageId,
				reactboardMessageId: mockReactboardPostId,
			},
		});
		expect(mockEdit).not.toHaveBeenCalled();
	});
});
