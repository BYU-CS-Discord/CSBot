// External dependencies
import 'source-map-support/register';
import 'dotenv/config';
import './helpers/parseArgs'; // load CLI args
import { Client, GatewayIntentBits, Partials } from 'discord.js';

// Internal dependencies
import * as logger from './logger';
import { registerEventHandlers } from './events';

// We *could* do all of this at the top level, but then
// none of this setup would be testable :P

export async function _main(): Promise<void> {
	logger.info('*Yawn* Good morning!');

	// Set up the client
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.GuildMessageTyping,
			GatewayIntentBits.GuildVoiceStates,
		],
		partials: [Partials.Reaction, Partials.Channel, Partials.Message],
		allowedMentions: {
			parse: ['roles', 'users'], // disallows @everyone pings
			repliedUser: true,
		},
	});

	// Register all the event handlers for the client
	registerEventHandlers(client);

	// Login
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
