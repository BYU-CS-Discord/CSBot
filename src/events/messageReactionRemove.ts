import { Events } from 'discord.js';

import { onEvent } from '../helpers/onEvent.ts';
import { removeReactionHandlers } from '../reactionHandlers/remove.ts';
import { buildExecute } from './messageReaction.ts';

/**
 * The event handler for when reactions are removed from messages.
 */
export const messageReactionRemove = onEvent(Events.MessageReactionRemove, {
	once: false,
	execute: buildExecute(removeReactionHandlers),
});
