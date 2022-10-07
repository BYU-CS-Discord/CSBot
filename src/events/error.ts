// Internal dependencies
import * as logger from '../logger';

/**
 * The event handler for Discord Client errors
 */
export const error: EventHandler = {
	name: 'error',
	once: false,
	execute(err: Error) {
		logger.error('Received client error:', err);
	},
};
