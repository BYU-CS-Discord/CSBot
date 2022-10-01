import { ApplicationCommandOptionType } from 'discord.js';

export const profile: GlobalCommand = {
	name: 'profile',
	description: 'Responds with the Profile Picture of the mentioned user',
	options: [
		{
			name: 'user',
			description: 'The user to get the profile picture of',
			type: ApplicationCommandOptionType.User,
		},
	],
	requiresGuild: false,
	async execute({ interaction, options }) {
		const user = interaction.user;
		const param = options[0];
		if (param?.value === undefined) {
			await interaction.reply({
				content: user.avatarURL({ extension: 'png', size: 2048 }) as string,
				ephemeral: true,
			});
		} else if (param?.user?.avatar !== null) {
			await interaction.reply({
				content: param?.user?.avatarURL({ extension: 'png', size: 2048 }) as string,
				ephemeral: false,
			});
		} else {
			await interaction.reply({
				content: "This user doesn't have an avatar",
				ephemeral: true,
			});
		}
	},
};
