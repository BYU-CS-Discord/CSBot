import { SlashCommandBuilder } from 'discord.js';

const builder = new SlashCommandBuilder()
	.setName('setreactboard')
	.setDescription('Creates or modifies reaction board in this server')
	.addChannelOption(option =>
		option
			.setName('channel')
			.setDescription('The channel where reactboard posts will be posted')
			.setRequired(true))
	.addIntegerOption(option =>
		option
			.setName('threshold')
			.setDescription(
				'The minimum number of reacts a message should receive before being put on the board'
			)
			.setRequired(true))
	.addStringOption(option =>
		option.setName('react').setDescription('The react to be tracked (defaults to ⭐')
	);

export const setReactboard: GuildedCommand = {
	info: builder,
	requiresGuild: true,
	async execute() {

	},
};
