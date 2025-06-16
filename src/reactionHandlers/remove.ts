/**
 * The private list of all reaction handlers. You can use this to edit the list within this file.
 * @private
 */
const _allHandlers = new Set<ReactionHandler>();

/**
 * A read-only list of all reaction removal handlers.
 * @public
 */
export const removeReactionHandlers: ReadonlySet<ReactionHandler> = _allHandlers;

/**
 * Adds a handler to the list of all reaction handlers.
 * Only public for testing purposes. Do not use outside this file or its tests.
 * @param handler The handler to add
 * @private
 */
export function _add(handler: ReactionHandler): void {
	if (_allHandlers.has(handler)) {
		throw new TypeError('Failed to add handler that was already registered');
	}

	_allHandlers.add(handler);
}

/**  Install handlers here:  **/
import { buildUpdateReactboard } from './updateReactboard.js';

_add(buildUpdateReactboard('messageReactionRemove'));
