/**
 * Checks whether a value is a NodeJS error.
 *
 * The normal `instanceof` and `isNativeError` checks don't
 * work, because the `Error` type alone doesn't include
 * certain common error properties. Since those properties
 * are optional anyway, this function coerces `Error` to
 * `NodeJS.ErrnoException`.
 */
export function isError(tbd: unknown): tbd is NodeJS.ErrnoException {
	return tbd instanceof Error;
}
