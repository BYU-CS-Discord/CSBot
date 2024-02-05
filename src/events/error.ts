import { error as logErr } from '../logger.js';
import { onEvent } from '../helpers/onEvent';

/**
 * The event handler for Discord Client errors
 */
export const error = onEvent('error', {
	once: false,
	execute(err) {
		logErr('Received client error:', err);
	},
});
