import type { CommandInteraction } from 'discord.js';

export function sendTypingFactory(
	interaction: CommandInteraction,
	logger: Console
): CommandContext['sendTyping'] {
	return function sendTyping() {
		void interaction.channel?.sendTyping();
		logger.debug(`Typing in channel ${interaction.channel?.id ?? 'undefined'}`);
	};
}
