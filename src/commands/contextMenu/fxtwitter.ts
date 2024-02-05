import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';
import { positionsOfUriInText } from '../../helpers/positionsOfUriInText';
import { URL } from 'node:url';

const twitter = 'twitter.com';
const twitterPermutations = new Set([twitter, `www.${twitter}`]);

const x = 'x.com';
const xPermutations = new Set([x, `www.${x}`]);

export const fxtwitter: MessageContextMenuCommand = {
	info: new ContextMenuCommandBuilder().setName('Fix Twitter/X Links'),
	type: ApplicationCommandType.Message,
	requiresGuild: false,
	async execute({ targetMessage, replyPrivately }) {
		const content = targetMessage.content;

		const urlRanges = positionsOfUriInText(content);
		if (urlRanges.length === 0) {
			throw new Error('There were no URLs found in the message.');
		}

		const urls: Array<URL> = [];
		for (const { start, end } of urlRanges) {
			const url = new URL(content.slice(start, end));
			if (twitterPermutations.has(url.hostname) || xPermutations.has(url.hostname)) {
				urls.push(url);
			}
		}

		if (urls.length === 0) {
			throw new Error('There were no Twitter/X URLs found in the message.');
		}

		// Print each fixed link in an ephemeral message, separated by newlines
		await replyPrivately(
			urls
				.map(fixLink)
				.map(url => url.href)
				.join('\n')
		);
	},
};

function fixLink(og: URL): URL {
	if (twitterPermutations.has(og.hostname)) {
		return new URL(og.pathname, 'https://fxtwitter.com');
	}
	// else if (xPermutations.has(og.hostname))
	return new URL(og.pathname, 'https://fixupx.com');
}
