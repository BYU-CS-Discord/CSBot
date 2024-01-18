export interface Range {
	start: number;
	end: number;
}

/**
 * Returns an array of index positions in the given string that may
 * encapsulate URLs, or `null` if no URLs were found.
 */
export function positionsOfUriInText(str: string): Array<Range> {
	const uri =
		/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gu;

	const results: Array<Range> = [];
	let match: RegExpExecArray | null = null;

	while ((match = uri.exec(str))) {
		const range: Range = {
			start: match.index,
			end: match.index + match[0].length,
		};
		results.push(range);
	}

	return results;
}
