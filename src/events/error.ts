// Internal dependencies
import { getLogger } from '../logger';
const logger = getLogger();

/**
 * The event handler for Discord Client errors
 */
export const error: EventHandler<'error'> = {
	name: 'error',
	once: false,
	execute(err) {
		logger.error('Received client error:', err);
	},
};
