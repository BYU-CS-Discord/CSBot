import type { PartialDMChannel, PrivateThreadChannel, PublicThreadChannel } from 'discord.js';
import {
	Attachment,
	channelMention,
	ChannelType,
	DMChannel,
	EmbedBuilder,
	Message,
	MessageReaction,
	NewsChannel,
	TextChannel,
	userMention,
	VoiceChannel,
} from 'discord.js';

import { db } from '../database/index.js';
import { appVersion } from '../constants/meta.js';

export function buildUpdateReactboard(
	eventType: 'messageReactionAdd' | 'messageReactionRemove'
): ReactionHandler {
	const updateReactboard: ReactionHandler = {
		async execute({ reaction, user }) {
			const fullReaction = reaction.partial ? await reaction.fetch() : reaction;
			const fullMessage = reaction.message.partial
				? await reaction.message.fetch()
				: reaction.message;
			const fullUser = user.partial ? await user.fetch() : user;
			if (!fullMessage.inGuild()) return; // Ignore guildless messages

			const reactboardExists =
				(await db.reactboard.count({
					where: {
						guildId: fullMessage.guildId,
						react: getDbReactName(fullReaction),
					},
				})) > 0;
			if (!reactboardExists) return; // Abort if no reactboard

			if (eventType === 'messageReactionAdd') {
				if (fullMessage.author.bot) {
					const message = `${userMention(user.id)}, you can't use that react on bot messages!`;
					if (fullMessage.channel.isTextBased()) {
						await fullMessage.channel.send(message);
					} else {
						await fullUser.send(message);
					}
					await reaction.users.remove(fullUser);
					return;
				}

				if (fullMessage.author.id === user.id) {
					const message = `${userMention(user.id)}, you can't use that react on your own messages!`;
					if (fullMessage.channel.isTextBased()) {
						await fullMessage.channel.send(message);
					} else {
						await fullUser.send(message);
					}
					await reaction.users.remove(fullUser);
					return;
				}
			}

			await updateExistingPosts(fullReaction, fullMessage);
			await addNewPosts(fullReaction, fullMessage);
		},
	};
	return updateReactboard;
}

async function updateExistingPosts(reaction: MessageReaction, message: Message): Promise<void> {
	const reactboardPosts = await db.reactboardPost.findMany({
		where: {
			originalMessageId: reaction.message.id,
			originalChannelId: reaction.message.channelId,
			reactboard: {
				react: getDbReactName(reaction),
			},
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
		await reactboardMessage.edit({ embeds: [buildEmbed(reaction, message)] });
	});

	await Promise.all(updatePromises);
}

async function addNewPosts(reaction: MessageReaction, message: Message): Promise<void> {
	if (reaction.message.guildId === null) return; // Ignore guildless messages

	const reactboardsToPostTo = await db.reactboard.findMany({
		where: {
			guildId: reaction.message.guildId,
			react: getDbReactName(reaction),
			threshold: {
				lte: reaction.count,
			},
			reactboardPosts: {
				none: {
					originalMessageId: reaction.message.id,
					originalChannelId: reaction.message.channelId,
				},
			},
		},
	});

	const updatePromises = reactboardsToPostTo.map(async reactboard => {
		const channel = await getChannel(reaction, reactboard.channelId);
		const reactboardMessage = await channel.send({ embeds: [buildEmbed(reaction, message)] });
		await db.reactboardPost.create({
			data: {
				reactboardId: reactboard.id,
				originalMessageId: reaction.message.id,
				originalChannelId: reaction.message.channelId,
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
	| PublicThreadChannel
	| VoiceChannel
> {
	const channel = await reaction.client.channels.fetch(channelId);
	if (
		channel === null ||
		!channel.isTextBased() ||
		channel.isDMBased() ||
		channel.type === ChannelType.GuildStageVoice
	) {
		throw new Error('Could not find channel');
	}
	return channel;
}

function getDbReactName(reaction: MessageReaction): string {
	const name = reaction.emoji.id ?? reaction.emoji.name;
	if (name === null) {
		throw new Error('Could not identify react emoji');
	}

	return name;
}

function buildEmbed(reaction: MessageReaction, message: Message): EmbedBuilder {
	const name = message.author.username;
	const avatarUrl = message.author.displayAvatarURL();
	const content = message.cleanContent;
	const image = extractImageUrl(message.attachments.first());
	const emoji = reaction.emoji.toString();
	const guildId = message.guildId;

	if (guildId === null) {
		throw new Error('Reactboard embed must be in guild');
	}

	const embed = new EmbedBuilder()
		.setAuthor({ name, iconURL: avatarUrl })
		.setFooter({ text: `v${appVersion}` })
		.setColor('Gold')
		.setTimestamp(new Date())
		.setImage(image)
		.addFields([
			{
				name: `${emoji} Reacts`,
				value: reaction.count.toString(),
				inline: true,
			},
			{
				name: 'Channel',
				value: channelMention(message.channel.id),
				inline: true,
			},
			{
				name: ':arrow_heading_up: Jump',
				value: `[Click Me](https://discordapp.com/channels/${guildId}/${message.channel.id}/${message.id})`,
				inline: true,
			},
		]);

	if (content.length > 0) {
		embed.setDescription(content);
	}

	return embed;
}

function extractImageUrl(attachment: Attachment | undefined): string | null {
	if (!attachment?.contentType?.includes('image')) {
		return null;
	}
	return attachment.url;
}
