import { onEvent } from '../helpers/onEvent.js';
import { allReactionHandlers } from '../reactionHandlers/add.js';
import { buildExecute } from './messageReaction.js';

/**
 * The event handler for emoji reactions.
 */
export const messageReactionAdd = onEvent('messageReactionAdd', {
	once: false,
	execute: buildExecute(allReactionHandlers),
});
