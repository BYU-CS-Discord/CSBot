// External dependencies
import type {
	ApplicationCommandData,
	ApplicationCommandDataResolvable,
	Client,
	Guild,
} from 'discord.js';
import { ApplicationCommandType } from 'discord.js';

// Internal dependencies
import * as logger from '../../logger';
import { allCommands } from '../../commands';
import { isNonEmptyArray } from '../guards/isNonEmptyArray';
import { revokeCommands } from './revokeCommands';

export async function deployCommands(client: Client<true>): Promise<void> {
	await revokeCommands(client); // fresh start!

	logger.info('Deploying commands...');
	const commands: Array<Command> = Array.from(allCommands.values());
	if (commands.length === 0) return;
	logger.info(`Syncing ${commands.length} command(s)...`);

	const guildCommands: Array<GuildedCommand> = [];
	const globalCommands: Array<GlobalCommand | ContextMenuCommand> = [];
	for (const cmd of commands) {
		if (
			(cmd.type === undefined || cmd.type === ApplicationCommandType.ChatInput) &&
			cmd.requiresGuild
		) {
			guildCommands.push(cmd);
		} else if (
			cmd.type === ApplicationCommandType.Message ||
			cmd.type === ApplicationCommandType.User ||
			!cmd.requiresGuild
		) {
			globalCommands.push(cmd);
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
	logger.info(
		`${globalCommands.length} command(s) will be set globally: ${JSON.stringify(
			globalCommands.map(cmd => `${cmd.name}`)
		)}`
	);
	logger.debug(`Deploying all ${globalCommands.length} global command(s)...`);
	try {
		await client.application.commands.set(globalCommands);
		logger.info(`Set ${globalCommands.length} global command(s).`);
	} catch (error) {
		logger.error('Failed to set global commands:', error);
	}
}

async function prepareGuildedCommands(
	guildCommands: NonEmptyArray<GuildedCommand>,
	client: Client<true>
): Promise<void> {
	logger.info(
		`${guildCommands.length} command(s) require a guild: ${JSON.stringify(
			guildCommands.map(cmd => `${cmd.name}`)
		)}`
	);
	const oAuthGuilds = await client.guilds.fetch();
	const guilds = await Promise.all(oAuthGuilds.map(g => g.fetch()));
	await Promise.all(guilds.map(guild => prepareCommandsForGuild(guild, guildCommands)));
}

async function prepareCommandsForGuild(
	guild: Guild,
	guildCommands: Array<GuildedCommand>
): Promise<void> {
	logger.info(`Deploying ${guildCommands.length} guild-bound command(s):`);

	const payloads = guildCommands.map(cmd => {
		logger.info(`\t'/${cmd.name}'  (requires guild)`);
		return discordCommandPayloadFromCommand(cmd);
	});

	try {
		const result = await guild.commands.set(payloads);
		logger.info(`Set ${result.size} command(s) on guild ${guild.id}`);
	} catch (error) {
		logger.error(`Failed to set commands on guild ${guild.id}:`, error);
	}
}

function discordCommandPayloadFromCommand(cmd: ChatInputCommand): ApplicationCommandDataResolvable {
	const payload: ApplicationCommandData = {
		description: cmd.description,
		type: cmd.type ?? ApplicationCommandType.ChatInput,
		name: cmd.name,
	};

	if (cmd.nameLocalizations) {
		payload.nameLocalizations = cmd.nameLocalizations;
	}
	if (cmd.descriptionLocalizations) {
		payload.descriptionLocalizations = cmd.descriptionLocalizations;
	}
	if (cmd.options) {
		payload.options = cmd.options;
	}
	if (cmd.defaultMemberPermissions !== undefined) {
		payload.defaultMemberPermissions = cmd.defaultMemberPermissions;
	}
	if (cmd.dmPermission !== undefined) {
		payload.dmPermission = cmd.dmPermission;
	}

	return payload;
}
