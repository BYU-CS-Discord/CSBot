import * as logger from '../logger';
import { chances, DEFAULT_CHANCE } from '../constants/reactionDuplication';
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
			user.bot || // ignore bots
			reaction.me || // ignore own reacts
			reaction.message.author?.id === reaction.client.user.id || // never self-react
			(reaction.count ?? 0) > 1 // never join the bandwagon
		) {
			return;
		}

		// The chances, where 1 is always, 100 is once every 100 times, and 0 is never
		const chance = chances[emojiName] ?? DEFAULT_CHANCE;

		if (chance === 0) {
			logger.debug(`There is no chance I'd react to :${ogEmojiName}:`);
			return;
		}

		logger.debug(`There is a 1-in-${chance} chance that I'd react to :${ogEmojiName}:`);
		const random = Math.round(Math.random() * 100);
		if (random % chance === 0) {
			logger.debug('I did.');
			await reaction.react();
		} else {
			logger.debug('I did not.');
		}
	},
});
