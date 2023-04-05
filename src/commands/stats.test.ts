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
	const mockFindFirst = dbMock.scoreboard.findFirst;
	const mockUpdate = dbMock.scoreboard.update;
	/* eslint-enable @typescript-eslint/unbound-method */


	const mockUserId = 'test-user-id';
	const mockStatName = 'stats-test';

	const mockReply = jest.fn();
	const mockGetString = jest.fn<string | null, [name: string]>();
	const mockGetNumber = jest.fn<number | null, [name: string]>();
	const mockGetSubcommand = jest.fn();
	let context: GuildedCommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
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
});
