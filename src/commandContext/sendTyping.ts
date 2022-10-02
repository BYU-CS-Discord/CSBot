import type { CommandInteraction } from 'discord.js';

import { getLogger } from '../logger';
const logger = getLogger();

export function sendTypingFactory(interaction: CommandInteraction): CommandContext['sendTyping'] {
	return function sendTyping() {
		void interaction.channel?.sendTyping();
		logger.debug(`Typing in channel ${interaction.channel?.id ?? 'undefined'}`);
	};
}
