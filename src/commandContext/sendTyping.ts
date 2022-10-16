// Internal dependencies
import * as logger from '../logger';

export function sendTypingFactory(interaction: RepliableInteraction): CommandContext['sendTyping'] {
	return function sendTyping() {
		void interaction.channel?.sendTyping();
		logger.debug(`Typing in channel ${interaction.channel?.id ?? 'undefined'}`);
	};
}
