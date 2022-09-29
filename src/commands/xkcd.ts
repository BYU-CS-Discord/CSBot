import { ApplicationCommandOptionType } from 'discord.js';

export const xkcd: GlobalCommand = {
	name: 'xkcd',
	description: 'Fetches the most recent xkcd comic, or a selected ',
	requiresGuild: false,
	options: [
		{
			name: 'number',
			description: 'The index number of the comic you would like to have',
			type: ApplicationCommandOptionType.Integer,
		},
	],
	async execute({ options, reply, sendTyping }) {
		// TODO: finish this command
		sendTyping;
		const param = options[0];
		if (param?.value !== undefined) {
			await reply(`You sent a param! ${param.value as number}`);
		} else {
			await reply('You did not send a param.');
		}
	},
};
