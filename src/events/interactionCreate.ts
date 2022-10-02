// TODO tests

import type { Interaction } from 'discord.js';
import { handleInteraction } from '../handleInteraction';

import { getLogger } from '../logger';
const logger = getLogger();

/**
 * The event handler for Discord Interactions (usually chat commands)
 * Uses the handleInteraction script - // TODO consolidate these scripts, handleInteraction is unnecessary
 */
export const interactionCreate: EventHandler = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction: Interaction) {
		if (interaction.isCommand()) {
			try {
				await handleInteraction(interaction);
			} catch (error) {
				logger.error('Failed to handle interaction:', error);
			}
		}
	},
};
