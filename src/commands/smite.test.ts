/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Client, User } from 'discord.js';
import { AttachmentBuilder } from 'discord.js';
import { smite } from './smite.js';
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

describe('smite', () => {
	const mockReply = vi.fn<GuildedCommandContext['reply']>();
	const mockGetUser = vi.fn<GuildedCommandContext['options']['getUser']>();
	const mockFetch = vi.fn();

	let context: GuildedCommandContext;
	let mockTargetUser: User;
	let mockExecutingUser: User;
	let mockClient: Client;

	beforeEach(() => {
		vi.clearAllMocks();

		mockTargetUser = {
			id: 'target-user-id',
			username: 'TargetUser',
		} as User;

		mockExecutingUser = {
			id: 'executing-user-id',
			username: 'ExecutingUser',
		} as User;

		mockClient = {
			user: {
				id: 'bot-user-id',
				username: 'TestBot',
			},
		} as Client;

		context = {
			reply: mockReply,
			options: {
				getUser: mockGetUser,
			},
			member: {
				id: 'executing-user-id',
			},
			user: mockExecutingUser,
			guild: {
				id: 'test-guild-id',
				members: {
					fetch: mockFetch,
				},
			},
			client: mockClient,
		} as unknown as GuildedCommandContext;

		mockGetUser.mockReturnValue(mockTargetUser);
		mockFetch.mockResolvedValue({
			id: 'target-user-id',
		});
	});

	it('should smite non-admin executor for 60 seconds when they try to use the command', async () => {
		vi.mocked(smiteUtils.isAdmin).mockReturnValue(false);

		await smite.execute(context);

		expect(smiteUtils.setUserSmitten).toHaveBeenCalledWith(
			mockExecutingUser.id,
			'test-guild-id',
			true
		);
		expect(mockReply).toHaveBeenCalledWith(
			expect.objectContaining({
				embeds: expect.arrayContaining([
					expect.objectContaining({
						data: expect.objectContaining({
							title: '⚡ Hubris! ⚡',
							image: expect.objectContaining({ url: 'attachment://smite.gif' }),
						}),
					}),
				]),
				files: [expect.any(AttachmentBuilder)],
			})
		);
	});

	it('should show wack image if user tries to smite themselves', async () => {
		vi.mocked(smiteUtils.isAdmin).mockReturnValue(true);
		mockTargetUser.id = mockExecutingUser.id;
		mockGetUser.mockReturnValue(mockTargetUser);

		await smite.execute(context);

		expect(mockReply).toHaveBeenCalledWith(
			expect.objectContaining({
				embeds: expect.arrayContaining([
					expect.objectContaining({
						data: expect.objectContaining({
							title: 'Wack.',
							image: expect.objectContaining({ url: 'attachment://wack.webp' }),
						}),
					}),
				]),
				files: [expect.any(AttachmentBuilder)],
			})
		);
		expect(smiteUtils.setUserSmitten).not.toHaveBeenCalled();
	});

	it('should smite the executor if they try to smite the bot', async () => {
		vi.mocked(smiteUtils.isAdmin).mockReturnValue(true);
		mockTargetUser.id = mockClient.user?.id ?? '';
		mockGetUser.mockReturnValue(mockTargetUser);

		await smite.execute(context);

		expect(smiteUtils.setUserSmitten).toHaveBeenCalledWith(
			mockExecutingUser.id,
			'test-guild-id',
			true
		);
		expect(mockReply).toHaveBeenCalledWith(
			expect.objectContaining({
				embeds: expect.arrayContaining([
					expect.objectContaining({
						data: expect.objectContaining({
							title: 'You fool!',
							image: expect.objectContaining({ url: 'attachment://smite.gif' }),
						}),
					}),
				]),
				files: [expect.any(AttachmentBuilder)],
			})
		);
	});

	it('should throw error if target is an admin', async () => {
		vi.mocked(smiteUtils.isAdmin).mockReturnValueOnce(true).mockReturnValueOnce(true);

		await expect(smite.execute(context)).rejects.toThrow(UserMessageError);
		await expect(smite.execute(context)).rejects.toThrow('cannot smite an administrator');
	});

	it('should successfully smite a regular user', async () => {
		vi.mocked(smiteUtils.isAdmin).mockReturnValueOnce(true).mockReturnValueOnce(false);

		await smite.execute(context);

		expect(smiteUtils.setUserSmitten).toHaveBeenCalledWith(
			mockTargetUser.id,
			'test-guild-id',
			true
		);
		expect(mockReply).toHaveBeenCalledWith(
			expect.objectContaining({
				embeds: expect.arrayContaining([
					expect.objectContaining({
						data: expect.objectContaining({
							title: '⚡ SMITTEN! ⚡',
							image: expect.objectContaining({ url: 'attachment://smite.gif' }),
						}),
					}),
				]),
				files: [expect.any(AttachmentBuilder)],
			})
		);
	});
});
