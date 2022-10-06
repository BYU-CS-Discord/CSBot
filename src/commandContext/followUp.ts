// External dependencies
import type { CommandInteraction, InteractionReplyOptions } from 'discord.js';

// Internal dependencies
import logger from '../logger';
import { sendMessageInChannel } from '../helpers/actions/messages/replyToMessage';

export function followUpFactory(interaction: CommandInteraction): CommandContext['followUp'] {
	return async function followUp(options) {
		if (
			typeof options !== 'string' &&
			'reply' in options &&
			options.reply === false &&
			interaction.channel
		) {
			return (
				(await sendMessageInChannel(interaction.channel, { ...options, reply: undefined })) ?? false
			);
		}
		try {
			if (typeof options === 'string') {
				return await interaction.followUp(options);
			}
			const intermediateOptions: InteractionReplyOptions & { reply?: boolean } = { ...options };
			delete intermediateOptions.reply;
			return await interaction.followUp(intermediateOptions);
		} catch (error) {
			logger.error('Failed to follow up on interaction:', error);
			return false;
		}
	};
}
