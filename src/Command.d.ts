import type { CommandContext, GuildedCommandContext } from './CommandContext';
import type {
	ApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandSubCommandData,
	ApplicationCommandType,
	ChatInputApplicationCommandData,
	PermissionResolvable,
} from 'discord.js';

export * from './CommandContext';

interface BaseCommand extends ChatInputApplicationCommandData {
	options?: NonEmptyArray<ApplicationCommandOption | Subcommand>;
	type?: ApplicationCommandType.ChatInput;
}

export interface GlobalCommand extends BaseCommand {
	/** Whether the command requires a guild present to execute. */
	requiresGuild: false;

	/** The default permissions a user must have in a guild to invoke the command. */
	defaultMemberPermissions?: undefined;

	/** Whether users may invoke this command in DMs. */
	dmPermission?: true;

	/**
	 * The command implementation. Receives contextual information about the
	 * command invocation. May return a `Promise`.
	 *
	 * @param context Contextual information about the command invocation.
	 */
	execute: (context: CommandContext) => void | Promise<void>;
}

export interface GuildedCommand extends BaseCommand {
	/** Whether the command requires a guild present to execute. */
	requiresGuild: true;

	/** The default permissions a user must have in order to invoke the command. */
	defaultMemberPermissions?: PermissionResolvable;

	/** Whether users may invoke this command in DMs. */
	dmPermission?: false;

	/**
	 * The command implementation. Receives contextual information about the
	 * command invocation. May return a `Promise`.
	 *
	 * @param context Contextual information about the command invocation.
	 */
	execute: (context: GuildedCommandContext) => void | Promise<void>;
}

export type Command = GlobalCommand | GuildedCommand;

interface BaseSubcommand extends ApplicationCommandSubCommandData {
	type: ApplicationCommandOptionType.Subcommand;
}

export interface GlobalSubcommand extends BaseSubcommand {
	/** Whether the subcommand requires a guild present to execute. */
	requiresGuild: false;

	/** The default permissions a user must have in order to invoke the command. */
	defaultMemberPermissions?: undefined;

	/** Whether users may invoke this command in DMs. */
	dmPermission?: true;

	/**
	 * The command implementation. Receives contextual information about the
	 * command invocation. May return a `Promise`.
	 *
	 * @param context Contextual information about the command invocation.
	 */
	execute: (context: CommandContext) => void | Promise<void>;
}

export interface GuildedSubcommand extends BaseSubcommand {
	/** Whether the subcommand requires a guild present to execute. */
	requiresGuild: true;

	/** The default permissions a user must have in order to invoke the command. */
	defaultMemberPermissions?: PermissionResolvable;

	/** Whether users may invoke this command in DMs. */
	dmPermission?: false;

	/**
	 * The command implementation. Receives contextual information about the
	 * command invocation. May return a `Promise`.
	 *
	 * @param context Contextual information about the command invocation.
	 */
	execute: (context: GuildedCommandContext) => void | Promise<void>;
}

export type Subcommand = GlobalSubcommand | GuildedSubcommand;
