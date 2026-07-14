import { Events } from 'discord.js';

import { onEvent } from '../helpers/onEvent.ts';
import { error as logErr } from '../logger.ts';

/**
 * The event handler for Discord Client errors
 */
export const error = onEvent(Events.Error, {
	once: false,
	execute(err) {
		logErr('Received client error:', err);
	},
});
