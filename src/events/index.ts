import type { Client } from 'discord.js';

import { info } from '../logger.js';

/**
 * The private list of all event handlers. You can use this to edit the list within this file.
 * @private
 */
const _allEventHandlers = new Map<string, EventHandler>();

/**
 * A read-only list of all event handlers.
 * @public
 */
export const allEventHandlers: ReadonlyMap<string, EventHandler> = _allEventHandlers;

/**
 * Adds an event handler to the list of all handlers.
 * Does NOT register the event handler with the client. Use registerEventHandlers(Client) to update handlers.
 * Only public for testing purposes. Do not use outside this file or its tests.
 * @param eventHandler The event handler to add
 * @private
 */
export function _add(eventHandler: EventHandler): void {
	const name = eventHandler.name;

	if (_allEventHandlers.has(name)) {
		throw new TypeError(
			`Failed to add event handler for '${name}' when a handler for that event was already added`
		);
	}

	_allEventHandlers.set(name, eventHandler);
}

/**
 * Registers all event handlers with the client.
 * @param client The client to register event handlers with
 * @public
 */
export function registerEventHandlers(client: Client): void {
	_allEventHandlers.forEach(eventHandler => {
		// Register the event handler with the correct endpoint
		const eventName = eventHandler.name;
		if (eventHandler.once) {
			client.once(eventName, eventHandler.execute);
		} else {
			client.on(eventName, eventHandler.execute);
		}

		info(`Registered event handler ${eventHandler.once ? 'once' : 'on'}(${eventName})`);
	});
}

// Install event handlers
import { error } from './error';
import { interactionCreate } from './interactionCreate';
import { messageReactionAdd } from './messageReactionAdd';
import { ready } from './ready';

_add(error as EventHandler);
_add(interactionCreate as EventHandler);
_add(messageReactionAdd as EventHandler);
_add(ready as EventHandler);
// Not sure why these type casts are necessary, but they seem sound. We can remove them when TS gets smarter, or we learn what I did wrong
