import type { Message } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";

import { findTwitterURLs } from "../helpers/findTwitterURLs";
import { onEvent } from "../helpers/onEvent";
// import { replyWithPrivateMessage } from "../helpers/actions/messages/replyToMessage";

/**
 * The event handler for new messages.
 */
export const messageCreate = onEvent('messageCreate', {
	once: false,
	async execute(message: Message) {

		/** FxTwitter Warning */

		const twitterURLs = findTwitterURLs(message.content);

		if (twitterURLs.length !== 0) {
			const embed = new EmbedBuilder()
				.setTitle('fxtwitter')
				.setDescription(
					'Please replace [twitter.com](https://twitter.com/) with [fxtwitter.com](https://fxtwitter.com/) for an improved embed.\n\n' +
					'[Learn more](https://github.com/FixTweet/FixTweet)'
				);

			// Two different options for replies
			// - reply privately in DMs
			// - reply in the channel
			// Ephemeral replies are only available for interactions, not basic messages.

			// await replyWithPrivateMessage(message, { embeds: [ embed ] });
			message.reply({ embeds: [ embed ] });
		}
	}
});
