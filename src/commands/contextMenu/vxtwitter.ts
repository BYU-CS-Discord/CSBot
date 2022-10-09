import { ApplicationCommandType } from 'discord.js';
import { positionsOfUriInText } from '../../helpers/positionsOfUriInText';
import { URL } from 'node:url';

export const vxtwitter: MessageContextMenuCommand = {
	name: 'Fix Twitter Links',
	type: ApplicationCommandType.Message, // context menu command
	requiresGuild: false,
	async execute({ targetMessage, replyPrivately }) {
		const content = targetMessage.content;

		const urlRanges = positionsOfUriInText(content);
		if (urlRanges === null) {
			await replyPrivately('There were no URLs found in the message.');
			return;
		}

		const urls: Array<URL> = [];
		for (const { start, end } of urlRanges) {
			try {
				const url = new URL(content.slice(start, end));
				const twitter = 'twitter.com';
				const permutations = [twitter, `www.${twitter}`];
				if (permutations.includes(url.hostname)) {
					urls.push(url);
				}
			} catch {
				continue; // Not a URL, so skip to the next one
			}
		}

		if (urls.length === 0) {
			await replyPrivately('There were no Twitter URLs found in the message.');
			return;
		}

		// Print each fixed link in an ephemeral message, separated by newlines
		await replyPrivately(
			urls
				.map(vxTwitter)
				.map(url => url.href)
				.join('\n')
		);
	},
};

function vxTwitter(og: URL): URL {
	return new URL(og.pathname, 'https://vxtwitter.com');
}
