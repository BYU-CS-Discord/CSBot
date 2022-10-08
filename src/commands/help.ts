import { appVersion, repo } from '../constants/meta';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const builder = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Prints useful info about the bot')
	.setDMPermission(true);

export const help: GlobalCommand = {
	commandBuilder: builder,
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
