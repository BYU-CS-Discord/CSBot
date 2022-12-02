import type { User } from 'discord.js';
import * as logger from '../logger';
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
	async execute({ client, user, interaction, reply, replyPrivately, guild, source }) {
		const otherUser = interaction.options.getUser(UserParamName, false);

		if (otherUser) {
			if (source === 'dm') {
				// Shouldn't try to snoop other users privately. Only bot or self.
				if (otherUser.id !== user.id && otherUser.id !== client.user.id) {
					return await replyPrivately("That user isn't here!");
				}
			} else {
				// Shouldn't try to snoop users that aren't in the guild
				try {
					await guild.members.fetch(otherUser);
				} catch (error) {
					// Throw unrelated errors
					if (!(error instanceof DiscordAPIError)) {
						// I know we're improving our error handling. Just throw this error once we have that in place:
						logger.error(error);
						return await replyPrivately('Something went wrong.');
					}
					if (error.code !== DiscordErrorCode.UNKNOWN_MEMBER) {
						// I know we're improving our error handling. Just throw this error once we have that in place:
						logger.error(error);
						return await replyPrivately('An unhandled API error happened.');
					}

					// If error says that the user isn't a guild member, complain.
					return await replyPrivately("That user isn't here!");
				}
			}
		}

		const target: User = otherUser ?? user;

		const url = target.avatarURL({ extension: 'png', size: 2048 });
		if (url === null || !url) {
			return await replyPrivately("This user doesn't seem to have an avatar!");
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
