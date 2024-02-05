// External dependencies
import type { RepliableInteraction } from 'discord.js';

// Internal dependencies
import { error } from '../logger';

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
