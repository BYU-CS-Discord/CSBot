/**
 * Replaces placeholder values in the given string with the given value.
 *
 * For example, given a template string of `"foo {0} {1}"` and values
 * of `"bar"` and `"baz"` in that order, the return value is
 * `"foo bar baz"`.
 *
 * @param source The template string.
 * @param args The values to emplace.
 * @returns The formatted string.
 */
export function format(source: string, ...args: ReadonlyArray<string>): string {
	return source.replaceAll(/\{(\d+)\}/gu, (match, number: number): string => {
		return args[number] ?? match;
	});
}
