import type { Awaitable, ClientEvents } from 'discord.js';

declare global {
	/**
	 * Defines an event handler.
	 */
	interface EventHandler<K extends keyof ClientEvents> {
		/**
		 * The name of the event this handler is for
		 * Must match one of the events as defined in ClientEvents
		 */
		readonly name: K;

		/**
		 * Whether this event can only fire once
		 */
		readonly once: boolean;

		/**
		 * The event implementation. Receives any number of arguments, depending on the event.
		 */
		readonly execute: (...args: ClientEvents[K]) => Awaitable<void>;
	}
}
