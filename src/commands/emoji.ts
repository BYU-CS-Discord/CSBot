import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { UserMessageError } from '../helpers/UserMessageError.js';

const EmojiName = 'emojiname';
const ShouldRespondEphemeral = 'respondephemeral';

const builder = new SlashCommandBuilder()
	.setName('emoji')
	.setDescription('Responds with the picture used for the mentioned emoji')
	.addStringOption(option =>
		option.setName(EmojiName).setDescription('Name of the emoji to search for').setRequired(true)
	)
	.addBooleanOption(option =>
		option
			.setName(ShouldRespondEphemeral)
			.setDescription(
				'When set to false this will respond with the emoji image so everyone can see. Default is true'
			)
	);

export const emoji: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply, client, options }): Promise<void> {
		const emojiName = options.getString(EmojiName, true);
		const shouldRespondEphemeral = options.getBoolean(ShouldRespondEphemeral) ?? true;

		const emojiCache = client.emojis.cache;
		const foundEmoji = emojiCache.find(emojiElement => emojiElement.name === emojiName);
		if (!foundEmoji) {
			throw new UserMessageError(`Emoji ${emojiName} was not found`);
		}

		const content = emojiName;
		const url = foundEmoji.url;
		const embed = new EmbedBuilder().setTitle(emojiName).setImage(url);

		await reply({ content, embeds: [embed], ephemeral: shouldRespondEphemeral });
	},
};
