import { EmbedBuilder, GuildEmoji, ImageURLOptions } from 'discord.js';
import { emoji } from './emoji';

jest.mock('../logger');

describe('profile', () => {
	const mockReply = jest.fn<Promise<void>, [content: unknown]>();
	const mockEmojiName = jest.fn<string | null, []>();
	const mockEmojiURL = jest.fn<string | null, [options?: ImageURLOptions | undefined]>();
	const mockRespondEphemeral = jest.fn<boolean | null, []>();

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
					getBoolean: mockRespondEphemeral,
				},
			},
			reply: mockReply,
		} as unknown as TextInputCommandContext;

		mockEmojiName.mockReturnValue('existing emoji');
		mockEmojiURL.mockReturnValue(testEmojiURL);
		mockRespondEphemeral.mockReturnValue(true);
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
			ephemeral: mockRespondEphemeral() as boolean,
		});
	});

	test('Returns the url of the target emoji ephemerally with undefined respondEphemeral', async () => {
		mockRespondEphemeral.mockReturnValue(null);
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
		mockRespondEphemeral.mockReturnValue(false);
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
			ephemeral: mockRespondEphemeral() as boolean,
		});
	});
});
