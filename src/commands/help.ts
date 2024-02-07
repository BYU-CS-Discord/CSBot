import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { appVersion, repo } from '../constants/meta.js';

const builder = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Prints useful info about the bot');

export const help: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ reply }) {
		const embed = new EmbedBuilder()
			.setTitle('Help')
			.setDescription(
				`To see the list of commands, type \`/\` in your message field.\n[Visit our GitHub](${repo.href}) for more details!`
			)
			.setFooter({ text: `v${appVersion}` });

		await reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};
