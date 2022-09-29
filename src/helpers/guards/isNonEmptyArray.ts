export function isNonEmptyArray<T>(array: Array<T>): array is NonEmptyArray<T> {
	return array.length > 0;
}
