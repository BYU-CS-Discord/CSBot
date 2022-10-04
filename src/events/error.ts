// Internal dependencies
import { getLogger } from '../logger';
import { onEvent } from '../helpers/onEvent';
const logger = getLogger();

/**
 * The event handler for Discord Client errors
 */
export const error = onEvent('error', {
	once: false,
	execute(err) {
		logger.error('Received client error:', err);
	},
});
