import type {
	ApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandSubCommandData,
	ApplicationCommandType,
	ChatInputApplicationCommandData,
	PermissionResolvable,
} from 'discord.js';

declare global {
	interface BaseCommand extends ChatInputApplicationCommandData {
		options?: NonEmptyArray<ApplicationCommandOption | Subcommand>;
		type?: ApplicationCommandType.ChatInput;
	}

	interface GlobalCommand extends BaseCommand {
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

	interface GuildedCommand extends BaseCommand {
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

	type Command = GlobalCommand | GuildedCommand;

	interface BaseSubcommand extends ApplicationCommandSubCommandData {
		type: ApplicationCommandOptionType.Subcommand;
	}

	interface GlobalSubcommand extends BaseSubcommand {
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

	interface GuildedSubcommand extends BaseSubcommand {
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

	type Subcommand = GlobalSubcommand | GuildedSubcommand;
}
