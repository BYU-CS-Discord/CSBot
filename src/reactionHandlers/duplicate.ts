import { chances, DEFAULT_CHANCE } from '../constants/reactionDuplication';
import * as logger from '../logger';

export const duplicate: ReactionHandler = {
	async execute({ reaction }) {
		const ogEmojiName = reaction.emoji.name ?? '';
		const emojiName = ogEmojiName.toLowerCase();

		// never join the bandwagon
		if ((reaction.count ?? 0) > 1) {
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
};
