import type { CommandInteraction } from 'discord.js';
import { logUser } from '../helpers/logUser';

export function replyFactory(
	interaction: CommandInteraction,
	logger: Console
): CommandContext['reply'] {
	return async function reply(options) {
		if (interaction.deferred) {
			try {
				await interaction.editReply(options);
			} catch (error) {
				logger.error('Failed to edit reply to interaction:', error);
				await interaction.followUp(options);
			}
		} else {
			try {
				if (typeof options === 'string') {
					await interaction.reply(options);
				} else if (
					!('shouldMention' in options) ||
					options.shouldMention === undefined ||
					options.shouldMention
				) {
					// Doesn't say whether to mention, default to `true`
					await interaction.reply(options);
				} else {
					// Really shouldn't mention
					await interaction.reply({
						...options,
						allowedMentions: { users: [] },
					});
				}
			} catch (error) {
				logger.error('Failed to reply to interaction:', error);
			}
		}

		if (typeof options !== 'string' && 'ephemeral' in options && options?.ephemeral === true) {
			// FIXME: We didn't actually send the reply if we errored out
			logger.info(
				`Sent ephemeral reply to User ${logUser(interaction.user)}: ${JSON.stringify(options)}`
			);
		}
	};
}