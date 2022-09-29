import type { CommandInteraction } from 'discord.js';
import { sendMessageInChannel } from '../helpers/actions/messages/replyToMessage';

export function followUpFactory(
	interaction: CommandInteraction,
	logger: Console
): CommandContext['followUp'] {
	return async function followUp(options) {
		if (
			typeof options !== 'string' &&
			(!('reply' in options) || options.reply === false || options.reply === undefined) &&
			interaction.channel?.isTextBased() === true
		) {
			return (
				(await sendMessageInChannel(interaction.channel, { ...options, reply: undefined })) ?? false
			);
		}
		try {
			return await interaction.followUp(options);
		} catch (error) {
			logger.error('Failed to follow up on interaction:', error);
			return false;
		}
	};
}
