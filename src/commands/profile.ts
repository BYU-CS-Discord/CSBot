import type { User } from 'discord.js';
import { DiscordAPIError, EmbedBuilder, SlashCommandBuilder, userMention } from 'discord.js';
import { DiscordErrorCode } from '../helpers/DiscordErrorCode';

const UserParamName = 'user';

const builder = new SlashCommandBuilder()
	.setName('profile')
	.setDescription('Responds with the Profile Picture of the mentioned user')
	.addUserOption(option =>
		option.setName(UserParamName).setDescription('The user to get the profile picture of')
	);

export const profile: GlobalCommand = {
	info: builder,
	requiresGuild: false,
	async execute({ client, user, options, reply, guild, source }) {
		const otherUser = options.getUser(UserParamName);

		if (otherUser) {
			if (source === 'dm') {
				// Shouldn't try to snoop other users privately. Only bot or self.
				if (otherUser.id !== user.id && otherUser.id !== client.user.id) {
					throw new Error("That user isn't here!");
				}
			} else {
				// Shouldn't try to snoop users that aren't in the guild
				try {
					await guild.members.fetch(otherUser);
				} catch (error) {
					// Throw unrelated errors
					if (!(error instanceof DiscordAPIError)) {
						throw error;
					}
					if (error.code !== DiscordErrorCode.UNKNOWN_MEMBER) {
						throw error;
					}

					// If error says that the user isn't a guild member, complain.
					throw new Error("That user isn't here!");
				}
			}
		}

		const target: User = otherUser ?? user;

		const url = target.avatarURL({ extension: 'png', size: 2048 });
		if (url === null || !url) {
			throw new Error("This user doesn't seem to have an avatar!");
		}

		// Ping the target user if not self
		const pronoun =
			target.id === client.user.id
				? 'My' // bot user
				: target.id === user.id
					? 'Your' // caller
					: `${userMention(target.id)}'s`;

		const content = `${pronoun} profile:`;
		const embed = new EmbedBuilder().setTitle(target.username).setImage(url);
		await reply({ content, embeds: [embed] });
	},
};
