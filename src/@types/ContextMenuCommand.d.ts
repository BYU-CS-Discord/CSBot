import type { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';
import type { ContextMenuCommandType } from '@discordjs/builders';

declare global {
	interface BaseContextMenuCommand {
		/** Metadata about the command. */
		info: ContextMenuCommandBuilder;

		/** The type of context menu command. */
		type: ContextMenuCommandType;

		/** Whether the subcommand requires a guild present to execute. */
		requiresGuild: false; // included here to better fit with `ChatInputCommand` objects. We'll make a guild-bound version later if we need it
	}

	interface UserContextMenuCommand extends BaseContextMenuCommand {
		/** The type of context menu command. */
		type: ApplicationCommandType.User;

		/**
		 * The command implementation. Receives contextual information about the
		 * command invocation. May return a `Promise`.
		 *
		 * @param context Contextual information about the command invocation.
		 */
		execute: (context: UserContextMenuCommandContext) => void | Promise<void>;
	}

	interface MessageContextMenuCommand extends BaseContextMenuCommand {
		/** The type of context menu command. */
		type: ApplicationCommandType.Message;

		/**
		 * The command implementation. Receives contextual information about the
		 * command invocation. May return a `Promise`.
		 *
		 * @param context Contextual information about the command invocation.
		 */
		execute: (context: MessageContextMenuCommandContext) => void | Promise<void>;
	}

	type ContextMenuCommand = UserContextMenuCommand | MessageContextMenuCommand;
}
