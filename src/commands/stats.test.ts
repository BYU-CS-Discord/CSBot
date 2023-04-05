import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import type { PrismaClient } from '@prisma/client';

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
		});
	});
});
