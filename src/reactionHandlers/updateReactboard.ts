import {
	Attachment,
	ChannelType,
	DMChannel,
	EmbedBuilder,
	MessageReaction,
	NewsChannel,
	PartialDMChannel,
	PrivateThreadChannel,
	PublicThreadChannel,
	TextChannel,
	VoiceChannel,
} from 'discord.js';
import { db } from '../database';
import { appVersion } from '../constants/meta';

export const updateReactboard: ReactionHandler = {
	async execute({ reaction }) {
		const fullReaction = await reaction.fetch();

		await updateExistingPosts(fullReaction);
		await addNewPosts(fullReaction);
	},
};

async function updateExistingPosts(reaction: MessageReaction): Promise<void> {
	const reactboardPosts = await db.reactboardPost.findMany({
		where: {
			originalMessageId: reaction.message.id,
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
		await reactboardMessage.edit({ embeds: [await buildEmbed(reaction)] });
	});

	await Promise.all(updatePromises);
}

async function addNewPosts(reaction: MessageReaction): Promise<void> {
	if (reaction.message.guildId === null) return; // ignore guildless messages

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
				},
			},
		},
	});

	const updatePromises = reactboardsToPostTo.map(async reactboard => {
		const channel = await getChannel(reaction, reactboard.channelId);
		const reactboardMessage = await channel.send({ embeds: [await buildEmbed(reaction)] });
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

function getDbReactName(reaction: MessageReaction): string {
	const name = reaction.emoji.id ?? reaction.emoji.name;
	if (name === null) {
		throw new Error('Could not identify react emoji');
	}

	return name;
}

async function buildEmbed(reaction: MessageReaction): Promise<EmbedBuilder> {
	const message = await reaction.message.fetch();
	const name = reaction.message.author?.username || '';
	const avatarUrl = reaction.message.author?.displayAvatarURL();
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
				value: message.channel.toString(),
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
