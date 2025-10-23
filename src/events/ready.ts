import type { Client, ClientPresence } from 'discord.js';
import { ActivityType } from 'discord.js';
import { Worker } from 'node:worker_threads';

import { appVersion } from '../constants/meta.js';
import { deployCommands } from '../helpers/actions/deployCommands.js';
import { revokeCommands } from '../helpers/actions/revokeCommands.js';
import { onEvent } from '../helpers/onEvent.js';
import { parseArgs } from '../helpers/parseArgs.js';
import { verifyCommandDeployments } from '../helpers/actions/verifyCommandDeployments.js';
import { info } from '../logger.js';
import { setupScraperCron } from '../roomFinder/cron.js';
import { setupAutoUnsmiteCron } from '../helpers/smiteCron.js';

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

		// Set user activity
		info('Setting user activity');
		setActivity(client);

		// Set up automatic room scraping (optional - comment out if you don't want it)
		// This will scrape BYU room data every Sunday at 2 AM Mountain Time
		setupScraperCron(); // Default: '0 2 * * 0' (2 AM every Sunday)
		// Or customize the schedule:
		// setupScraperCron('0 3 * * 1');        // 3 AM every Monday
		// setupScraperCron('0 0 1 * *');        // Midnight on 1st of month
		// setupScraperCron('0 2 * * 0', '20251'); // Specific semester

		// Set up automatic unsmiting of users after 1 hour
		// This will check every hour and unsmite anyone who has been smitten for over an hour
		setupAutoUnsmiteCron(); // Default: '0 * * * *' (every hour)

		// Start uptime ping
		const UPTIME_URL = process.env['UPTIME_URL'];
		if (UPTIME_URL) {
			const UPTIME_INTERVAL_SECONDS = process.env['UPTIME_INTERVAL_SECONDS'];
			new Worker(new URL('../workers/uptime.js', import.meta.url), {
				name: 'uptime-ping',
				env: { UPTIME_URL, UPTIME_INTERVAL_SECONDS },
			});
		}

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
