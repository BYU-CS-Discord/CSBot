import { onEvent } from '../helpers/onEvent';
import { allReactionHandlers } from '../reactionHandlers/add';
import { buildExecute } from './messageReaction';

/**
 * The event handler for emoji reactions.
 */
export const messageReactionAdd = onEvent('messageReactionAdd', {
	once: false,
	execute: buildExecute(allReactionHandlers),
});
