import { db } from '../database';

export const updateReactboard: ReactionHandler = {
	async execute({ reaction }) {
		if (reaction.message.guildId === null) return; // ignore guildless messages? How is that a thing?
		if (reaction.emoji.id === null) return; // idless reactions???
		const fullReaction = await reaction.fetch();

		const reactboards = await db.reactboard.findMany({
			where: {
				guildId: reaction.message.guildId,
				react: reaction.emoji.id,
			},
		});

		for (const reactboard of reactboards) {
			if (fullReaction.count >= reactboard.threshold) {
				console.log('new post!');
			}
		}
	},
};
