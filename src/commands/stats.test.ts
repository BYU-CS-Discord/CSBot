import type { DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient, Scoreboard } from '@prisma/client';
import { mockDeep } from 'vitest-mock-extended';

vi.mock('../constants/meta', async () => {
	const { repo } = await vi.importActual<typeof import('../constants/meta')>('../constants/meta');
	return {
		// Version changes frequently, so use a consistent version number to test with:
		appVersion: 'X.X.X',
		repo,
	};
});

vi.mock('../database', () => ({
	db: mockDeep<PrismaClient>(),
}));

import { stats } from './stats';
import { db } from '../database';

describe('stats', () => {
	const dbMock = db as DeepMockProxy<PrismaClient>;
	/* eslint-disable @typescript-eslint/unbound-method */
	const mockCount = dbMock.scoreboard.count;
	const mockCreate = dbMock.scoreboard.create;
	const mockDelete = dbMock.scoreboard.delete;
	const mockFindFirst = dbMock.scoreboard.findFirst;
	const mockFindMany = dbMock.scoreboard.findMany;
	const mockUpdate = dbMock.scoreboard.update;
	/* eslint-enable @typescript-eslint/unbound-method */

	const mockUserId = 'test-user-id';
	const mockStatName = 'stats-test';
	const mockGuildId = 'test-guild-id';

	const mockReply = vi.fn();
	const mockReplyPrivately = vi.fn();
	const mockGetString = vi.fn<[name: string], string | null>();
	const mockGetNumber = vi.fn<[name: string], number | null>();
	const mockGetSubcommand = vi.fn();
	const mockGetUser = vi.fn();
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
			expect(mockCreate).toHaveBeenCalledExactlyOnceWith({
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

			expect(mockUpdate).toHaveBeenCalledExactlyOnceWith({
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
			expect(mockDelete).toHaveBeenCalledExactlyOnceWith({
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

		test('fails when unable to find a username', async () => {
			mockGetUser.mockReturnValue(undefined);

			await expect(stats.execute(context)).rejects.toThrow();
		});
	});
});
