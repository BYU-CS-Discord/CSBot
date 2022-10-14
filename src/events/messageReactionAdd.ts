import * as logger from '../logger';
import { onEvent } from '../helpers/onEvent';

/**
 * The event handler for emoji reactions.
 */
export const messageReactionAdd = onEvent('messageReactionAdd', {
	once: false,
	async execute(reaction, user) {
		const ogEmojiName = reaction.emoji.name ?? '';
		const emojiName = ogEmojiName.toLowerCase();

		// Ignore nameless emoji. Not sure what those are about
		if (!emojiName) return;

		if (
			user.bot ||
			user.id === reaction.client.user.id ||
			reaction.me || // never self-react
			reaction.message.author === reaction.client.user ||
			(reaction.count ?? 0) > 1 // never join the bandwagon
		) {
			return;
		}

		// The chances, where 1 is always, 100 is once every 100 times, and 0 is never.
		// We're using integers here because floating-point math is silly
		const DEFAULT_CHANCE = 100;
		const odds: Record<string, number> = {
			// TODO: Make these configurable
			no_u: 5,
			nou: 5,
			same: 5,
			'⭐': 0,
		};
		const random = Math.round(Math.random() * 100);
		const chance = odds[emojiName] ?? DEFAULT_CHANCE;

		if (chance === 0) {
			logger.debug(`There is no chance I'd react to :${ogEmojiName}:`);
			return;
		}

		logger.debug(`There is a 1-in-${chance} chance that I'd react to :${ogEmojiName}:`);
		if (random % chance === 0) {
			logger.debug('I did.');
			await reaction.react();
		} else {
			logger.debug('I did not.');
		}
	},
});
