import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import type { DeepMockProxy } from 'vitest-mock-extended';
import { mockDeep } from 'vitest-mock-extended';

import type { PrismaClient, Scoreboard } from '@prisma/client';

vi.mock('../constants/meta.js', async () => {
	const { repo } =
		await vi.importActual<typeof import('../constants/meta.js')>('../constants/meta.js');
	return {
		// Version changes frequently, so use a consistent version number to test with:
		appVersion: 'X.X.X',
		repo,
	};
});

vi.mock('../database', () => ({
	db: mockDeep<PrismaClient>(),
}));

import { stats } from './stats.js';
import { db } from '../database/index.js';

describe('stats', () => {
	const dbMock = db as DeepMockProxy<PrismaClient>;
	// FIXME vitest-mock-extended's types do not match vitest v2's types
	// https://github.com/eratio08/vitest-mock-extended/issues/508
	/* eslint-disable @typescript-eslint/unbound-method */
	const mockCount = dbMock.scoreboard.count as unknown as Mock<typeof db.scoreboard.count>;
	const mockCreate = dbMock.scoreboard.create as unknown as Mock<typeof db.scoreboard.create>;
	const mockDelete = dbMock.scoreboard.delete as unknown as Mock<typeof db.scoreboard.delete>;
	const mockFindFirst = dbMock.scoreboard.findFirst as unknown as Mock<
		typeof db.scoreboard.findFirst
	>;
	const mockFindMany = dbMock.scoreboard.findMany as unknown as Mock<typeof db.scoreboard.findMany>;
	const mockUpdate = dbMock.scoreboard.update as unknown as Mock<typeof db.scoreboard.update>;
	/* eslint-enable @typescript-eslint/unbound-method */

	const mockUserId = 'test-user-id';
	const mockStatName = 'stats-test';
	const mockGuildId = 'test-guild-id';

	const mockReply = vi.fn<GuildedCommandContext['reply']>();
	const mockReplyPrivately = vi.fn<GuildedCommandContext['replyPrivately']>();
	const mockGetString = vi.fn<GuildedCommandContext['interaction']['options']['getString']>();
	const mockGetNumber = vi.fn<GuildedCommandContext['interaction']['options']['getNumber']>();
	const mockGetSubcommand =
		vi.fn<GuildedCommandContext['interaction']['options']['getSubcommand']>();
	const mockGetUser = vi.fn<GuildedCommandContext['client']['users']['cache']['get']>();
	let context: GuildedCommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
			replyPrivately: mockReplyPrivately,
			interaction: {
				options: {
					getString: mockGetString,
					getNumber: mockGetNumber,
					getSubcommand: mockGetSubcommand,
				},
				user: {
					id: mockUserId,
				},
			},
			client: {
				users: {
					cache: {
						get: mockGetUser,
					},
				},
			},
			guild: {
				id: mockGuildId,
			},
		} as unknown as GuildedCommandContext;
	});

	describe('track', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('track');
			mockGetString.mockReturnValue(mockStatName);
			mockCount.mockResolvedValue(0);
		});

		test('begins tracking a stat', async () => {
			await expect(stats.execute(context)).resolves.toBeUndefined();
			expect(mockCreate).toHaveBeenCalledOnce();
			expect(mockCreate).toHaveBeenCalledWith({
				data: {
					userId: mockUserId,
					name: mockStatName,
					score: 0,
					guildId: mockGuildId,
				},
			});

			expect(mockReply).toHaveBeenCalled();
		});

		test('fails when stat already exists', async () => {
			mockCount.mockResolvedValue(1);

			await expect(stats.execute(context)).rejects.toThrow();
		});
	});

	describe('update', () => {
		const mockScoreboardId = 0;
		const mockAmount = 1;
		const startAmount = 1;

		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('update');
			mockGetString.mockReturnValue(mockStatName);
			mockGetNumber.mockReturnValue(mockAmount);
			mockFindFirst.mockResolvedValue({
				score: startAmount,
				id: mockScoreboardId,
			} as unknown as Scoreboard);
		});

		test('score is added', async () => {
			await expect(stats.execute(context)).resolves.toBeUndefined();

			expect(mockUpdate).toHaveBeenCalledOnce();
			expect(mockUpdate).toHaveBeenCalledWith({
				where: {
					id: mockScoreboardId,
				},
				data: {
					score: startAmount + mockAmount,
				},
			});

			expect(mockReply).toHaveBeenCalled();
		});

		test('fails when stat to update isnt being tracked', async () => {
			mockFindFirst.mockResolvedValue(null);

			await expect(stats.execute(context)).rejects.toThrow();
		});
	});

	describe('list', () => {
		test('replies privately', async () => {
			mockGetSubcommand.mockReturnValue('list');
			mockFindMany.mockResolvedValue([
				{
					score: 1,
					name: 'test-name',
				} as unknown as Scoreboard,
			]);

			await expect(stats.execute(context)).resolves.toBeUndefined();
			expect(mockReplyPrivately).toHaveBeenCalled();
		});
	});

	describe('untrack', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('untrack');
			mockGetString.mockReturnValue(mockStatName);

			mockFindFirst.mockResolvedValue({
				id: 0,
			} as unknown as Scoreboard);
		});

		test('stops tracking a stat', async () => {
			await expect(stats.execute(context)).resolves.toBeUndefined();
			expect(mockDelete).toHaveBeenCalledOnce();
			expect(mockDelete).toHaveBeenCalledWith({
				where: {
					id: 0,
				},
			});

			expect(mockReply).toHaveBeenCalled();
		});

		test('fails when stat isnt being tracked', async () => {
			mockFindFirst.mockResolvedValue(null);

			await expect(stats.execute(context)).rejects.toThrow();
		});
	});

	describe('leaderboard', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('leaderboard');
			mockGetString.mockReturnValue(mockStatName);
			mockFindMany.mockResolvedValue([
				{
					userId: mockUserId,
					score: 1,
				} as unknown as Scoreboard,
			]);
			mockGetUser.mockReturnValue({
				username: 'test-username',
			});
		});

		test('replies with a leaderboard', async () => {
			await expect(stats.execute(context)).resolves.toBeUndefined();

			expect(mockReply).toHaveBeenCalled();
		});

		test('fails when no one is tracking the stat', async () => {
			mockFindMany.mockResolvedValue([]);

			await expect(stats.execute(context)).rejects.toThrow();
		});
	});
});
