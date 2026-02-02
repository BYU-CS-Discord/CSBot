import { db } from '../database/index.js';
import type { Tag } from '@prisma/client';

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates an image attachment's content type and size.
 * @throws Error if content type is not allowed or size exceeds limit
 */
export function validateImageAttachment(contentType: string | null, size: number): void {
	if (!contentType || !ALLOWED_IMAGE_TYPES.has(contentType)) {
		throw new Error(
			`Invalid image type: ${contentType ?? 'unknown'}. Allowed types: PNG, JPEG, GIF, WebP.`
		);
	}

	if (size > MAX_IMAGE_SIZE_BYTES) {
		throw new Error(`Image is too large (${(size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.`);
	}
}

/**
 * Downloads binary data from a URL (e.g. Discord CDN attachment URL).
 * @param url URL to download from
 * @returns Buffer of the downloaded data
 */
export async function downloadAttachment(url: string): Promise<Buffer> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download attachment: ${response.status} ${response.statusText}`);
	}
	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

/**
 * Creates a new tag for a guild.
 * @param guildId Discord guild ID
 * @param name Tag name
 * @param imageData Binary image data
 * @param fileName Original filename
 * @param contentType MIME type
 * @param createdBy Discord user ID of creator
 * @returns The created tag
 * @throws Error if tag with that name already exists
 */
export async function createTag(
	guildId: string,
	name: string,
	imageData: Buffer,
	fileName: string,
	contentType: string,
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
			imageData,
			fileName,
			contentType,
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

// TODO: Consider adding image compression before storing (e.g., sharp library)
// to reduce database size. For v1, images are stored at their original size.

/**
 * Gets all tags for a guild, sorted by name.
 * Excludes imageData to avoid loading all image binaries into memory.
 * @param guildId Discord guild ID
 * @returns Array of tags (without imageData)
 */
export async function getAllTags(guildId: string): Promise<Array<Omit<Tag, 'imageData'>>> {
	return db.tag.findMany({
		where: {
			guildId,
		},
		select: {
			id: true,
			guildId: true,
			name: true,
			fileName: true,
			contentType: true,
			createdBy: true,
			createdAt: true,
			useCount: true,
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
