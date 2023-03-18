import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';
import { URL } from 'node:url';

import { findTwitterURLs } from '../../helpers/findTwitterURLs';

export const fxtwitter: MessageContextMenuCommand = {
	info: new ContextMenuCommandBuilder().setName('Fix Twitter Links'),
	type: ApplicationCommandType.Message,
	requiresGuild: false,
	async execute({ targetMessage, replyPrivately }) {
		const urls = findTwitterURLs(targetMessage.content);

		if (urls === null) {
			throw new Error('There were no URLs found in the message.');
		}
		if (urls.length === 0) {
			throw new Error('There were no Twitter URLs found in the message.');
		}

		// Print each fixed link in an ephemeral message, separated by newlines
		await replyPrivately(
			urls
				.map(fxTwitter)
				.map(url => url.href)
				.join('\n')
		);
	},
};

function fxTwitter(og: URL): URL {
	return new URL(og.pathname, 'https://fxtwitter.com');
}
