// External dependencies
import type { Client, Guild, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { ApplicationCommandType } from 'discord.js';

// Internal dependencies
import * as logger from '../../logger';
import { allCommands } from '../../commands';
import { isNonEmptyArray } from '../guards/isNonEmptyArray';
import { revokeCommands } from './revokeCommands';

export async function deployCommands(client: Client<true>): Promise<void> {
	await revokeCommands(client); // fresh start!

	logger.info('Deploying commands...');
	const commands: ReadonlyArray<Command> = Array.from(allCommands.values());
	if (commands.length === 0) return;
	logger.info(`Syncing ${commands.length} command(s)...`);

	const guildCommands: Array<GuildedCommand> = [];
	const globalCommands: Array<GlobalCommand | ContextMenuCommand> = [];
	for (const cmd of commands) {
		if (isContextMenuCommand(cmd) || !cmd.requiresGuild) {
			globalCommands.push(cmd);
		} else {
			// else if (cmd.requiresGuild)
			guildCommands.push(cmd);
		}
	}

	if (isNonEmptyArray(globalCommands)) {
		await prepareGlobalCommands(globalCommands, client);
	}
	if (isNonEmptyArray(guildCommands)) {
		await prepareGuildedCommands(guildCommands, client);
	}

	logger.info(
		`All ${commands.length} command(s) prepared. Discord may take some time to sync commands to clients.`
	);
}

async function prepareGlobalCommands(
	globalCommands: NonEmptyArray<GlobalCommand | ContextMenuCommand>,
	client: Client<true>
): Promise<void> {
	const commandBuilders = globalCommands.map(deployableCommand);
	logger.info(
		`${globalCommands.length} command(s) will be set globally: ${JSON.stringify(
			commandBuilders.map(cmd => cmd.name)
		)}`
	);
	logger.debug(`Deploying all ${globalCommands.length} global command(s)...`);
	try {
		await client.application.commands.set(commandBuilders);
		logger.info(`Set ${globalCommands.length} global command(s).`);
	} catch (error) {
		logger.error('Failed to set global commands:', error);
	}
}

async function prepareGuildedCommands(
	guildCommands: NonEmptyArray<GuildedCommand>,
	client: Client<true>
): Promise<void> {
	const commandBuilders = guildCommands.map(deployableCommand);
	logger.info(
		`${guildCommands.length} command(s) require a guild: ${JSON.stringify(
			commandBuilders.map(cmd => cmd.name)
		)}`
	);
	const oAuthGuilds = await client.guilds.fetch();
	const guilds = await Promise.all(oAuthGuilds.map(g => g.fetch()));
	await Promise.all(guilds.map(guild => prepareCommandsForGuild(guild, guildCommands)));
}

async function prepareCommandsForGuild(
	guild: Guild,
	guildCommands: ReadonlyArray<GuildedCommand>
): Promise<void> {
	const commandBuilders = guildCommands.map(deployableCommand);
	logger.info(
		`Deploying ${guildCommands.length} guild-bound command(s): ${JSON.stringify(
			commandBuilders.map(cmd => cmd.name)
		)}`
	);
	try {
		const result = await guild.commands.set(commandBuilders);
		logger.info(`Set ${result.size} command(s) on guild ${guild.id}`);
	} catch (error) {
		logger.error(`Failed to set commands on guild ${guild.id}:`, error);
	}
}

/**
 * Creates a deployable JSON payload from the given command.
 */
export function deployableCommand(cmd: Command): RESTPostAPIApplicationCommandsJSONBody {
	if (isContextMenuCommand(cmd)) {
		return cmd.info.setType(cmd.type).toJSON();
	}

	// Slash commands are simpler:
	return cmd.info.toJSON();
}

function isContextMenuCommand(cmd: Command): cmd is ContextMenuCommand {
	return cmd.type === ApplicationCommandType.Message || cmd.type === ApplicationCommandType.User;
}
