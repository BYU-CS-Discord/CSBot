import type { GuildEmoji, ImageURLOptions } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { emoji } from './emoji';

jest.mock('../logger');

describe('profile', () => {
	const mockReply = jest.fn<Promise<void>, [content: unknown]>();
	const mockEmojiName = jest.fn<string | null, []>();
	const mockEmojiURL = jest.fn<string | null, [options?: ImageURLOptions | undefined]>();
	const mockShouldRespondEphemeral = jest.fn<boolean | null, []>();

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

	test('Throws an error when the target emoji does not exist', async () => {
		mockEmojiName.mockReturnValue('emoji not here');
		await expect(emoji.execute(context)).rejects.toThrow('Emoji emoji not here was not found');
	});

	test('Returns the url of the target emoji ephemerally', async () => {
		await expect(emoji.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			content: mockEmojiName() as string,
			embeds: [
				new EmbedBuilder({
					title: mockEmojiName() as string,
					image: { url: testEmojiURL },
				}),
			],
			ephemeral: mockShouldRespondEphemeral() as boolean,
		});
	});

	test('Returns the url of the target emoji ephemerally with undefined respondEphemeral', async () => {
		mockShouldRespondEphemeral.mockReturnValue(null);
		await expect(emoji.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			content: mockEmojiName() as string,
			embeds: [
				new EmbedBuilder({
					title: mockEmojiName() as string,
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
			content: mockEmojiName() as string,
			embeds: [
				new EmbedBuilder({
					title: mockEmojiName() as string,
					image: { url: testEmojiURL },
				}),
			],
			ephemeral: mockShouldRespondEphemeral() as boolean,
		});
	});
});
