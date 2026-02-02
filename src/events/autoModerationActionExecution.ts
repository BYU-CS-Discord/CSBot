import { AttachmentBuilder, AutoModerationActionType, AutoModerationRuleTriggerType } from 'discord.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { onEvent } from '../helpers/onEvent.js';
import { debug, error, info } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '..', 'assets');

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
			const attachment = new AttachmentBuilder(path.join(assetsDir, 'christian-server.jpg'), {
				name: 'christian-server.jpg',
			});
			await channel.send({
				content: `Tsk tsk, <@${actionExecution.userId}>`,
				files: [attachment],
			});
		} catch (error_) {
			error('Failed to handle AutoMod action execution:', error_);
		}
	},
});
