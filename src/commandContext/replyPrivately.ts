import type { CommandInteraction } from 'discord.js';
import { replyPrivately as _replyPrivately } from '../helpers/actions/messages/replyToMessage';
import { logUser } from '../helpers/logUser';

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
			const reply = await _replyPrivately(interaction, options, viaDm);
			if (reply === false) {
				logger.info(`User ${logUser(interaction.user)} has DMs turned off.`);
			}
		}
	};
}
