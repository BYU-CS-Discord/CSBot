import { DiscordAPIError, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as logger from '../logger';

const EmojiName = 'emojiname';

const builder = new SlashCommandBuilder()
	.setName('emoji')
	.setDescription('Responds with the picture used for the mentioned emoji')
	.addStringOption(option =>
		option.setName(EmojiName).setDescription('Name of the emoji to search for').setRequired(true)
	);

export const emoji: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply, interaction }): Promise<void> {
		const emojiName = interaction.options.getString(EmojiName);
		if (emojiName === null) {
			throw new Error('You must provide an emoji to search for');
		}

		const emojiCache = interaction.options.client.emojis.cache;
		const foundEmoji = emojiCache.find(emojiElement => emojiElement.name === emojiName);
		if (!foundEmoji) {
			throw new Error(`Emoji ${emojiName} was not found`);
		}

		const content = emojiName;
		const url = foundEmoji.url;
		const embed = new EmbedBuilder().setTitle(emojiName).setImage(url);

		await reply({ content, embeds: [embed], ephemeral: true });
	},
};
