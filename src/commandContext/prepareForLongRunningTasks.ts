// External dependencies
import type { CommandInteraction } from 'discord.js';

// Internal dependencies
import logger from '../logger';

export function prepareForLongRunningTasksFactory(
	interaction: CommandInteraction
): CommandContext['prepareForLongRunningTasks'] {
	return async function prepareForLongRunningTasks(ephemeral) {
		try {
			await interaction.deferReply({ ephemeral });
		} catch (error) {
			logger.error('Failed to defer reply to interaction:', error);
		}
	};
}
