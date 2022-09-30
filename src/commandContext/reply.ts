import type { CommandInteraction, InteractionReplyOptions } from 'discord.js';
import { logUser } from '../helpers/logUser';

export function replyFactory(
	interaction: CommandInteraction,
	logger: Console
): CommandContext['reply'] {
	return async function reply(options) {
		let didFailToReply = false;

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
					// We should mention, or caller didn't specify.
					// discord.js defaults to `true`, so we let it do that:
					const intermediateOptions: InteractionReplyOptions & { shouldMention?: boolean } = {
						...options,
					};
					delete intermediateOptions.shouldMention;
					await interaction.reply(intermediateOptions);
				} else {
					// Really shouldn't mention anyone
					const intermediateOptions: InteractionReplyOptions & { shouldMention?: boolean } = {
						...options,
					};
					delete intermediateOptions.shouldMention;
					await interaction.reply({
						...intermediateOptions,
						allowedMentions: { users: [], repliedUser: false },
					});
				}
			} catch (error) {
				logger.error('Failed to reply to interaction:', error);
				didFailToReply = true;
			}
		}

		if (
			typeof options !== 'string' &&
			'ephemeral' in options &&
			options?.ephemeral === true &&
			!didFailToReply
		) {
			logger.info(
				`Sent ephemeral reply to User ${logUser(interaction.user)}: ${JSON.stringify(options)}`
			);
		}
	};
}
