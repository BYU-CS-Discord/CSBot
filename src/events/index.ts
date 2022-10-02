// Dependencies
import type { Client } from 'discord.js';

// Internal dependencies
import { getLogger } from '../logger';
const logger = getLogger();

/**
 * The list of all event handlers. DO NOT EDIT DIRECTLY.
 * registerEventHandlers() will pull from this list.
 */
export const allEventHandlers = new Map<string, EventHandler>();

/**
 * Adds an event handler to the list of all handlers.
 * Does NOT register the event handler with the client. Use registerEventHandlers(Client) to update handlers.
 * Only public for testing purposes. Avoid using.
 * @param eventHandler The event handler to add
 * @private
 */
export function _add(eventHandler: EventHandler): void {
	const name: string = eventHandler.name;

	if (allEventHandlers.has(name)) {
		throw new TypeError(
			`Failed to add event handler for '${name}' when a handler for that event was already added`
		);
	}

	allEventHandlers.set(name, eventHandler);
}

/**
 * Registers all event handlers with the client.
 * @param client The client to register event handlers with
 * @public
 */
export function registerEventHandlers(client: Client): void {
	allEventHandlers.forEach((eventHandler: EventHandler, eventName: string) => {
		// Register the event handler with the correct endpoint
		if (eventHandler.once) {
			client.once(eventName, eventHandler.execute);
		} else {
			client.on(eventName, eventHandler.execute);
		}

		logger.info(`Registered event handler ${eventHandler.once ? 'once' : 'on'}(${eventName})`);
	});
}

// Install event handlers
import { error } from './error';
_add(error);
import { interactionCreate } from './interactionCreate';
_add(interactionCreate);
import { ready } from './ready';
_add(ready);
