import { URL } from 'node:url';

import { positionsOfUriInText } from "./positionsOfUriInText";

export function findTwitterURLs(content: string): URL[]|null {
	// Find URLs
	const urlRanges = positionsOfUriInText(content);
	if (urlRanges === null) {
		return null;
	}

	// Find Twitter URLs
	const twitterURLs: Array<URL> = [];
	const twitter = 'twitter.com';
	const permutations = [twitter, `www.${twitter}`];

	for (const { start, end } of urlRanges) {
		try {
			const url = new URL(content.slice(start, end));
			if (permutations.includes(url.hostname)) {
				twitterURLs.push(url);
			}
		} catch {
			continue; // Not actually a URL, so skip to the next one
		}
	}

	return twitterURLs;
}