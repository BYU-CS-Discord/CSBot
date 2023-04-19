import type { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import type { TextChannel } from 'discord.js';

jest.mock('../database', () => ({
	db: mockDeep<PrismaClient>(),
}));

import { setReactboard } from './setReactboard';
import { db } from '../database';
import { UserMessageError } from '../helpers/UserMessageError';

describe('setReactboard', () => {
	const dbMock = db as unknown as DeepMockProxy<PrismaClient>;
	/* eslint-disable @typescript-eslint/unbound-method */
	const mockUpsert = dbMock.reactboard.upsert;
	/* eslint-enable @typescript-eslint/unbound-method */

	const mockGuildId = 'test-guild-id';
	const mockChannel = {
		id: 'test-channel-id',
	};
	const mockThreshold = 5;
	const mockReact = '⭐';

	const mockReplyPrivately = jest.fn();
	const mockGetString = jest.fn<string | null, [name: string]>();
	const mockGetInteger = jest.fn<number, [name: string]>();
	const mockGetChannel = jest.fn<TextChannel | null, [name: string]>();
	const mockGetEmoji = jest.fn();
	let context: GuildedCommandContext;

	beforeEach(() => {
		context = {
			replyPrivately: mockReplyPrivately,
			options: {
				getString: mockGetString,
				getInteger: mockGetInteger,
				getChannel: mockGetChannel,
			},
			guild: {
				id: mockGuildId,
				emojis: {
					fetch: mockGetEmoji,
				},
			},
		} as unknown as GuildedCommandContext;

		mockGetChannel.mockReturnValue(mockChannel as unknown as TextChannel);
		mockGetInteger.mockReturnValue(mockThreshold);
		mockGetString.mockReturnValue(mockReact);
	});

	test('upserts a reactboard', async () => {
		await expect(setReactboard.execute(context)).resolves.toBeUndefined();
		expect(mockUpsert).toHaveBeenCalledTimes(1);
		expect(mockUpsert).toHaveBeenCalledWith({
			where: {
				location: {
					channelId: mockChannel.id,
					guildId: mockGuildId,
				},
			},
			update: {
				threshold: mockThreshold,
				react: mockReact,
				isCustomReact: false,
			},
			create: {
				channelId: mockChannel.id,
				guildId: mockGuildId,
				threshold: mockThreshold,
				react: mockReact,
				isCustomReact: false,
			},
		});
		expect(mockReplyPrivately).toHaveBeenCalledTimes(1);
	});

	test('upserts a reactboard with a custom emoji', async () => {
		const customEmojiId = '1234567890';
		mockGetString.mockReturnValue(`<:abcdef:${customEmojiId}>`);
		mockGetEmoji.mockReturnValue({
			id: customEmojiId,
		});

		await expect(setReactboard.execute(context)).resolves.toBeUndefined();
		expect(mockUpsert).toHaveBeenCalledTimes(1);
		expect(mockUpsert).toHaveBeenCalledWith({
			where: {
				location: {
					channelId: mockChannel.id,
					guildId: mockGuildId,
				},
			},
			update: {
				threshold: mockThreshold,
				react: customEmojiId,
				isCustomReact: true,
			},
			create: {
				channelId: mockChannel.id,
				guildId: mockGuildId,
				threshold: mockThreshold,
				react: customEmojiId,
				isCustomReact: true,
			},
		});
		expect(mockReplyPrivately).toHaveBeenCalledTimes(1);
	});

	test('fails with UserMessageError when threshold is below 1', async () => {
		mockGetInteger.mockReturnValue(0);

		await expect(setReactboard.execute(context)).rejects.toThrow(UserMessageError);
	});
});
