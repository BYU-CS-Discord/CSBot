import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import type { PrismaClient, Scoreboard } from '@prisma/client';

jest.mock('../constants/meta', () => ({
	// Version changes frequently, so use a consistent version number to test with:
	appVersion: 'X.X.X',
	repo: jest.requireActual<typeof import('../constants/meta')>('../constants/meta').repo,
}));

jest.mock('../database', () => ({
	db: mockDeep<PrismaClient>(),
}));

import { stats } from './stats';
import { db } from '../database';

describe('track', () => {
	const dbMock = db as unknown as DeepMockProxy<PrismaClient>;
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

	const mockReply = jest.fn();
	const mockReplyPrivately = jest.fn();
	const mockGetString = jest.fn<string | null, [name: string]>();
	const mockGetNumber = jest.fn<number | null, [name: string]>();
	const mockGetSubcommand = jest.fn();
	const mockGetUser = jest.fn();
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
		} as unknown as GuildedCommandContext;
	});

	describe('track', () => {
		beforeAll(() => {
			mockGetSubcommand.mockReturnValue('track');
		});

		beforeEach(() => {
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
				},
			});

			expect(mockReply).toHaveBeenCalled();
		});

		test('fails when statName is not included', async () => {
			mockGetString.mockReturnValue(null);

			await expect(stats.execute(context)).rejects.toThrow();
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

		beforeAll(() => {
			mockGetSubcommand.mockReturnValue('update');
		});

		beforeEach(() => {
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

		test('fails when statName is not included', async () => {
			mockGetString.mockReturnValue(null);

			await expect(stats.execute(context)).rejects.toThrow();
		});

		test('fails when amount is not included', async () => {
			mockGetNumber.mockReturnValue(null);

			await expect(stats.execute(context)).rejects.toThrow();
		});

		test('fails when stat to update isnt being tracked', async () => {
			mockFindFirst.mockResolvedValue(null);

			await expect(stats.execute(context)).rejects.toThrow();
		});
	});

	describe('list', () => {
		beforeAll(() => {
			mockGetSubcommand.mockReturnValue('list');
		});

		test('replies privately', async () => {
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
		beforeAll(() => {
			mockGetSubcommand.mockReturnValue('untrack');
		});

		beforeEach(() => {
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

		test('fails when statName is not included', async () => {
			mockGetString.mockReturnValue(null);

			await expect(stats.execute(context)).rejects.toThrow();
		});

		test('fails when stat isnt being tracked', async () => {
			mockFindFirst.mockResolvedValue(null);

			await expect(stats.execute(context)).rejects.toThrow();
		});
	});

	describe('leaderboard', () => {
		beforeAll(() => {
			mockGetSubcommand.mockReturnValue('leaderboard');
		});

		beforeEach(() => {
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

		test('fails when statName is not included', async () => {
			mockGetString.mockReturnValue(null);

			await expect(stats.execute(context)).rejects.toThrow();
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
