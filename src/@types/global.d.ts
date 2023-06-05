/**
 * An array that always contains at least one element.
 */
type NonEmptyArray<T> = [T, ...Array<T>];

/**
 * A readonly-array that contains at least one element.
 */
type ReadonlyNonEmptyArray<T> = readonly [T, ...ReadonlyArray<T>];

/**
 * A function which determines the type identity of the given value.
 */
type TypeGuard<T> = (tbd: unknown) => tbd is T;
