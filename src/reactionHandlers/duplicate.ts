import { chances, DEFAULT_CHANCE } from '../constants/reactionDuplication.js';
import { debug } from '../logger.js';

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
			debug(`There is no chance I'd react to :${ogEmojiName}:`);
			return;
		}

		debug(`There is a 1-in-${chance} chance that I'd react to :${ogEmojiName}:`);
		const random = Math.round(Math.random() * 100);
		if (random % chance === 0) {
			debug('I did.');
			await reaction.react();
		} else {
			debug('I did not.');
		}
	},
};
