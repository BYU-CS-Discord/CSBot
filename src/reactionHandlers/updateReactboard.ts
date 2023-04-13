import {
	ChannelType,
	DMChannel,
	MessageReaction,
	NewsChannel,
	PartialDMChannel,
	PrivateThreadChannel,
	PublicThreadChannel,
	TextChannel,
	VoiceChannel,
} from 'discord.js';
import { db } from '../database';

export const updateReactboard: ReactionHandler = {
	async execute({ reaction, user }) {
		const fullReaction = await reaction.fetch();

		await updateExistingPosts(fullReaction);
		await addNewPosts(fullReaction);
	},
};

async function updateExistingPosts(reaction: MessageReaction): Promise<void> {
	const reactboardPosts = await db.reactboardPost.findMany({
		where: {
			originalMessageId: reaction.message.id,
		},
		include: {
			reactboard: true,
		},
	});

	const updatePromises = reactboardPosts.map(async reactboardPost => {
		const reactboardChannel = await getChannel(reaction, reactboardPost.reactboard.channelId);
		const reactboardMessage = await reactboardChannel.messages.fetch(
			reactboardPost.reactboardMessageId
		);
		await reactboardMessage.edit(reaction.count.toString());
	});

	await Promise.all(updatePromises);
}

async function addNewPosts(reaction: MessageReaction): Promise<void> {
	if (reaction.message.guildId === null) return; // ignore guildless messages? How is that a thing?
	if (reaction.emoji.id === null) return; // idless reactions???

	const reactboardsToPostTo = await db.reactboard.findMany({
		where: {
			guildId: reaction.message.guildId,
			react: reaction.emoji.id,
			threshold: {
				lte: reaction.count,
			},
			reactboardPosts: {
				none: {
					originalMessageId: reaction.message.id,
				},
			},
		},
	});

	const updatePromises = reactboardsToPostTo.map(async reactboard => {
		const channel = await getChannel(reaction, reactboard.channelId);
		const reactboardMessage = await channel.send(reaction.count.toString());
		await db.reactboardPost.create({
			data: {
				reactboardId: reactboard.id,
				originalMessageId: reaction.message.id,
				reactboardMessageId: reactboardMessage.id,
			},
		});
	});

	await Promise.all(updatePromises);
}

async function getChannel(
	reaction: MessageReaction,
	channelId: string
): Promise<
	| DMChannel
	| PartialDMChannel
	| NewsChannel
	| TextChannel
	| PrivateThreadChannel
	| PublicThreadChannel<boolean>
	| VoiceChannel
> {
	const channel = await reaction.client.channels.fetch(channelId);
	if (channel === null || !channel.isTextBased() || channel.type === ChannelType.GuildStageVoice) {
		throw new Error('Could not find channel');
	}
	return channel;
}
