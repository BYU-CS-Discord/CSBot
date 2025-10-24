import { AutoModerationActionType, AutoModerationRuleTriggerType } from 'discord.js';

import { onEvent } from '../helpers/onEvent.js';
import { debug, error, info } from '../logger.js';

/**
 * The event handler for AutoMod action executions
 * Sends an image when AutoMod deletes a message due to profanity or custom keywords
 */
export const autoModerationActionExecution = onEvent('autoModerationActionExecution', {
	once: false,
	async execute(actionExecution) {
		try {
			// Check if the action was blocking a message (deletion)
			const isBlockMessage = actionExecution.action.type === AutoModerationActionType.BlockMessage;

			if (!isBlockMessage) {
				// Not a message deletion, ignore
				return;
			}

			// Check if the trigger was keyword-based (profanity or custom word list)
			const isKeywordTrigger =
				actionExecution.ruleTriggerType === AutoModerationRuleTriggerType.Keyword ||
				actionExecution.ruleTriggerType === AutoModerationRuleTriggerType.KeywordPreset;

			if (!isKeywordTrigger) {
				// Not a keyword trigger, ignore
				debug('AutoMod action was not keyword-based, ignoring');
				return;
			}

			// Get the channel where the infraction happened
			const channel = actionExecution.channel;
			if (!channel?.isTextBased()) {
				debug('AutoMod action occurred in non-text channel, ignoring');
				return;
			}

			info(
				`AutoMod blocked message in ${channel.name} - Rule: ${actionExecution.autoModerationRule?.name ?? 'Unknown'}, Matched: "${actionExecution.matchedKeyword}"`
			);

			// Send a message mentioning the user with the Christian server image
			await channel.send({
				content: `Tsk tsk, <@${actionExecution.userId}>`,
				files: [
					'https://media.discordapp.net/attachments/357672131691282437/968540850453884988/christian-server.jpg?ex=68fba175&is=68fa4ff5&hm=bff87ada39923c27edad25ff90ad3ea79f96f456ddb59931571e3ca9f5d0ddc0&=&format=webp&width=1434&height=944',
				],
			});
		} catch (error_) {
			error('Failed to handle AutoMod action execution:', error_);
		}
	},
});
