import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { isAdmin, setUserSmitten } from '../helpers/smiteUtils.js';
import { UserMessageError } from '../helpers/UserMessageError.js';

const builder = new SlashCommandBuilder()
	.setName('smite')
	.setDescription('Smite a user, preventing them from using bot commands')
	.addUserOption(option =>
		option.setName('user').setDescription('The user to smite').setRequired(true)
	);

const ODIN_SMITING_THOR_GIF = 'https://cdn.discordapp.com/attachments/781563734098575410/1083403217553084446/smite.gif?ex=68fb93df&is=68fa425f&hm=83b4a865179f0dd6fb1312f535c2a730673709734470c0095dd2a432908bfcba&';
const WACK_IMAGE = 'https://i.kym-cdn.com/entries/icons/original/000/033/758/Screen_Shot_2020-04-28_at_12.21.48_PM.png';
export const smite: GuildedCommand = {
	info: builder,
	requiresGuild: true,
	async execute({ reply, options, member, guild, client, user }): Promise<void> {
		const targetUser = options.getUser('user', true);
		const targetMember = await guild.members.fetch(targetUser.id);

		// Check if the executor is an admin
		if (!isAdmin(member)) {
			// Non-admins get smitten for 60 seconds for trying to use this command
			await setUserSmitten(user.id, guild.id, true);
			
			// Auto-unsmite after 60 seconds
			setTimeout(async () => {
				await setUserSmitten(user.id, guild.id, false);
			}, 60000);

			await reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('⚡ Hubris! ⚡')
						.setDescription(
							`You dare try to wield the power of the gods?\n\nYou have been smitten for 60 seconds for your insolence!`
						)
						.setImage(ODIN_SMITING_THOR_GIF)
						.setColor(0xff0000), // Red
				],
			});
			return;
		}

		// Check if user is trying to smite themselves
		if (targetUser.id === user.id) {
			await reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Wack.')
						.setImage(WACK_IMAGE)
						.setColor(0xffa500), // Orange
				],
			});
			return;
		}

		// Check if user is trying to smite the bot
		if (targetUser.id === client.user.id) {
			// Smite the user who tried to smite the bot instead
			await setUserSmitten(user.id, guild.id, true);

			await reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('You fool!')
						.setDescription(
							`Only now do you understand.\n\nYou have been smitten for attempting to smite ${client.user.username}.`
						)
						.setImage(ODIN_SMITING_THOR_GIF)
						.setColor(0xff0000), // Red
				],
			});
			return;
		}

		// Check if target is an admin
		if (isAdmin(targetMember)) {
			throw new UserMessageError('You cannot smite an administrator.');
		}

		// Smite the target user
		await setUserSmitten(targetUser.id, guild.id, true);

		await reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('⚡ SMITTEN! ⚡')
					.setDescription(
						`${targetUser} has been smitten by the gods!\n\nThey can no longer use bot commands for the next hour.`
					)
					.setImage(ODIN_SMITING_THOR_GIF)
					.setColor(0x5865f2), // Blurple
			],
		});
	},
};
