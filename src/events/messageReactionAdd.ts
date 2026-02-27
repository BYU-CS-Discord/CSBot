import { Events } from 'discord.js';

import { onEvent } from '../helpers/onEvent.js';
import { addReactionHandlers } from '../reactionHandlers/add.js';
import { buildExecute } from './messageReaction.js';

/**
 * The event handler for emoji reactions.
 */
export const messageReactionAdd = onEvent(Events.MessageReactionAdd, {
	once: false,
	execute: buildExecute(addReactionHandlers),
});
