/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	createTag,
	getTag,
	getAllTags,
	incrementTagUseCount,
	deleteTag,
	searchTags,
	validateImageAttachment,
	downloadAttachment,
} from './tagUtils.js';

const mockTagModel = vi.hoisted(() => ({
	findUnique: vi.fn(),
	findMany: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
}));

vi.mock('../database/index.js', () => ({
	db: { tag: mockTagModel },
}));

const fakeImageData = Buffer.from('fake-image-data');

function createMockTag(overrides: Partial<{
	id: number;
	guildId: string;
	name: string;
	imageData: Buffer;
	fileName: string;
	contentType: string;
	createdBy: string;
	createdAt: Date;
	useCount: number;
}> = {}) {
	return {
		id: 1,
		guildId: 'guild123',
		name: 'test',
		imageData: fakeImageData,
		fileName: 'image.png',
		contentType: 'image/png',
		createdBy: 'user123',
		createdAt: new Date(),
		useCount: 0,
		...overrides,
	};
}

describe('tagUtils', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('validateImageAttachment', () => {
		it('should accept valid image types', () => {
			expect(() => validateImageAttachment('image/png', 1024)).not.toThrow();
			expect(() => validateImageAttachment('image/jpeg', 1024)).not.toThrow();
			expect(() => validateImageAttachment('image/gif', 1024)).not.toThrow();
			expect(() => validateImageAttachment('image/webp', 1024)).not.toThrow();
		});

		it('should reject invalid image types', () => {
			expect(() => validateImageAttachment('text/plain', 1024)).toThrow('Invalid image type');
			expect(() => validateImageAttachment('application/pdf', 1024)).toThrow(
				'Invalid image type'
			);
			expect(() => validateImageAttachment('video/mp4', 1024)).toThrow('Invalid image type');
		});

		it('should reject null content type', () => {
			expect(() => validateImageAttachment(null, 1024)).toThrow('Invalid image type: unknown');
		});

		it('should reject images exceeding size limit', () => {
			const overLimit = 10 * 1024 * 1024 + 1;
			expect(() => validateImageAttachment('image/png', overLimit)).toThrow('too large');
		});

		it('should accept images at exactly the size limit', () => {
			const atLimit = 10 * 1024 * 1024;
			expect(() => validateImageAttachment('image/png', atLimit)).not.toThrow();
		});
	});

	describe('downloadAttachment', () => {
		it('should download and return buffer from URL', async () => {
			const mockArrayBuffer = new ArrayBuffer(8);
			const mockResponse = {
				ok: true,
				arrayBuffer: () => Promise.resolve(mockArrayBuffer),
			};
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response);

			const result = await downloadAttachment('https://cdn.discord.com/attachments/test.png');

			expect(fetch).toHaveBeenCalledWith('https://cdn.discord.com/attachments/test.png');
			expect(result).toBeInstanceOf(Buffer);
			expect(result.length).toBe(8);
		});

		it('should throw on failed download', async () => {
			const mockResponse = {
				ok: false,
				status: 404,
				statusText: 'Not Found',
			};
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response);

			await expect(
				downloadAttachment('https://cdn.discord.com/attachments/missing.png')
			).rejects.toThrow('Failed to download attachment: 404 Not Found');
		});
	});

	describe('createTag', () => {
		it('should create a new tag successfully', async () => {
			mockTagModel.findUnique.mockResolvedValue(null);
			mockTagModel.create.mockResolvedValue(createMockTag());

			const result = await createTag(
				'guild123',
				'test',
				fakeImageData,
				'image.png',
				'image/png',
				'user123'
			);

			expect(result).toBeDefined();
			expect(result.name).toBe('test');
			expect(mockTagModel.findUnique).toHaveBeenCalledWith({
				where: {
					guild_tag: {
						guildId: 'guild123',
						name: 'test',
					},
				},
			});
		});

		it('should throw error if tag already exists', async () => {
			mockTagModel.findUnique.mockResolvedValue(createMockTag());

			await expect(
				createTag('guild123', 'test', fakeImageData, 'other.png', 'image/png', 'user456')
			).rejects.toThrow("A tag named 'test' already exists");
		});

		it('should normalize tag name to lowercase', async () => {
			mockTagModel.findUnique.mockResolvedValue(null);
			mockTagModel.create.mockResolvedValue(createMockTag({ name: 'testname' }));

			await createTag(
				'guild123',
				'TestName',
				fakeImageData,
				'image.png',
				'image/png',
				'user123'
			);

			expect(mockTagModel.create).toHaveBeenCalledWith({
				data: {
					guildId: 'guild123',
					name: 'testname',
					imageData: fakeImageData,
					fileName: 'image.png',
					contentType: 'image/png',
					createdBy: 'user123',
				},
			});
		});
	});

	describe('getTag', () => {
		it('should return tag if it exists', async () => {
			const tag = createMockTag({ useCount: 5 });
			mockTagModel.findUnique.mockResolvedValue(tag);

			const result = await getTag('guild123', 'test');

			expect(result).toEqual(tag);
			expect(mockTagModel.findUnique).toHaveBeenCalledWith({
				where: {
					guild_tag: {
						guildId: 'guild123',
						name: 'test',
					},
				},
			});
		});

		it('should return null if tag does not exist', async () => {
			mockTagModel.findUnique.mockResolvedValue(null);

			const result = await getTag('guild123', 'nonexistent');

			expect(result).toBeNull();
		});
	});

	describe('getAllTags', () => {
		it('should return all tags for a guild excluding imageData', async () => {
			const tagsWithoutImageData = [
				{
					id: 1,
					guildId: 'guild123',
					name: 'tag1',
					fileName: 'img1.png',
					contentType: 'image/png',
					createdBy: 'user1',
					createdAt: new Date(),
					useCount: 5,
				},
				{
					id: 2,
					guildId: 'guild123',
					name: 'tag2',
					fileName: 'img2.gif',
					contentType: 'image/gif',
					createdBy: 'user2',
					createdAt: new Date(),
					useCount: 10,
				},
			];

			mockTagModel.findMany.mockResolvedValue(tagsWithoutImageData);

			const result = await getAllTags('guild123');

			expect(result).toEqual(tagsWithoutImageData);
			expect(mockTagModel.findMany).toHaveBeenCalledWith({
				where: {
					guildId: 'guild123',
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
		});

		it('should return empty array if no tags exist', async () => {
			mockTagModel.findMany.mockResolvedValue([]);

			const result = await getAllTags('guild123');

			expect(result).toEqual([]);
		});
	});

	describe('incrementTagUseCount', () => {
		it('should increment use count for tag', async () => {
			mockTagModel.update.mockResolvedValue(createMockTag({ useCount: 6 }));

			await incrementTagUseCount('guild123', 'test');

			expect(mockTagModel.update).toHaveBeenCalledWith({
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
			const tag = createMockTag();
			mockTagModel.findUnique.mockResolvedValue(tag);
			mockTagModel.delete.mockResolvedValue(tag);

			const result = await deleteTag('guild123', 'test', 'user123');

			expect(result).toBe(true);
			expect(mockTagModel.delete).toHaveBeenCalledWith({
				where: {
					guild_tag: {
						guildId: 'guild123',
						name: 'test',
					},
				},
			});
		});

		it('should return false if tag does not exist', async () => {
			mockTagModel.findUnique.mockResolvedValue(null);

			const result = await deleteTag('guild123', 'test', 'user123');

			expect(result).toBe(false);
			expect(mockTagModel.delete).not.toHaveBeenCalled();
		});

		it('should throw error if user is not creator and not admin', async () => {
			mockTagModel.findUnique.mockResolvedValue(createMockTag());

			await expect(deleteTag('guild123', 'test', 'user456', false)).rejects.toThrow(
				'You can only delete tags you created'
			);
		});

		it('should allow admin to delete any tag', async () => {
			const tag = createMockTag();
			mockTagModel.findUnique.mockResolvedValue(tag);
			mockTagModel.delete.mockResolvedValue(tag);

			const result = await deleteTag('guild123', 'test', 'admin456', true);

			expect(result).toBe(true);
			expect(mockTagModel.delete).toHaveBeenCalledWith({
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
			const mockTags = [{ name: 'test1' }, { name: 'test2' }, { name: 'testing' }];

			mockTagModel.findMany.mockResolvedValue(mockTags);

			const result = await searchTags('guild123', 'test');

			expect(result).toEqual(['test1', 'test2', 'testing']);
			expect(mockTagModel.findMany).toHaveBeenCalledWith({
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
			mockTagModel.findMany.mockResolvedValue([]);

			await searchTags('guild123', 'test', 10);

			expect(mockTagModel.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					take: 10,
				})
			);
		});
	});
});
