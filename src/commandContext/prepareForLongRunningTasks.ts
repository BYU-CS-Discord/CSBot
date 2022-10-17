// External dependencies
import type { RepliableInteraction } from 'discord.js';

// Internal dependencies
import * as logger from '../logger';

export function prepareForLongRunningTasksFactory(
	interaction: RepliableInteraction
): CommandContext['prepareForLongRunningTasks'] {
	return async function prepareForLongRunningTasks(ephemeral) {
		try {
			await interaction.deferReply({ ephemeral });
		} catch (error) {
			logger.error('Failed to defer reply to interaction:', error);
		}
	};
}
