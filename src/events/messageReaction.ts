import type { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';

export function buildExecute(allReactionHandlers: ReadonlySet<ReactionHandler>) {
	return async function execute(
		reaction: MessageReaction | PartialMessageReaction,
		user: User | PartialUser
	): Promise<void> {
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
	};
}
