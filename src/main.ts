import 'source-map-support/register.js';

import { Client, GatewayIntentBits, Partials } from 'discord.js';

import { registerEventHandlers } from './events/index.js';
import { error, info } from './logger.js';

// We *could* do all of this at the top level, but then
// none of this setup would be testable :P

export async function _main(): Promise<void> {
	info('*Yawn* Good morning!');

	// Set up the client
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.GuildMessageTyping,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.MessageContent,
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
	} catch (error_) {
		error('Failed to log in:', error_);
	}
}

/* istanbul ignore next */
// Not Constantinople
if (process.env['NODE_ENV'] !== 'test') {
	// Vitest will never hit this without hax:
	await _main();
}
