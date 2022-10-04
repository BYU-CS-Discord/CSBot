import type { Awaitable, ClientEvents } from 'discord.js';

declare global {
	/**
	 * Defines an event handler.
	 */
	interface EventHandler<K extends keyof ClientEvents> {
		/**
		 * The name of the event to be handled. Must match one of
		 * the discord.js event names defined in {@link ClientEvents}.
		 */
		readonly name: K;

		/**
		 * Whether this handler should only execute the first time
		 * the event occurs.
		 */
		readonly once: boolean;

		/**
		 * A function that is called with the event's context.
		 */
		readonly execute: (...args: ClientEvents[K]) => Awaitable<void>;
	}
}
