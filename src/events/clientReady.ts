import { Events } from 'discord.js';
import { Worker } from 'node:worker_threads';

import { appVersion } from '../constants/meta.ts';
import { deployCommands } from '../helpers/actions/deployCommands.ts';
import { revokeCommands } from '../helpers/actions/revokeCommands.ts';
import { onEvent } from '../helpers/onEvent.ts';
import { parseArgs } from '../helpers/parseArgs.ts';
import { verifyCommandDeployments } from '../helpers/actions/verifyCommandDeployments.ts';
import { info } from '../logger.ts';

/**
 * The event handler for when the Discord Client is ready for action
 */
export const clientReady = onEvent(Events.ClientReady, {
	once: true,
	async execute(client) {
		info(`Starting ${client.user.username} v${appVersion}...`);

		const args = parseArgs();

		// If we're only here to deploy commands, do that and then exit
		if (args.deploy) {
			await deployCommands(client);
			await client.destroy();
			return;
		}

		// If we're only here to revoke commands, do that and then exit
		if (args.revoke) {
			await revokeCommands(client);
			await client.destroy();
			return;
		}

		// Sanity check for commands
		info('Verifying command deployments...');
		await verifyCommandDeployments(client);

		// Start uptime ping
		const UPTIME_URL = process.env['UPTIME_URL'];
		if (UPTIME_URL) {
			const UPTIME_INTERVAL_SECONDS = process.env['UPTIME_INTERVAL_SECONDS'];
			new Worker(new URL('../workers/uptime.ts', import.meta.url), {
				name: 'uptime-ping',
				env: { UPTIME_URL, UPTIME_INTERVAL_SECONDS },
			});
		}

		info('Ready!');
	},
});
