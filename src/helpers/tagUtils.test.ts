import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
	createTag,
	getTag,
	getAllTags,
	incrementTagUseCount,
	deleteTag,
	searchTags,
} from './tagUtils.js';
import { db } from '../database/index.js';

vi.mock('../database/index.js', () => ({
	db: new PrismaClient(),
}));

describe('tagUtils', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createTag', () => {
		it('should create a new tag successfully', async () => {
			vi.spyOn(db.tag, 'findUnique').mockResolvedValue(null);
			vi.spyOn(db.tag, 'create').mockResolvedValue({
				id: 1,
				guildId: 'guild123',
				name: 'test',
				content: 'https://example.com/image.png',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 0,
			});

			const result = await createTag('guild123', 'test', 'https://example.com/image.png', 'user123');

			expect(result).toBeDefined();
			expect(result.name).toBe('test');
			expect(db.tag.findUnique).toHaveBeenCalledWith({
				where: {
					guild_tag: {
						guildId: 'guild123',
						name: 'test',
					},
				},
			});
		});

		it('should throw error if tag already exists', async () => {
			vi.spyOn(db.tag, 'findUnique').mockResolvedValue({
				id: 1,
				guildId: 'guild123',
				name: 'test',
				content: 'https://example.com/image.png',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 0,
			});

			await expect(
				createTag('guild123', 'test', 'https://example.com/other.png', 'user456')
			).rejects.toThrow("A tag named 'test' already exists");
		});

		it('should normalize tag name to lowercase', async () => {
			vi.spyOn(db.tag, 'findUnique').mockResolvedValue(null);
			vi.spyOn(db.tag, 'create').mockResolvedValue({
				id: 1,
				guildId: 'guild123',
				name: 'testname',
				content: 'https://example.com/image.png',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 0,
			});

			await createTag('guild123', 'TestName', 'https://example.com/image.png', 'user123');

			expect(db.tag.create).toHaveBeenCalledWith({
				data: {
					guildId: 'guild123',
					name: 'testname',
					content: 'https://example.com/image.png',
					createdBy: 'user123',
				},
			});
		});
	});

	describe('getTag', () => {
		it('should return tag if it exists', async () => {
			const mockTag = {
				id: 1,
				guildId: 'guild123',
				name: 'test',
				content: 'https://example.com/image.png',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 5,
			};

			vi.spyOn(db.tag, 'findUnique').mockResolvedValue(mockTag);

			const result = await getTag('guild123', 'test');

			expect(result).toEqual(mockTag);
			expect(db.tag.findUnique).toHaveBeenCalledWith({
				where: {
					guild_tag: {
						guildId: 'guild123',
						name: 'test',
					},
				},
			});
		});

		it('should return null if tag does not exist', async () => {
			vi.spyOn(db.tag, 'findUnique').mockResolvedValue(null);

			const result = await getTag('guild123', 'nonexistent');

			expect(result).toBeNull();
		});
	});

	describe('getAllTags', () => {
		it('should return all tags for a guild', async () => {
			const mockTags = [
				{
					id: 1,
					guildId: 'guild123',
					name: 'tag1',
					content: 'content1',
					createdBy: 'user1',
					createdAt: new Date(),
					useCount: 5,
				},
				{
					id: 2,
					guildId: 'guild123',
					name: 'tag2',
					content: 'content2',
					createdBy: 'user2',
					createdAt: new Date(),
					useCount: 10,
				},
			];

			vi.spyOn(db.tag, 'findMany').mockResolvedValue(mockTags);

			const result = await getAllTags('guild123');

			expect(result).toEqual(mockTags);
			expect(db.tag.findMany).toHaveBeenCalledWith({
				where: {
					guildId: 'guild123',
				},
				orderBy: {
					name: 'asc',
				},
			});
		});

		it('should return empty array if no tags exist', async () => {
			vi.spyOn(db.tag, 'findMany').mockResolvedValue([]);

			const result = await getAllTags('guild123');

			expect(result).toEqual([]);
		});
	});

	describe('incrementTagUseCount', () => {
		it('should increment use count for tag', async () => {
			vi.spyOn(db.tag, 'update').mockResolvedValue({
				id: 1,
				guildId: 'guild123',
				name: 'test',
				content: 'content',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 6,
			});

			await incrementTagUseCount('guild123', 'test');

			expect(db.tag.update).toHaveBeenCalledWith({
				where: {
					guild_tag: {
						guildId: 'guild123',
						name: 'test',
					},
				},
				data: {
					useCount: {
						increment: 1,
					},
				},
			});
		});
	});

	describe('deleteTag', () => {
		it('should delete tag if user is creator', async () => {
			const mockTag = {
				id: 1,
				guildId: 'guild123',
				name: 'test',
				content: 'content',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 0,
			};

			vi.spyOn(db.tag, 'findUnique').mockResolvedValue(mockTag);
			vi.spyOn(db.tag, 'delete').mockResolvedValue(mockTag);

			const result = await deleteTag('guild123', 'test', 'user123');

			expect(result).toBe(true);
			expect(db.tag.delete).toHaveBeenCalledWith({
				where: {
					guild_tag: {
						guildId: 'guild123',
						name: 'test',
					},
				},
			});
		});

		it('should return false if tag does not exist', async () => {
			vi.spyOn(db.tag, 'findUnique').mockResolvedValue(null);

			const result = await deleteTag('guild123', 'test', 'user123');

			expect(result).toBe(false);
			expect(db.tag.delete).not.toHaveBeenCalled();
		});

		it('should throw error if user is not creator and not admin', async () => {
			const mockTag = {
				id: 1,
				guildId: 'guild123',
				name: 'test',
				content: 'content',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 0,
			};

			vi.spyOn(db.tag, 'findUnique').mockResolvedValue(mockTag);

			await expect(deleteTag('guild123', 'test', 'user456', false)).rejects.toThrow(
				'You can only delete tags you created'
			);
		});

		it('should allow admin to delete any tag', async () => {
			const mockTag = {
				id: 1,
				guildId: 'guild123',
				name: 'test',
				content: 'content',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 0,
			};

			vi.spyOn(db.tag, 'findUnique').mockResolvedValue(mockTag);
			vi.spyOn(db.tag, 'delete').mockResolvedValue(mockTag);

			const result = await deleteTag('guild123', 'test', 'admin456', true);

			expect(result).toBe(true);
			expect(db.tag.delete).toHaveBeenCalledWith({
				where: {
					guild_tag: {
						guildId: 'guild123',
						name: 'test',
					},
				},
			});
		});
	});

	describe('searchTags', () => {
		it('should return matching tag names', async () => {
			const mockTags = [
				{ name: 'test1' },
				{ name: 'test2' },
				{ name: 'testing' },
			];

			vi.spyOn(db.tag, 'findMany').mockResolvedValue(mockTags as any);

			const result = await searchTags('guild123', 'test');

			expect(result).toEqual(['test1', 'test2', 'testing']);
			expect(db.tag.findMany).toHaveBeenCalledWith({
				where: {
					guildId: 'guild123',
					name: {
						contains: 'test',
					},
				},
				select: {
					name: true,
				},
				orderBy: {
					useCount: 'desc',
				},
				take: 25,
			});
		});

		it('should respect limit parameter', async () => {
			vi.spyOn(db.tag, 'findMany').mockResolvedValue([]);

			await searchTags('guild123', 'test', 10);

			expect(db.tag.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					take: 10,
				})
			);
		});
	});
});
