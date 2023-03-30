import { DiscordAPIError, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as logger from '../logger';

const EmojiName = 'emojiname';
const RespondEphemeral = 'respondephemeral';

const builder = new SlashCommandBuilder()
	.setName('emoji')
	.setDescription('Responds with the picture used for the mentioned emoji')
	.addStringOption(option =>
		option.setName(EmojiName).setDescription('Name of the emoji to search for').setRequired(true)
	)
	.addBooleanOption(option =>
		option
			.setName(RespondEphemeral)
			.setDescription(
				'When set to false this will respond with the emoji image so everyone can see. Default is true'
			)
	);

export const emoji: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply, interaction }): Promise<void> {
		const emojiName = interaction.options.getString(EmojiName, true);
		const respondEphemeral =
			interaction.options.getBoolean(RespondEphemeral) !== null
				? interaction.options.getBoolean(RespondEphemeral, true)
				: true; // This slash command defaults to sending an ephemeral message

		const emojiCache = interaction.options.client.emojis.cache;
		const foundEmoji = emojiCache.find(emojiElement => emojiElement.name === emojiName);
		if (!foundEmoji) {
			throw new Error(`Emoji ${emojiName} was not found`);
		}

		const content = emojiName;
		const url = foundEmoji.url;
		const embed = new EmbedBuilder().setTitle(emojiName).setImage(url);

		await reply({ content, embeds: [embed], ephemeral: respondEphemeral });
	},
};
