import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { GuildEmoji, ImageURLOptions } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import { emoji } from './emoji.js';

vi.mock('../logger.js');

describe('profile', () => {
	const mockReply = vi.fn<[content: unknown], Promise<void>>();
	const mockEmojiName = vi.fn<[], string | undefined>();
	const mockEmojiURL = vi.fn<[options?: ImageURLOptions | undefined], string | null>();
	const mockShouldRespondEphemeral = vi.fn<[], boolean | null>();

	const testEmojiURL = 'https://example.com/emojis/1234567890/abcdef1234567890.png';

	let context: TextInputCommandContext;
	let existingEmoji;

	beforeEach(() => {
		existingEmoji = {
			name: 'existing emoji',
			url: testEmojiURL,
		} as unknown as GuildEmoji;

		context = {
			client: {
				emojis: {
					cache: [existingEmoji],
				},
			},
			options: {
				getString: mockEmojiName,
				getBoolean: mockShouldRespondEphemeral,
			},
			reply: mockReply,
		} as unknown as TextInputCommandContext;

		mockEmojiName.mockReturnValue('existing emoji');
		mockEmojiURL.mockReturnValue(testEmojiURL);
		mockShouldRespondEphemeral.mockReturnValue(true);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('Throws an error when the target emoji does not exist', async () => {
		mockEmojiName.mockReturnValue('emoji not here');
		await expect(emoji.execute(context)).rejects.toThrow('Emoji emoji not here was not found');
	});

	test('Returns the url of the target emoji ephemerally', async () => {
		await expect(emoji.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			content: mockEmojiName(),
			embeds: [
				new EmbedBuilder({
					title: mockEmojiName(),
					image: { url: testEmojiURL },
				}),
			],
			ephemeral: mockShouldRespondEphemeral(),
		});
	});

	test('Returns the url of the target emoji ephemerally with undefined respondEphemeral', async () => {
		mockShouldRespondEphemeral.mockReturnValue(null);
		await expect(emoji.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			content: mockEmojiName(),
			embeds: [
				new EmbedBuilder({
					title: mockEmojiName(),
					image: { url: testEmojiURL },
				}),
			],
			ephemeral: true, // slash command defaults to true when no respondEphemeral boolean is given
		});
	});

	test('Returns the url of the target emoji non-ephemerally', async () => {
		mockShouldRespondEphemeral.mockReturnValue(false);
		await expect(emoji.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			content: mockEmojiName(),
			embeds: [
				new EmbedBuilder({
					title: mockEmojiName(),
					image: { url: testEmojiURL },
				}),
			],
			ephemeral: mockShouldRespondEphemeral(),
		});
	});
});
