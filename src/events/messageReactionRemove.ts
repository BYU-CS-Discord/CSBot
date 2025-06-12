import { onEvent } from '../helpers/onEvent.js';
import { removeReactionHandlers } from '../reactionHandlers/index.js';
import { buildExecute } from './messageReaction.js';

/**
 * The event handler for when reactions are removed from messages.
 */
export const messageReactionRemove = onEvent('messageReactionRemove', {
	once: false,
	execute: buildExecute(removeReactionHandlers),
});
