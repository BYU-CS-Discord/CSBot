export function isNonEmptyArray<T>(array: Array<T>): array is NonEmptyArray<T>;

export function isNonEmptyArray<T>(array: ReadonlyArray<T>): array is ReadonlyNonEmptyArray<T>;

export function isNonEmptyArray<T>(array: ReadonlyArray<T>): array is NonEmptyArray<T> {
	return array.length > 0;
}
