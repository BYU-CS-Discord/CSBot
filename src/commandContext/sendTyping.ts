// External dependencies
import type { CommandInteraction } from 'discord.js';

// Internal dependencies
import logger from '../logger';

export function sendTypingFactory(interaction: CommandInteraction): CommandContext['sendTyping'] {
	return function sendTyping() {
		void interaction.channel?.sendTyping();
		logger.debug(`Typing in channel ${interaction.channel?.id ?? 'undefined'}`);
	};
}
