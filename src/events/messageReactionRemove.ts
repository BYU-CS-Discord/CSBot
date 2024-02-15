import { onEvent } from '../helpers/onEvent.js';
import { allReactionHandlers } from '../reactionHandlers/remove.js';
import { buildExecute } from './messageReaction.js';

/**
 * The event handler for emoji reactions.
 */
export const messageReactionRemove = onEvent('messageReactionRemove', {
	once: false,
	execute: buildExecute(allReactionHandlers),
});
