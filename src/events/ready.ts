import type { Client, ClientPresence } from 'discord.js';
import { ActivityType } from 'discord.js';

import { appVersion } from '../constants/meta.js';
import { ensureCommandDeployments } from '../helpers/actions/ensureCommandDeployments.js';
import { onEvent } from '../helpers/onEvent.js';
import { info } from '../logger.js';

/**
 * The event handler for when the Discord Client is ready for action
 */
export const ready = onEvent('ready', {
	once: true,
	async execute(client) {
		info(`Starting ${client.user.username} v${appVersion}...`);

		// Sanity check for commands
		info('Verifying command deployments...');
		await ensureCommandDeployments(client);

		// Set user activity
		info('Setting user activity');
		setActivity(client);

		info('Ready!');
	},
});

function setActivity(client: Client<true>): ClientPresence {
	// Let users know where to go for info
	return client.user.setActivity({
		type: ActivityType.Playing,
		name: '/help for info',
	});
}
