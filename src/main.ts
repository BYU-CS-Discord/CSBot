import 'source-map-support/register';
import 'dotenv/config';
import { ActivityType, Client, GatewayIntentBits, Partials } from 'discord.js';
import { appVersion } from './constants/meta';
import { deployCommands } from './helpers/actions/deployCommands';
import { registerEventHandlers } from './events'; // TODO update tests to reflect new event handlers
import { parseArgs } from './helpers/parseArgs';
import { revokeCommands } from './helpers/actions/revokeCommands';
import { verifyCommandDeployments } from './helpers/actions/verifyCommandDeployments';

import { getLogger } from './logger';
const logger = getLogger();

// We *could* do all of this at the top level, but then
// none of this setup would be testable :P

export async function _main(): Promise<void> {
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.GuildMessageTyping,
		],
		partials: [Partials.Reaction, Partials.Channel, Partials.Message],
		allowedMentions: {
			parse: ['roles', 'users'], // disallows @everyone pings
			repliedUser: true,
		},
	});

	const args = parseArgs();

	logger.info('*Yawn* Good morning!');

	client.on('ready', async client => {
		logger.info(`Starting ${client.user.username} v${appVersion}...`);

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
		logger.info('Verifying command deployments...');
		await verifyCommandDeployments(client);

		// Let users know where to go for info
		client.user.setActivity({
			type: ActivityType.Playing,
			name: '/help for info',
		});

		logger.info('Ready!');
	});

	registerEventHandlers(client);

	try {
		await client.login(process.env['DISCORD_TOKEN']);
	} catch (error) {
		logger.error('Failed to log in:', error);
	}
}

/* istanbul ignore next */
// Not Constantinople
if (process.env['NODE_ENV'] !== 'test') {
	// Jest will never hit this without hax:
	void _main();
}
