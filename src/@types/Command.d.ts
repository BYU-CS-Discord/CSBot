import type {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionType,
	ApplicationCommandSubCommandData,
	ApplicationCommandType,
	AutocompleteInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

declare global {
	interface BaseCommand {
		/** Metadata about the command. */
		info:
			| SlashCommandBuilder
			| SlashCommandSubcommandsOnlyBuilder
			| SlashCommandOptionsOnlyBuilder
			| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

		/** The type of the command. */
		type?: ApplicationCommandType.ChatInput;

		/**
		 * A handler for autocomplete requests.
		 *
		 * @param interaction The autocomplete request.
		 * @returns the available choices. Due to API limitations, only the
		 * first 25 of these are used.
		 */
		autocomplete?: (
			interaction: Omit<AutocompleteInteraction, 'respond'>
		) => Array<ApplicationCommandOptionChoiceData>;
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
		execute: (context: TextInputCommandContext) => void | Promise<void>;
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

	type Command = ChatInputCommand | ContextMenuCommand;
	type ChatInputCommand = GlobalCommand | GuildedCommand;

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
