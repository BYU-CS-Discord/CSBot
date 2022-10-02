// IDK why this line is necessary, but if I remove it, I can't use EventHandler anywhere
import type { Awaitable } from 'discord.js';

declare global {
	/**
	 * Defines an event handler.
	 */
	interface EventHandler {
		/**
		 * The name of the event this handler is for
		 */
		name: string;

		/**
		 * Whether this event can only fire once
		 * Defaults to false
		 */
		once: boolean;

		/**
		 * The event implementation. Receives any number of arguments, depending on the event.
		 */
		execute: (...args: Array<any>) => Awaitable<void>;
	}
}
