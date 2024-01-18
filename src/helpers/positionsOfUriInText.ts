export interface Range {
	start: number;
	end: number;
}

/**
 * Returns an array of index positions in the given string that may
 * encapsulate URLs, or `null` if no URLs were found.
 */
export function positionsOfUriInText(str: string): NonEmptyArray<Range> | null {
	const uri =
		/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gu;

	let results: NonEmptyArray<Range> | null = null;
	let match: RegExpExecArray | null;

	while ((match = uri.exec(str))) {
		const range: Range = {
			start: match.index,
			end: match.index + match[0].length,
		};
		if (results) {
			results.push(range);
		} else {
			results = [range];
		}
	}

	return results;
}
