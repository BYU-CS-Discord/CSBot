import { appVersion, repo } from '../constants/meta';
import { EmbedBuilder } from 'discord.js';

export const help: GlobalCommand = {
	name: 'help',
	description: 'Prints useful info about the bot',
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
