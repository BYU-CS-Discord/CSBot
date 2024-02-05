export function isNonEmptyArray<T>(tbd: Array<T>): tbd is NonEmptyArray<T>;

export function isNonEmptyArray<T>(tbd: ReadonlyArray<T>): tbd is ReadonlyNonEmptyArray<T>;

export function isNonEmptyArray<T>(tbd: ReadonlyArray<T>): tbd is NonEmptyArray<T> {
	return tbd.length > 0;
}
