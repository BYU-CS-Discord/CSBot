import type { Awaitable, ClientEvents } from 'discord.js';

declare global {
	/**
	 * Defines an event handler.
	 */
	interface EventHandler {
		/**
		 * The name of the event this handler is for
		 * Must match one of the events as defined in ClientEvents
		 */
		name: keyof ClientEvents;

		/**
		 * Whether this event can only fire once
		 */
		once: boolean;

		/**
		 * The event implementation. Receives any number of arguments, depending on the event.
		 */
		execute: (...args: Array<any>) => Awaitable<void>;
	}
}
