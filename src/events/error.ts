import { Events } from 'discord.js';

import { onEvent } from '../helpers/onEvent.js';
import { error as logErr } from '../logger.js';

/**
 * The event handler for Discord Client errors
 */
export const error = onEvent(Events.Error, {
	once: false,
	execute(err) {
		logErr('Received client error:', err);
	},
});
