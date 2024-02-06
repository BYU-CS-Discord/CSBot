import type { InteractionReplyOptions, RepliableInteraction } from 'discord.js';

import { logUser } from '../helpers/logUser.js';
import { error, info } from '../logger.js';

export function replyFactory(interaction: RepliableInteraction): CommandContext['reply'] {
	return async function reply(options) {
		let didFailToReply = false;

		if (interaction.deferred) {
			try {
				await interaction.editReply(options);
			} catch (error_) {
				error('Failed to edit reply to interaction:', error_);
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
			} catch (error_) {
				error('Failed to reply to interaction:', error_);
				didFailToReply = true;
			}
		}

		if (
			typeof options !== 'string' &&
			'ephemeral' in options &&
			options.ephemeral === true &&
			!didFailToReply
		) {
			info(`Sent ephemeral reply to User ${logUser(interaction.user)}: ${JSON.stringify(options)}`);
		}
	};
}
