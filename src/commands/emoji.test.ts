import { EmbedBuilder, GuildEmoji, ImageURLOptions } from 'discord.js';
import { emoji } from './emoji';

jest.mock('../logger');

describe('profile', () => {
	const mockReply = jest.fn<Promise<void>, [content: unknown]>();
	const mockEmojiName = jest.fn<string | null, []>();
	const mockEmojiURL = jest.fn<string | null, [options?: ImageURLOptions | undefined]>();

	const testEmojiURL = 'https://example.com/emojis/1234567890/abcdef1234567890.png';

	let context: TextInputCommandContext;
	let existingEmoji;

	beforeEach(() => {
		existingEmoji = {
			name: 'existing emoji',
			url: testEmojiURL,
		} as unknown as GuildEmoji;

		context = {
			interaction: {
				options: {
					client: {
						emojis: {
							cache: [existingEmoji],
						},
					},
					getString: mockEmojiName,
				},
			},
			reply: mockReply,
		} as unknown as TextInputCommandContext;

		mockEmojiName.mockReturnValue('existing emoji');
		mockEmojiURL.mockReturnValue(testEmojiURL);
	});

	test('Throws an error when no input is provided', async () => {
		mockEmojiName.mockReturnValue(null);
		await expect(emoji.execute(context)).rejects.toThrow('You must provide an emoji to search for');
	});

	test('Throws an error when the target emoji does not exist', async () => {
		mockEmojiName.mockReturnValue('emoji not here');
		await expect(emoji.execute(context)).rejects.toThrow('Emoji emoji not here was not found');
	});

	test('Returns the url of the target emoji', async () => {
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
			ephemeral: true,
		});
	});
});
