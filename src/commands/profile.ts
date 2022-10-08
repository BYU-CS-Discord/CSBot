import { SlashCommandBuilder } from 'discord.js';

const builder = new SlashCommandBuilder()
	.setName('profile')
	.setDescription('Responds with the Profile Picture of the mentioned user')
	.addUserOption(option =>
		option.setName('user').setDescription('The user to get the profile picture of')
	);

export const profile: GlobalCommand = {
	commandBuilder: builder,
	requiresGuild: false,
	async execute({ user, options, reply }) {
		const param = options[0];
		const target = param ? param.user : user;
		// if the user is not null, then we will use that user, otherwise we will use the user that invoked the command.
		if (target) {
			const content = target.avatarURL({ extension: 'png', size: 2048 });
			await reply({
				content: content ?? "Something went wrong, This user doesn't have an avatar!",
				ephemeral: content === null,
			});
		} else {
			// This should never happen but we can guard against it,
			// in theory this may trigger if discord has an issue retrieving the user who invoked the command.
			await reply({
				content: "Something went wrong, There was an issue getting the user's avatar!",
				ephemeral: true,
			});
		}
	},
};
