import type { PrismaClient, Reactboard, ReactboardPost } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

jest.mock('../database', () => ({
	db: mockDeep<PrismaClient>(),
}));

import { db } from '../database';
import { ChannelType } from 'discord.js';
import { updateReactboard } from './updateReactboard';

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

	const mockReactionFetch = jest.fn();
	const mockMessageFetch = jest.fn();
	const mockUserFetch = jest.fn();
	const mockChannelFetch = jest.fn();
	const mockMessageFetchById = jest.fn();
	const mockSend = jest.fn();
	const mockEdit = jest.fn();
	const mockChannelIsTextBased = jest.fn();
	const mockRemoveReact = jest.fn();
	const mockAvatarUrl = jest.fn();
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
		author: baseAuthor,
		channel: {
			id: mockChannelId,
			send: mockSend,
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
			type: ChannelType.GuildText,
			messages: {
				fetch: mockMessageFetchById,
			},
			send: mockSend,
		});

		mockChannelIsTextBased.mockReturnValue(true);

		mockMessageFetchById.mockResolvedValue({
			edit: mockEdit,
		});

		mockSend.mockResolvedValue({
			id: mockReactboardPostId,
		});
	});

	test('does nothing if the react isnt in a guild', async () => {
		mockMessageFetch.mockResolvedValue({
			...baseFullMessage,
			guildId: null,
		});

		await expect(updateReactboard.execute(context)).resolves.toBeUndefined();
		expect(mockReactboardPostCreate).not.toHaveBeenCalled();
		expect(mockSend).not.toHaveBeenCalled();
		expect(mockEdit).not.toHaveBeenCalled();
		expect(mockRemoveReact).not.toHaveBeenCalled();
	});

	test('does nothing if the react isnt part of a reactboard', async () => {
		mockReactboardCount.mockResolvedValue(0);

		await expect(updateReactboard.execute(context)).resolves.toBeUndefined();
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

		await expect(updateReactboard.execute(context)).resolves.toBeUndefined();
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

		await expect(updateReactboard.execute(context)).resolves.toBeUndefined();
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

		await expect(updateReactboard.execute(context)).resolves.toBeUndefined();
		expect(mockEdit).toHaveBeenCalledTimes(1);
		expect(mockSend).not.toHaveBeenCalled();
		expect(mockReactboardPostCreate).not.toHaveBeenCalled();
	});

	test('creates new reactboard post if one doesnt already exist', async () => {
		mockReactboardFindMany.mockResolvedValue([
			{
				channelId: mockReactboardChannelId,
				id: mockReactboardId,
			} as unknown as Reactboard,
		]);

		await expect(updateReactboard.execute(context)).resolves.toBeUndefined();
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
