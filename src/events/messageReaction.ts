import type { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';

export function buildExecute(allReactionHandlers: ReadonlySet<ReactionHandler>) {
	return async function execute(
		reaction: MessageReaction | PartialMessageReaction,
		user: User | PartialUser
	): Promise<void> {
		// Ignore nameless emoji. Not sure what those are about
		if (!reaction.emoji.name) return;

		if (
			user.bot || // Ignore bots
			reaction.me // Ignore own reacts
		) {
			return;
		}

		const handlerPromises = [...allReactionHandlers].map(async handler => {
			await handler.execute({
				reaction,
				user,
			});
		});
		await Promise.all(handlerPromises);
	};
}
