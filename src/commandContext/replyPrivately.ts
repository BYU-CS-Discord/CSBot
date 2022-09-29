import type { CommandInteraction } from 'discord.js';
import { logUser } from '../helpers/logUser';
import { replyWithPrivateMessage } from '../helpers/actions/messages/replyToMessage';

export function replyPrivatelyFactory(
	interaction: CommandInteraction,
	logger: Console
): CommandContext['replyPrivately'] {
	return async function replyPrivately(options, viaDm: boolean = false) {
		if (viaDm) {
			// We need to say *something* to the interaction itself, or Discord will think we died.
			const content = ':paperclip: Check your DMs';
			if (interaction.deferred) {
				try {
					await interaction.editReply(content);
				} catch (error) {
					logger.error('Failed to edit reply to interaction:', error);
				}
			} else {
				try {
					await interaction.reply({ content, ephemeral: true });
				} catch (error) {
					logger.error('Failed to reply to interaction:', error);
				}
			}
		}
		if (interaction.deferred && !viaDm) {
			try {
				if (typeof options === 'string') {
					await interaction.followUp({ ephemeral: true, content: options });
				} else {
					await interaction.followUp({ ...options, ephemeral: true });
				}
			} catch (error) {
				logger.error('Failed to follow up on interaction:', error);
			}
		} else {
			const reply = await replyWithPrivateMessage(interaction, options, viaDm);
			if (reply === false) {
				// We failed to send the DM, probably because the user has those disabled.
				// `replyWithPrivateMessage` already handled telling the user this.
				logger.info(`User ${logUser(interaction.user)} has DMs turned off.`);
			}
		}
	};
}
