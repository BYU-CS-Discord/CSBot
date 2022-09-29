import type { CommandInteraction } from 'discord.js';

export function prepareForLongRunningTasksFactory(
	interaction: CommandInteraction,
	logger: Console
): CommandContext['prepareForLongRunningTasks'] {
	return async function prepareForLongRunningTasks(ephemeral) {
		try {
			await interaction.deferReply({ ephemeral });
		} catch (error) {
			logger.error('Failed to defer reply to interaction:', error);
		}
	};
}
