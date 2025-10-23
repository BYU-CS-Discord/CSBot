import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionFlagsBits } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { isUserSmitten, setUserSmitten, isAdmin, autoUnsmiteExpiredUsers } from './smiteUtils.js';
import { db } from '../database/index.js';

vi.mock('../database/index.js', () => ({
	db: new PrismaClient(),
}));

describe('smiteUtils', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('isUserSmitten', () => {
		it('should return false when user does not exist', async () => {
			vi.spyOn(db.user, 'findUnique').mockResolvedValue(null);

			const result = await isUserSmitten('user123', 'guild456');

			expect(result).toBe(false);
			expect(db.user.findUnique).toHaveBeenCalledWith({
				where: {
					user_guild: {
						userId: 'user123',
						guildId: 'guild456',
					},
				},
			});
		});

		it('should return true when user is smitten', async () => {
			vi.spyOn(db.user, 'findUnique').mockResolvedValue({
				id: 1,
				userId: 'user123',
				guildId: 'guild456',
				smitten: true,
				smittenAt: new Date(),
			});

			const result = await isUserSmitten('user123', 'guild456');

			expect(result).toBe(true);
		});

		it('should return false when user exists but is not smitten', async () => {
			vi.spyOn(db.user, 'findUnique').mockResolvedValue({
				id: 1,
				userId: 'user123',
				guildId: 'guild456',
				smitten: false,
				smittenAt: null,
			});

			const result = await isUserSmitten('user123', 'guild456');

			expect(result).toBe(false);
		});
	});

	describe('setUserSmitten', () => {
		it('should create a new user when they do not exist', async () => {
			vi.spyOn(db.user, 'upsert').mockResolvedValue({
				id: 1,
				userId: 'user123',
				guildId: 'guild456',
				smitten: true,
				smittenAt: new Date(),
			});

			await setUserSmitten('user123', 'guild456', true);

			const call = vi.mocked(db.user.upsert).mock.calls[0][0];
			expect(call.where).toEqual({
				user_guild: {
					userId: 'user123',
					guildId: 'guild456',
				},
			});
			expect(call.update.smitten).toBe(true);
			expect(call.update.smittenAt).toBeInstanceOf(Date);
			expect(call.create.smitten).toBe(true);
			expect(call.create.smittenAt).toBeInstanceOf(Date);
		});

		it('should update an existing user and clear timestamp when unsmiting', async () => {
			vi.spyOn(db.user, 'upsert').mockResolvedValue({
				id: 1,
				userId: 'user123',
				guildId: 'guild456',
				smitten: false,
				smittenAt: null,
			});

			await setUserSmitten('user123', 'guild456', false);

			const call = vi.mocked(db.user.upsert).mock.calls[0][0];
			expect(call.update.smitten).toBe(false);
			expect(call.update.smittenAt).toBe(null);
			expect(call.create.smitten).toBe(false);
			expect(call.create.smittenAt).toBe(null);
		});
	});

	describe('autoUnsmiteExpiredUsers', () => {
		it('should return count of users unsmitten', async () => {
			const oldDate = new Date(Date.now() - 7200000); // 2 hours ago
			vi.spyOn(db.user, 'findMany').mockResolvedValue([
				{
					id: 1,
					userId: 'user123',
					guildId: 'guild456',
					smitten: true,
					smittenAt: oldDate,
				},
			]);
			vi.spyOn(db.user, 'updateMany').mockResolvedValue({ count: 1 });

			const result = await autoUnsmiteExpiredUsers(3600000); // 1 hour

			expect(result).toBe(1);
			expect(db.user.findMany).toHaveBeenCalled();
			expect(db.user.updateMany).toHaveBeenCalled();
			
			const call = vi.mocked(db.user.updateMany).mock.calls[0][0];
			expect(call.where.smitten).toBe(true);
			expect(call.where.smittenAt.lte).toBeInstanceOf(Date);
			expect(call.data.smitten).toBe(false);
			expect(call.data.smittenAt).toBe(null);
		});

		it('should return 0 when no users need unsmiting', async () => {
			vi.spyOn(db.user, 'findMany').mockResolvedValue([]);
			vi.spyOn(db.user, 'updateMany').mockResolvedValue({ count: 0 });

			const result = await autoUnsmiteExpiredUsers();

			expect(result).toBe(0);
			expect(db.user.updateMany).not.toHaveBeenCalled();
		});
	});

	describe('isAdmin', () => {
		it('should return true when member has administrator permissions', () => {
			const member = {
				permissions: {
					has: vi.fn().mockReturnValue(true),
				},
			} as any;

			const result = isAdmin(member);

			expect(result).toBe(true);
			expect(member.permissions.has).toHaveBeenCalledWith(PermissionFlagsBits.Administrator);
		});

		it('should return false when member does not have administrator permissions', () => {
			const member = {
				permissions: {
					has: vi.fn().mockReturnValue(false),
				},
			} as any;

			const result = isAdmin(member);

			expect(result).toBe(false);
			expect(member.permissions.has).toHaveBeenCalledWith(PermissionFlagsBits.Administrator);
		});
	});
});
