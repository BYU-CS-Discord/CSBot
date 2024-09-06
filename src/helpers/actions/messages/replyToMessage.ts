import type {
	InteractionReplyOptions,
	Message,
	MessageCreateOptions,
	MessageReplyOptions,
	RepliableInteraction,
	TextBasedChannel,
	User,
} from 'discord.js';
import { ChannelType, PartialGroupDMChannel, channelMention, userMention } from 'discord.js';

import { error, info } from '../../../logger.js';
import { logUser } from '../../logUser.js';

/**
 * Attempts to send a direct message to a user.
 *
 * @param user The user to DM.
 * @param content The message to send.
 *
 * @returns `true` if the DM was successful. `false` if there was an error.
 * This will be the case if the target user has DMs disabled.
 */
async function sendDM(user: User, content: string | MessageCreateOptions): Promise<Message | null> {
	try {
		return await user.send(content);
	} catch (error_) {
		error(`Failed to send direct message to user ${logUser(user)}:`, error_);
		return null;
	}
}

function replyMessage(source: TextBasedChannel | null, content: string | null | undefined): string {
	let msg = '';
	if (source && source.type !== ChannelType.DM) {
		msg += `(Reply from ${channelMention(source.id)})\n`;
	}
	msg += content ?? '';
	return msg;
}

async function sendDMReply(
	source: Message,
	options: string | MessageReplyOptions
): Promise<Message | null> {
	const user: User = source.author;
	try {
		const content = typeof options === 'string' ? options : (options.content ?? null);
		const response = replyMessage(source.channel, content);
		if (typeof options === 'string') {
			return await sendDM(user, response);
		}
		return await sendDM(user, { ...options, content: response });
	} catch (error_) {
		error(`Failed to send direct message to user ${logUser(user)}:`, error_);
		return null;
	}
}

async function sendEphemeralReply(
	source: RepliableInteraction,
	options: string | InteractionReplyOptions
): Promise<boolean> {
	// Returns boolean and not message, because we cannot fetch ephemeral messages
	try {
		if (typeof options === 'string') {
			await source.reply({ content: options, ephemeral: true });
		} else {
			await source.reply({ ...options, ephemeral: true });
		}
		info(`Sent ephemeral reply to User ${logUser(source.user)}: ${JSON.stringify(options)}`);
		return true;
	} catch (error_) {
		error('Failed to send ephemeral message:', error_);
		return false;
	}
}

/**
 * Attempts to send a direct message to the author of the given message. If
 * Discord throws an error at the attempt, then the error is logged, and
 * the returned `Promise` resolves to `false`.
 *
 * The current channel name is automatically prepended to the message content.
 *
 * @param source The message or interaction to which to reply.
 * @param options The the message to send.
 * @param preferDMs If `source` is an interaction, then we'll reply via DMs anyway.
 *
 * @returns a `Promise` that resolves with a reference to the message sent,
 * or a boolean value indicating whether an ephemeral reply succeeded or failed.
 */
export async function replyWithPrivateMessage(
	source: Message | RepliableInteraction,
	options: string | Omit<MessageCreateOptions, 'reply' | 'flags'>,
	preferDMs: boolean
): Promise<Message | boolean> {
	let message: Message | null;

	// If this is a message (no ephemeral reply option)
	if ('author' in source) {
		message = await sendDMReply(source, options);

		// If this is an interaction, but we really wanna use DMs
	} else if (preferDMs) {
		if (typeof options === 'string') {
			message = await sendDM(source.user, replyMessage(source.channel, options));
		} else {
			message = await sendDM(source.user, {
				...options,
				content: replyMessage(source.channel, options.content),
			});
		}

		// If this is an interaction, reply ephemerally
	} else {
		return await sendEphemeralReply(source, options);
	}

	// If the DM was attempted and failed
	if (message === null) {
		// Inform the user that we tried to DM them, but they have their DMs off
		if ('author' in source) {
			const authorMention = userMention(source.author.id);
			const content = `${authorMention} I tried to DM you just now, but it looks like your DMs are off. :slight_frown:`;
			try {
				await source.reply(content);
			} catch (error_) {
				error(`Failed to reply with message ${JSON.stringify(content)}:`, error_);
			}
		} else if (typeof options === 'string') {
			return await sendEphemeralReply(source, {
				content: `I tried to DM you just now, but it looks like your DMs are off.\n${options}`,
			});
		} else {
			return await sendEphemeralReply(source, {
				...options,
				content: `I tried to DM you just now, but it looks like your DMs are off.\n${
					options.content ?? ''
				}`,
			});
		}
		return false;
	}

	return message;
}

/**
 * Attempts to send a message in the provided channel.
 *
 * @param channel The text channel in which to send the message.
 * @param content The message to send.
 */
export async function sendMessageInChannel(
	channel: TextBasedChannel,
	content: string | MessageCreateOptions
): Promise<Message | null> {
	if (channel instanceof PartialGroupDMChannel) {
		error(
			`Failed to send message ${JSON.stringify(content)}: Cannot send in PartialGroupDMChannels.`
		);
		return null;
	}
	try {
		return await channel.send(content);
	} catch (error_) {
		error(`Failed to send message ${JSON.stringify(content)}:`, error_);
		return null;
	}
}
