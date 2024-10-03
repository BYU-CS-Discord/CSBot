import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { DeepMockProxy } from 'vitest-mock-extended';
import { mockDeep } from 'vitest-mock-extended';

import type { PrismaClient } from '@prisma/client';
import type { TextChannel } from 'discord.js';

import { setReactboard } from './setReactboard.js';
import { db } from '../database/index.js';
import { UserMessageError } from '../helpers/UserMessageError.js';

vi.mock('../database', () => ({
	db: mockDeep<PrismaClient>(),
}));

describe('setReactboard', () => {
	const dbMock = db as unknown as DeepMockProxy<PrismaClient>;
	// eslint-disable-next-line @typescript-eslint/unbound-method
	const mockUpsert = dbMock.reactboard.upsert;

	const mockGuildId = 'test-guild-id';
	const mockChannel = {
		id: 'test-channel-id',
	};
	const mockThreshold = 5;
	const mockReact = '⭐';

	const mockReplyPrivately = vi.fn<GuildedCommandContext['replyPrivately']>();
	const mockGetString = vi.fn<GuildedCommandContext['options']['getString']>();
	const mockGetInteger = vi.fn<GuildedCommandContext['options']['getInteger']>();
	const mockGetChannel = vi.fn<GuildedCommandContext['options']['getChannel']>();
	const mockGetEmoji = vi.fn<GuildedCommandContext['guild']['emojis']['fetch']>();
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

		vi.clearAllMocks();
	});

	test('upserts a reactboard', async () => {
		await setReactboard.execute(context);
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

		await setReactboard.execute(context);
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
