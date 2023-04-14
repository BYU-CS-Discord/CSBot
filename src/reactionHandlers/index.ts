/**
 * The private list of all reaction handlers. You can use this to edit the list within this file.
 * @private
 */
const _allHandlers = new Set<ReactionHandler>();

/**
 * A read-only list of all reaction handlers.
 * @public
 */
export const allReactionHandlers: ReadonlySet<ReactionHandler> = _allHandlers;

/**
 * Adds a handler to the list of all reaction handlers.
 * Only public for testing purposes. Do not use outside this file or its tests.
 * @param handler The handler to add
 * @private
 */
export function _add(handler: ReactionHandler): void {
	if (_allHandlers.has(handler)) {
		throw new TypeError('Failed to add handler when a command with that name was already added');
	}

	_allHandlers.add(handler);
}

/**  Install handlers here:  **/
import { duplicate } from './duplicate';
import { updateReactboard } from './updateReactboard';

_add(duplicate);
_add(updateReactboard);