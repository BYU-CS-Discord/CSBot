import type { RepliableInteraction } from 'discord.js';

import { replyWithPrivateMessage } from '../helpers/actions/messages/replyToMessage.js';
import { logUser } from '../helpers/logUser.js';
import { error, info } from '../logger.js';

export function replyPrivatelyFactory(
	interaction: RepliableInteraction
): CommandContext['replyPrivately'] {
	return async function replyPrivately(options, viaDM: boolean = false) {
		if (viaDM) {
			// We need to say *something* to the interaction itself, or Discord will think we died.
			const content = ':paperclip: Check your DMs';
			if (interaction.deferred) {
				try {
					await interaction.editReply(content);
				} catch (error_) {
					error('Failed to edit reply to interaction:', error_);
				}
			} else {
				try {
					await interaction.reply({ content, ephemeral: true });
				} catch (error_) {
					error('Failed to reply to interaction:', error_);
				}
			}
		}
		if (interaction.deferred && !viaDM) {
			try {
				if (typeof options === 'string') {
					await interaction.followUp({ ephemeral: true, content: options });
				} else {
					await interaction.followUp({ ...options, ephemeral: true });
				}
			} catch (error_) {
				error('Failed to follow up on interaction:', error_);
			}
		} else {
			const reply = await replyWithPrivateMessage(interaction, options, viaDM);
			if (reply === false) {
				// We failed to send the DM, probably because the user has those disabled.
				// `replyWithPrivateMessage` already handled telling the user this.
				info(`User ${logUser(interaction.user)} has DMs turned off.`);
			}
		}
	};
}
