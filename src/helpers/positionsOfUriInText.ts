import { URL } from 'node:url';

export interface Range {
	start: number;
	end: number;
}

const uriRegex =
	/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gu;

/**
 * Returns an array of index positions in the given string that may
 * encapsulate URLs, or `null` if no URLs were found.
 */
export function positionsOfUriInText(str: string): Array<Range> {
	const results: Array<Range> = [];
	let match: RegExpExecArray | null = null;

	while ((match = uriRegex.exec(str))) {
		const range: Range = {
			start: match.index,
			end: match.index + match[0].length,
		};

		// Just in case the regex returns a match that is not a valid URI
		if (!URL.canParse(match[0])) {
			continue;
		}

		results.push(range);
	}

	return results;
}
