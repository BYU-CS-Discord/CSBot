import { onEvent } from '../helpers/onEvent';
import { allReactionHandlers } from '../reactionHandlers';

/**
 * The event handler for emoji reactions.
 */
export const messageReactionAdd = onEvent('messageReactionAdd', {
	once: false,
	async execute(reaction, user) {
		// Ignore nameless emoji. Not sure what those are about
		if (!reaction.emoji.name) return;

		if (
			user.bot || // ignore bots
			reaction.me || // ignore own reacts
			reaction.message.author?.id === reaction.client.user.id // never self-react
		) {
			return;
		}

		const handlerPromises = [...allReactionHandlers].map(
			async handler =>
				await handler.execute({
					reaction,
					user,
				})
		);
		await Promise.all(handlerPromises);
	},
});
