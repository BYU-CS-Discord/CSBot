import { ensureCommandDeploymentsForGuild } from '../helpers/actions/ensureCommandDeployments.js';
import { onEvent } from '../helpers/onEvent.js';
import { error as logErr, debug as logDebug } from '../logger.js';

/**
 * The event handler for when the bot joins a guild.
 */
export const guildCreate = onEvent('guildCreate', {
	once: false,
	async execute(guild) {
		logDebug(`Joined guild ${guild.id} (${guild.name}). Deploying guild commands...`);
		// Deploy guild commands
		try {
			logDebug(`Verifying command deployments...`);
			await ensureCommandDeploymentsForGuild(guild);
		} catch (error) {
			logErr(`Failed to deploy commands for guild ${guild.id} (${guild.name}).`, error);
		}
	},
});
