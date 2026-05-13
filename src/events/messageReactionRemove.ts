import { Events } from 'discord.js';

import { onEvent } from '../helpers/onEvent.js';
import { removeReactionHandlers } from '../reactionHandlers/remove.js';
import { buildExecute } from './messageReaction.js';

/**
 * The event handler for when reactions are removed from messages.
 */
export const messageReactionRemove = onEvent(Events.MessageReactionRemove, {
	once: false,
	execute: buildExecute(removeReactionHandlers),
});
