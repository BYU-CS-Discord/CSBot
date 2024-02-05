import * as logger from '../logger';
import { onEvent } from '../helpers/onEvent';

/**
 * The event handler for Discord Client errors
 */
export const error = onEvent('error', {
	once: false,
	execute(err) {
		logger.error('Received client error:', err);
	},
});
