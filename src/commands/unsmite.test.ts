import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'discord.js';
import { unsmite } from './unsmite.js';
import * as smiteUtils from '../helpers/smiteUtils.js';
import { UserMessageError } from '../helpers/UserMessageError.js';

vi.mock('../helpers/smiteUtils.js', async () => {
	const actual = await vi.importActual('../helpers/smiteUtils.js');
	return {
		...actual,
		isAdmin: vi.fn(),
		setUserSmitten: vi.fn(),
	};
});

describe('unsmite', () => {
	const mockReply = vi.fn<GuildedCommandContext['reply']>();
	const mockGetUser = vi.fn<GuildedCommandContext['options']['getUser']>();

	let context: GuildedCommandContext;
	let mockTargetUser: User;

	beforeEach(() => {
		vi.clearAllMocks();

		mockTargetUser = {
			id: 'target-user-id',
			username: 'TargetUser',
		} as User;

		context = {
			reply: mockReply,
			options: {
				getUser: mockGetUser,
			},
			member: {
				id: 'executing-user-id',
			},
			guild: {
				id: 'test-guild-id',
			},
		} as unknown as GuildedCommandContext;

		mockGetUser.mockReturnValue(mockTargetUser);
	});

	it('should throw error if executor is not an admin', async () => {
		vi.mocked(smiteUtils.isAdmin).mockReturnValue(false);

		await expect(unsmite.execute(context)).rejects.toThrow(UserMessageError);
		await expect(unsmite.execute(context)).rejects.toThrow("You don't have permission");
	});

	it('should successfully unsmite a user', async () => {
		vi.mocked(smiteUtils.isAdmin).mockReturnValue(true);

		await unsmite.execute(context);

		expect(smiteUtils.setUserSmitten).toHaveBeenCalledWith(
			mockTargetUser.id,
			'test-guild-id',
			false
		);
		expect(mockReply).toHaveBeenCalledWith(
			expect.objectContaining({
				embeds: expect.arrayContaining([
					expect.objectContaining({
						data: expect.objectContaining({
							title: '✨ Mercy Granted ✨',
						}),
					}),
				]),
			})
		);
	});
});
