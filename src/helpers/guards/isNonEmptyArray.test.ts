import { describe, expect, test } from 'vitest';

import { isNonEmptyArray } from './isNonEmptyArray';

describe('Nonempty array', () => {
	test('returns false for an empty array', () => {
		expect(isNonEmptyArray([])).toBe(false);
	});

	test.each`
		length
		${1}
		${2}
		${4}
		${128}
	`('returns true for an array of $length item(s)', ({ length }: { length: number }) => {
		const array = Array.from({ length }).fill(8);
		expect(array.length).toBe(length); // sanity check
		expect(isNonEmptyArray(array)).toBe(true);
	});
});
