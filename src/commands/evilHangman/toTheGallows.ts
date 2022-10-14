import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { appVersion } from '../../constants/meta';

const builder = new SlashCommandBuilder()
	.setName('tothegallows')
	.setDescription('Begins a new game of Evil Hangman');

export const toTheGallows: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply }) {
		const embed = new EmbedBuilder()
			.setTitle('Evil Hangman')
			.setDescription('Placeholder')
			.setFooter({ text: `v${appVersion}` });

		await reply({
			embeds: [embed],
		});
	},
};
