import { Events } from 'discord.js';

import { onEvent } from '../helpers/onEvent.ts';
import { addReactionHandlers } from '../reactionHandlers/add.ts';
import { buildExecute } from './messageReaction.ts';

/**
 * The event handler for emoji reactions.
 */
export const messageReactionAdd = onEvent(Events.MessageReactionAdd, {
	once: false,
	execute: buildExecute(addReactionHandlers),
});
