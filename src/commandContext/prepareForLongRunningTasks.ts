import type { RepliableInteraction } from 'discord.js';

import { error } from '../logger.js';

export function prepareForLongRunningTasksFactory(
	interaction: RepliableInteraction
): CommandContext['prepareForLongRunningTasks'] {
	return async function prepareForLongRunningTasks(ephemeral) {
		try {
			await interaction.deferReply({ ephemeral });
		} catch (error_) {
			error('Failed to defer reply to interaction:', error_);
		}
	};
}
