import { ChannelType } from 'discord.js';
import { db } from '../database';

export const updateReactboard: ReactionHandler = {
	async execute({ reaction, user }) {
		if (reaction.message.guildId === null) return; // ignore guildless messages? How is that a thing?
		if (reaction.emoji.id === null) return; // idless reactions???
		const fullReaction = await reaction.fetch();

		const reactboardPosts = await db.reactboardPost.findMany({
			where: {
				originalMessageId: reaction.message.id,
			},
			include: {
				reactboard: true,
			},
		});

		if (reactboardPost.length > 0) {
			const updatePromises = reactboardPosts.map(async reactboardPost => {
				const reactboardChannel = await reaction.client.channels.cache
					.get(reactboardPost.reactboard.channelId)
					?.fetch();
				if (
					reactboardChannel === undefined ||
					!reactboardChannel.isTextBased() ||
					reactboardChannel.type === ChannelType.GuildStageVoice
				) {
					throw new Error('Could not find channel');
				}
				reactboardChannel.messages
			})
		}

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
