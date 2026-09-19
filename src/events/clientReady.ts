import { Events } from 'discord.js';
import { Worker } from 'node:worker_threads';

import { appVersion } from '../constants/meta.ts';
import { onEvent } from '../helpers/onEvent.ts';
import { registerCommands } from '../helpers/actions/registerCommands.ts';
import { info } from '../logger.ts';

/**
 * The event handler for when the Discord Client is ready for action
 */
export const clientReady = onEvent(Events.ClientReady, {
	once: true,
	async execute(client) {
		info(`Starting ${client.user.username} v${appVersion}...`);

		await registerCommands(client);

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
