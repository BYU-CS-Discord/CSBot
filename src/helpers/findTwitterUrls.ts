import { URL } from 'node:url';

import { positionsOfUriInText } from './positionsOfUriInText';

export function findTwitterUrls(content: string): Array<URL> {
	// Find URLs
	const urlRanges = positionsOfUriInText(content);
	if (urlRanges === null) {
		return [];
	}

	// Find Twitter URLs
	const twitterURLs: Array<URL> = [];
	const twitter = 'twitter.com';
	const permutations = new Set([twitter, `www.${twitter}`]);

	for (const { start, end } of urlRanges) {
		try {
			const url = new URL(content.slice(start, end));
			if (permutations.has(url.hostname)) {
				twitterURLs.push(url);
			}
		} catch {
			continue; // Not actually a URL, so skip to the next one
		}
	}

	return twitterURLs;
}
