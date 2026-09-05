import type {
	ApplicationCommand,
	Client,
	Guild,
	RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { ApplicationCommandType } from 'discord.js';

import { allCommands } from '../../commands/index.ts';
import { debug, error, info } from '../../logger.ts';
import { areCommandsRegistered } from './areCommandsRegistered.ts';

/**
 * Fetches current commands from the client application, checks if they match
 * the commands stored locally, and re-registers commands if necessary
 *
 * @param client The current logged-in client
 */
export async function registerCommands(client: Client<true>): Promise<void> {
	// Pre-fetch guilds to avoid repeating work
	const oAuthGuilds = await client.guilds.fetch();
	const guilds = await Promise.all(oAuthGuilds.map(g => g.fetch()));

	const actualCommands = await getActualCommands(client, guilds);
	const expectedCommands = getExpectedCommands();

	// Skip registration if the commands are already registered
	if (areCommandsRegistered(actualCommands, expectedCommands)) {
		return;
	}

	const totalCommands = expectedCommands.global.length + expectedCommands.guilded.length;
	info(`Registering ${totalCommands} commands...`);

	await registerGlobalCommands(expectedCommands.global, client);
	await registerGuildedCommands(expectedCommands.guilded, guilds);

	// Sanity check
	const newActualCommands = await getActualCommands(client, guilds);
	if (!areCommandsRegistered(newActualCommands, expectedCommands)) {
		error('Command registration did not succeed. Please restart.');
	}

	info(
		`All ${totalCommands} command(s) prepared. Discord may take some time to sync commands to clients.`
	);
}

async function getActualCommands(
	client: Client<true>,
	guilds: ReadonlyArray<Guild>
): Promise<{
	global: Array<ApplicationCommand>;
	guilded: Map<Guild, Array<ApplicationCommand>>;
}> {
	const collection = await client.application.commands.fetch();
	const global = collection.values().toArray();

	const guilded = new Map(
		await Promise.all(
			guilds.map(guild =>
				(async function (): Promise<[Guild, Array<ApplicationCommand>]> {
					const guildCollection = await guild.commands.fetch();
					const commands = guildCollection.values().toArray();
					return [guild, commands] as const;
				})()
			)
		)
	);

	return { global, guilded };
}

function getExpectedCommands(): {
	global: Array<GlobalCommand | ContextMenuCommand>;
	guilded: Array<GuildedCommand>;
} {
	const commands = Array.from(allCommands.values());
	const global = commands.filter(c => !c.requiresGuild);
	const guilded = commands.filter(c => c.requiresGuild);
	return { global, guilded };
}

async function registerGlobalCommands(
	commands: Array<GlobalCommand | ContextMenuCommand>,
	client: Client<true>
): Promise<void> {
	const commandBuilders = commands.map(registerableCommand);
	info(
		`${commands.length} command(s) will be set globally: ${JSON.stringify(
			commandBuilders.map(cmd => cmd.name)
		)}`
	);
	debug(`Registering all ${commands.length} global command(s)...`);
	try {
		await client.application.commands.set(commandBuilders);
		info(`Registered ${commands.length} global command(s).`);
	} catch (error_) {
		error('Failed to register global commands:', error_);
	}
}

async function registerGuildedCommands(
	commands: Array<GuildedCommand>,
	guilds: Array<Guild>
): Promise<void> {
	const commandBuilders = commands.map(registerableCommand);
	info(
		`${commands.length} command(s) require a guild: ${JSON.stringify(
			commandBuilders.map(cmd => cmd.name)
		)}`
	);
	await Promise.all(guilds.map(guild => registerGuildedCommandsToGuild(commands, guild)));
}

async function registerGuildedCommandsToGuild(
	commands: ReadonlyArray<GuildedCommand>,
	guild: Guild
): Promise<void> {
	const commandBuilders = commands.map(registerableCommand);
	info(
		`Registering ${commands.length} guild-bound command(s): ${JSON.stringify(
			commandBuilders.map(cmd => cmd.name)
		)}`
	);
	try {
		const result = await guild.commands.set(commandBuilders);
		info(`Registered ${result.size} command(s) on guild ${guild.id}`);
	} catch (error_) {
		error(`Failed to register commands on guild ${guild.id}:`, error_);
	}
}

/**
 * Creates a registerable JSON payload from the given command.
 */
function registerableCommand(command: Command): RESTPostAPIApplicationCommandsJSONBody {
	if (isContextMenuCommand(command)) {
		return command.info.setType(command.type).toJSON();
	}

	// Slash commands are simpler:
	return command.info.toJSON();
}

function isContextMenuCommand(command: Command): command is ContextMenuCommand {
	return (
		command.type === ApplicationCommandType.Message || command.type === ApplicationCommandType.User
	);
}
