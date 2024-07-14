import type { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';

declare global {
	interface ReactionHandler {
		execute: (context: ReactionHandlerContext) => void | Promise<void>;
	}

	interface ReactionHandlerContext {
		reaction: MessageReaction | PartialMessageReaction;
		user: User | PartialUser;
	}
}
