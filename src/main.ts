import 'source-map-support/register';
import 'dotenv/config';
import { ActivityType, Client, GatewayIntentBits, Partials } from 'discord.js';
import { handleInteraction } from './handleInteraction';
import { version } from './version';

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

console.info('*Yawn* Good morning!');
console.info(`Starting CS Bot v${version}...`);
console.debug(`Node ${process.version}`);

client.on('ready', client => {
	// Register interaction listeners
	client.on('interactionCreate', async interaction => {
		if (interaction.isCommand()) {
			try {
				await handleInteraction(interaction, console);
			} catch (error) {
				console.error('Failed to handle interaction:', error);
			}
		}
	});

	// Shout out our source code.
	client.user.setActivity({
		// ActivityType.Playing looks like crap, but it's the only way
		// to show a custom multiline string on the bot's user profile.
		// I'd put the URL in "About Me", but Discord seems to delete
		// those sometimes, and I'd like to stay on Discord's good side.
		type: ActivityType.Playing,
		name: 'Source: github.com/BYU-CS-Discord/CSBot',
		url: 'https://github.com/BYU-CS-Discord/CSBot',
	});

	// TODO: Verify that the deployed command list is up-to-date

	console.info('Ready!');
});

client.on('error', error => {
	console.error('Received client error:', error);
});

client.login(process.env['DISCORD_TOKEN']).catch((error: unknown) => {
	console.error('Failed to log in:', error);
});
