/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AutocompleteInteraction } from 'discord.js';
import { tag } from './tag.js';
import * as tagUtils from '../helpers/tagUtils.js';

vi.mock('../helpers/tagUtils.js');

describe('tag command', () => {
	const mockReply = vi.fn<GuildedCommandContext['reply']>();
	const mockGetString = vi.fn<GuildedCommandContext['options']['getString']>();
	const mockGetSubcommand = vi.fn<GuildedCommandContext['options']['getSubcommand']>();

	let context: GuildedCommandContext;

	beforeEach(() => {
		vi.clearAllMocks();

		context = {
			reply: mockReply,
			options: {
				getString: mockGetString,
				getSubcommand: mockGetSubcommand,
				getFocused: () => '',
			},
			guild: {
				id: 'guild123',
			},
			user: {
				id: 'user123',
				username: 'TestUser',
			},
			member: {
				permissions: {
					has: () => false, // Default to non-admin
				},
			},
			interaction: {
				guildId: 'guild123',
				options: {
					getFocused: () => '',
				},
			},
		} as unknown as GuildedCommandContext;
	});

	describe('add subcommand', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('add');
		});

		it('should create a tag with embedded image for image URLs', async () => {
			mockGetString.mockImplementation((name: string) => {
				if (name === 'name') return 'testtag';
				if (name === 'content') return 'https://example.com/image.png';
				return null;
			});

			vi.mocked(tagUtils.createTag).mockResolvedValue({
				id: 1,
				guildId: 'guild123',
				name: 'testtag',
				content: 'https://example.com/image.png',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 0,
			});

			await tag.execute(context);

			expect(tagUtils.createTag).toHaveBeenCalledWith(
				'guild123',
				'testtag',
				'https://example.com/image.png',
				'user123'
			);
			expect(mockReply).toHaveBeenCalledWith(
				expect.objectContaining({
					ephemeral: true,
					embeds: expect.arrayContaining([
						expect.objectContaining({
							data: expect.objectContaining({
								title: '✅ Tag Created',
								image: expect.objectContaining({
									url: 'https://example.com/image.png',
								}),
							}),
						}),
					]),
				})
			);
		});

		it('should create a tag with text field for non-image content', async () => {
			mockGetString.mockImplementation((name: string) => {
				if (name === 'name') return 'texttag';
				if (name === 'content') return 'Just some text content';
				return null;
			});

			vi.mocked(tagUtils.createTag).mockResolvedValue({
				id: 1,
				guildId: 'guild123',
				name: 'texttag',
				content: 'Just some text content',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 0,
			});

			await tag.execute(context);

			expect(mockReply).toHaveBeenCalledWith(
				expect.objectContaining({
					ephemeral: true,
					embeds: expect.arrayContaining([
						expect.objectContaining({
							data: expect.objectContaining({
								title: '✅ Tag Created',
								fields: expect.arrayContaining([
									expect.objectContaining({
										name: 'Content',
										value: 'Just some text content',
									}),
								]),
							}),
						}),
					]),
				})
			);
		});

		it('should handle duplicate tag name error', async () => {
			mockGetString.mockImplementation((name: string) => {
				if (name === 'name') return 'existing';
				if (name === 'content') return 'https://example.com/image.png';
				return null;
			});

			vi.mocked(tagUtils.createTag).mockRejectedValue(
				new Error("A tag named 'existing' already exists in this server.")
			);

			await expect(tag.execute(context)).rejects.toThrow();
		});
	});

	describe('send subcommand', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('send');
		});

		it('should send image URLs as embeds', async () => {
			mockGetString.mockReturnValue('testtag');

			vi.mocked(tagUtils.getTag).mockResolvedValue({
				id: 1,
				guildId: 'guild123',
				name: 'testtag',
				content: 'https://example.com/image.png',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 5,
			});

			vi.mocked(tagUtils.incrementTagUseCount).mockResolvedValue();

			await tag.execute(context);

			expect(tagUtils.getTag).toHaveBeenCalledWith('guild123', 'testtag');
			expect(tagUtils.incrementTagUseCount).toHaveBeenCalledWith('guild123', 'testtag');
			expect(mockReply).toHaveBeenCalledWith(
				expect.objectContaining({
					embeds: expect.arrayContaining([
						expect.objectContaining({
							data: expect.objectContaining({
								image: expect.objectContaining({
									url: 'https://example.com/image.png',
								}),
							}),
						}),
					]),
				})
			);
		});

		it('should send non-image content as plain text', async () => {
			mockGetString.mockReturnValue('texttag');

			vi.mocked(tagUtils.getTag).mockResolvedValue({
				id: 2,
				guildId: 'guild123',
				name: 'texttag',
				content: 'Just some text or a non-image URL',
				createdBy: 'user123',
				createdAt: new Date(),
				useCount: 2,
			});

			vi.mocked(tagUtils.incrementTagUseCount).mockResolvedValue();

			await tag.execute(context);

			expect(mockReply).toHaveBeenCalledWith({
				content: 'Just some text or a non-image URL',
			});
		});

		it('should throw error if tag not found', async () => {
			mockGetString.mockReturnValue('nonexistent');
			vi.mocked(tagUtils.getTag).mockResolvedValue(null);

			await expect(tag.execute(context)).rejects.toThrow();
		});
	});

	describe('preview subcommand', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('preview');
		});

		it('should show image preview with embedded image', async () => {
			mockGetString.mockReturnValue('testtag');

			const mockDate = new Date('2023-01-01');
			vi.mocked(tagUtils.getTag).mockResolvedValue({
				id: 1,
				guildId: 'guild123',
				name: 'testtag',
				content: 'https://example.com/image.png',
				createdBy: 'user123',
				createdAt: mockDate,
				useCount: 10,
			});

			await tag.execute(context);

			expect(tagUtils.getTag).toHaveBeenCalledWith('guild123', 'testtag');
			expect(mockReply).toHaveBeenCalledWith(
				expect.objectContaining({
					ephemeral: true,
					embeds: expect.arrayContaining([
						expect.objectContaining({
							data: expect.objectContaining({
								title: 'Preview: testtag',
								image: expect.objectContaining({
									url: 'https://example.com/image.png',
								}),
							}),
						}),
					]),
				})
			);
		});

		it('should show text preview with description', async () => {
			mockGetString.mockReturnValue('texttag');

			const mockDate = new Date('2023-01-01');
			vi.mocked(tagUtils.getTag).mockResolvedValue({
				id: 2,
				guildId: 'guild123',
				name: 'texttag',
				content: 'Just some text content',
				createdBy: 'user123',
				createdAt: mockDate,
				useCount: 5,
			});

			await tag.execute(context);

			expect(mockReply).toHaveBeenCalledWith(
				expect.objectContaining({
					ephemeral: true,
					embeds: expect.arrayContaining([
						expect.objectContaining({
							data: expect.objectContaining({
								title: 'Preview: texttag',
								description: 'Just some text content',
							}),
						}),
					]),
				})
			);
		});

		it('should throw error if tag not found', async () => {
			mockGetString.mockReturnValue('nonexistent');
			vi.mocked(tagUtils.getTag).mockResolvedValue(null);

			await expect(tag.execute(context)).rejects.toThrow();
		});
	});

	describe('list subcommand', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('list');
		});

		it('should list all tags', async () => {
			vi.mocked(tagUtils.getAllTags).mockResolvedValue([
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
			]);

			await tag.execute(context);

			expect(tagUtils.getAllTags).toHaveBeenCalledWith('guild123');
			expect(mockReply).toHaveBeenCalledWith(
				expect.objectContaining({
					ephemeral: true,
					embeds: expect.any(Array),
				})
			);
		});

		it('should show message when no tags exist', async () => {
			vi.mocked(tagUtils.getAllTags).mockResolvedValue([]);

			await tag.execute(context);

			expect(mockReply).toHaveBeenCalledWith(
				expect.objectContaining({
					ephemeral: true,
					embeds: expect.arrayContaining([
						expect.objectContaining({
							data: expect.objectContaining({
								description: expect.stringContaining('No tags available'),
							}),
						}),
					]),
				})
			);
		});
	});

	describe('remove subcommand', () => {
		beforeEach(() => {
			mockGetSubcommand.mockReturnValue('remove');
		});

		it('should delete tag successfully', async () => {
			mockGetString.mockReturnValue('testtag');
			vi.mocked(tagUtils.deleteTag).mockResolvedValue(true);

			await tag.execute(context);

			expect(tagUtils.deleteTag).toHaveBeenCalledWith('guild123', 'testtag', 'user123', false);
			expect(mockReply).toHaveBeenCalledWith(
				expect.objectContaining({
					ephemeral: true,
					embeds: expect.arrayContaining([
						expect.objectContaining({
							data: expect.objectContaining({
								title: '🗑️ Tag Removed',
							}),
						}),
					]),
				})
			);
		});

		it('should throw error if tag not found', async () => {
			mockGetString.mockReturnValue('nonexistent');
			vi.mocked(tagUtils.deleteTag).mockResolvedValue(false);

			await expect(tag.execute(context)).rejects.toThrow();
		});

		it('should handle unauthorized deletion', async () => {
			mockGetString.mockReturnValue('testtag');
			vi.mocked(tagUtils.deleteTag).mockRejectedValue(
				new Error('You can only delete tags you created.')
			);

			await expect(tag.execute(context)).rejects.toThrow();
		});
	});

	describe('autocomplete', () => {
		it('should return matching tag names', async () => {
			const mockInteraction = {
				guildId: 'guild123',
				options: {
					getFocused: () => 'test',
				},
			} as unknown as AutocompleteInteraction;

			vi.mocked(tagUtils.searchTags).mockResolvedValue(['test1', 'test2', 'testing']);

			const autocomplete = tag.autocomplete as (
				interaction: AutocompleteInteraction
			) => Promise<Array<{ name: string; value: string }>>;
			const result = await autocomplete(mockInteraction);

			expect(tagUtils.searchTags).toHaveBeenCalledWith('guild123', 'test');
			expect(result).toEqual([
				{ name: 'test1', value: 'test1' },
				{ name: 'test2', value: 'test2' },
				{ name: 'testing', value: 'testing' },
			]);
		});

		it('should return empty array if no guildId', async () => {
			const mockInteraction = {
				guildId: null,
				options: {
					getFocused: () => 'test',
				},
			} as unknown as AutocompleteInteraction;

			const autocomplete = tag.autocomplete as (
				interaction: AutocompleteInteraction
			) => Promise<Array<{ name: string; value: string }>>;
			const result = await autocomplete(mockInteraction);

			expect(result).toEqual([]);
		});
	});
});
