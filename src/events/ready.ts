import type { Client, ClientPresence } from 'discord.js';
import { ActivityType } from 'discord.js';

import { deployCommands } from '../helpers/actions/deployCommands';
import { revokeCommands } from '../helpers/actions/revokeCommands';
import { verifyCommandDeployments } from '../helpers/actions/verifyCommandDeployments';
import { appVersion } from '../constants/meta';
import { onEvent } from '../helpers/onEvent';
import { parseArgs } from '../helpers/parseArgs';
import { info } from '../logger.js';

/**
 * The event handler for when the Discord Client is ready for action
 */
export const ready = onEvent('ready', {
	once: true,
	async execute(client) {
		info(`Starting ${client.user.username} v${appVersion}...`);

		const args = parseArgs();

		// If we're only here to deploy commands, do that and then exit
		if (args.deploy) {
			await deployCommands(client);
			client.destroy();
			return;
		}

		// If we're only here to revoke commands, do that and then exit
		if (args.revoke) {
			await revokeCommands(client);
			client.destroy();
			return;
		}

		// Sanity check for commands
		info('Verifying command deployments...');
		await verifyCommandDeployments(client);

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
