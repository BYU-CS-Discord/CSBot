import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { isAdmin, setUserSmitten } from '../helpers/smiteUtils.js';
import { UserMessageError } from '../helpers/UserMessageError.js';

const builder = new SlashCommandBuilder()
	.setName('unsmite')
	.setDescription('[ADMIN] Unsmite a user, allowing them to use bot commands again')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addUserOption(option =>
		option.setName('user').setDescription('The user to unsmite').setRequired(true)
	);

export const unsmite: GuildedCommand = {
	info: builder,
	requiresGuild: true,
	async execute({ reply, options, member, guild }): Promise<void> {
		const targetUser = options.getUser('user', true);

		// Check if the executor is an admin
		if (!isAdmin(member)) {
			throw new UserMessageError("You don't have permission to use this command.");
		}

		// Unsmite the target user
		await setUserSmitten(targetUser.id, guild.id, false);

		await reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('✨ Mercy Granted ✨')
					.setDescription(
						`${targetUser} has been unsmitten!\n\nThey can now use bot commands again.`
					)
					.setColor(0x57f287), // Green
			],
		});
	},
};
