import type { MessageApplicationCommandData, UserApplicationCommandData } from 'discord.js';

declare global {
	interface UserContextMenuCommand extends UserApplicationCommandData {
		/** Whether the subcommand requires a guild present to execute. */
		requiresGuild: false; // included here to better fit with `ChatInputCommand` objects

		/**
		 * The command implementation. Receives contextual information about the
		 * command invocation. May return a `Promise`.
		 *
		 * @param context Contextual information about the command invocation.
		 */
		execute: (context: UserContextMenuCommandContext) => void | Promise<void>;
	}

	interface MessageContextMenuCommand extends MessageApplicationCommandData {
		/** Whether the subcommand requires a guild present to execute. */
		requiresGuild: false; // included here to better fit with `ChatInputCommand` objects

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
