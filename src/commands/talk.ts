import { SlashCommandBuilder } from 'discord.js';

const builder = new SlashCommandBuilder()
	.setName('talk')
	.setDescription(
		'Uses Dectalk to speak the given message - sends a recording if in a text channel, speaks if in a voice chat'
	)
	.addStringOption(option => option.setName('message').setDescription('The message to speak'));

export const talk: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute() {
		// TODO
	},
};
