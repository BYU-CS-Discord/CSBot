import { onEvent } from '../helpers/onEvent';
import { allReactionHandlers } from '../reactionHandlers/remove';
import { buildExecute } from './messageReaction';

/**
 * The event handler for emoji reactions.
 */
export const messageReactionRemove = onEvent('messageReactionRemove', {
	once: false,
	execute: buildExecute(allReactionHandlers),
});
