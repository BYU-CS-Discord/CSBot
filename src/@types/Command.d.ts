import type {
	ApplicationCommandOptionType,
	ApplicationCommandSubCommandData,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	ContextMenuCommandBuilder,
} from 'discord.js';

declare global {
	interface BaseCommand {
		info:
			| ContextMenuCommandBuilder
			| SlashCommandBuilder
			| SlashCommandSubcommandsOnlyBuilder
			| SlashCommandOptionsOnlyBuilder
			| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
	}

	interface GlobalCommand extends BaseCommand {
		/** Whether the command requires a guild present to execute. */
		requiresGuild: false;

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
