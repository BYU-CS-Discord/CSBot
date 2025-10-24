import { db } from '../database/index.js';
import type { Tag } from '@prisma/client';

/**
 * Creates a new tag for a guild.
 * @param guildId Discord guild ID
 * @param name Tag name
 * @param content Tag content (URL or text)
 * @param createdBy Discord user ID of creator
 * @returns The created tag
 * @throws Error if tag with that name already exists
 */
export async function createTag(
	guildId: string,
	name: string,
	content: string,
	createdBy: string
): Promise<Tag> {
	// Check if tag already exists
	const existing = await db.tag.findUnique({
		where: {
			guild_tag: {
				guildId,
				name: name.toLowerCase(),
			},
		},
	});

	if (existing) {
		throw new Error(`A tag named '${name}' already exists in this server.`);
	}

	return db.tag.create({
		data: {
			guildId,
			name: name.toLowerCase(),
			content,
			createdBy,
		},
	});
}

/**
 * Gets a tag by name for a guild.
 * @param guildId Discord guild ID
 * @param name Tag name
 * @returns The tag or null if not found
 */
export async function getTag(guildId: string, name: string): Promise<Tag | null> {
	return db.tag.findUnique({
		where: {
			guild_tag: {
				guildId,
				name: name.toLowerCase(),
			},
		},
	});
}

/**
 * Gets all tags for a guild, sorted by name.
 * @param guildId Discord guild ID
 * @returns Array of tags
 */
export async function getAllTags(guildId: string): Promise<Array<Tag>> {
	return db.tag.findMany({
		where: {
			guildId,
		},
		orderBy: {
			name: 'asc',
		},
	});
}

/**
 * Increments the use count for a tag.
 * @param guildId Discord guild ID
 * @param name Tag name
 */
export async function incrementTagUseCount(guildId: string, name: string): Promise<void> {
	await db.tag.update({
		where: {
			guild_tag: {
				guildId,
				name: name.toLowerCase(),
			},
		},
		data: {
			useCount: {
				increment: 1,
			},
		},
	});
}

/**
 * Deletes a tag.
 * @param guildId Discord guild ID
 * @param name Tag name
 * @param userId Discord user ID attempting to delete (must be creator or admin)
 * @param isAdmin Whether the user is an admin (admins can delete any tag)
 * @returns true if deleted, false if not found or unauthorized
 */
export async function deleteTag(
	guildId: string,
	name: string,
	userId: string,
	isAdmin = false
): Promise<boolean> {
	const tag = await getTag(guildId, name);

	if (!tag) {
		return false;
	}

	// Check if user is the creator or an admin
	if (!isAdmin && tag.createdBy !== userId) {
		throw new Error('You can only delete tags you created. Admins can delete any tag.');
	}

	await db.tag.delete({
		where: {
			guild_tag: {
				guildId,
				name: name.toLowerCase(),
			},
		},
	});

	return true;
}

/**
 * Searches for tags matching a query (for autocomplete).
 * @param guildId Discord guild ID
 * @param query Search query
 * @param limit Maximum number of results
 * @returns Array of tag names
 */
export async function searchTags(
	guildId: string,
	query: string,
	limit = 25
): Promise<Array<string>> {
	const tags = await db.tag.findMany({
		where: {
			guildId,
			name: {
				contains: query.toLowerCase(),
			},
		},
		select: {
			name: true,
		},
		orderBy: {
			useCount: 'desc', // Prioritize frequently used tags
		},
		take: limit,
	});

	return tags.map(tag => tag.name);
}
