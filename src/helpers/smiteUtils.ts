import type { GuildMember, PermissionsBitField } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';
import { db } from '../database/index.js';

/**
 * Checks if a user is smitten in a specific guild.
 * @param userId Discord user ID
 * @param guildId Discord guild ID
 * @returns true if user is smitten, false otherwise
 */
export async function isUserSmitten(userId: string, guildId: string): Promise<boolean> {
	const user = await db.user.findUnique({
		where: {
			user_guild: {
				userId,
				guildId,
			},
		},
	});

	return user?.smitten ?? false;
}

/**
 * Sets the smitten status for a user in a guild.
 * @param userId Discord user ID
 * @param guildId Discord guild ID
 * @param smitten Whether the user should be smitten
 */
export async function setUserSmitten(
	userId: string,
	guildId: string,
	smitten: boolean
): Promise<void> {
	await db.user.upsert({
		where: {
			user_guild: {
				userId,
				guildId,
			},
		},
		update: {
			smitten,
			smittenAt: smitten ? new Date() : null,
		},
		create: {
			userId,
			guildId,
			smitten,
			smittenAt: smitten ? new Date() : null,
		},
	});
}

/**
 * Auto-unsmites users who have been smitten for longer than the specified duration.
 * @param maxDurationMs Maximum duration in milliseconds (default: 1 hour)
 * @returns Number of users auto-unsmitten
 */
export async function autoUnsmiteExpiredUsers(maxDurationMs: number = 3600000): Promise<number> {
	const cutoffTime = new Date(Date.now() - maxDurationMs);

	const expiredUsers = await db.user.findMany({
		where: {
			smitten: true,
			smittenAt: {
				lte: cutoffTime,
			},
		},
	});

	if (expiredUsers.length === 0) {
		return 0;
	}

	await db.user.updateMany({
		where: {
			smitten: true,
			smittenAt: {
				lte: cutoffTime,
			},
		},
		data: {
			smitten: false,
			smittenAt: null,
		},
	});

	return expiredUsers.length;
}

/**
 * Checks if a guild member has administrator permissions.
 * @param member Guild member to check
 * @returns true if member is an administrator, false otherwise
 */
export function isAdmin(member: GuildMember): boolean {
	return member.permissions.has(PermissionFlagsBits.Administrator);
}
