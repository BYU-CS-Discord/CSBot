import { describe, expect, test } from 'vitest';

import { getButtonsForAllLettersExcept } from './hangmanLetterButtons.js';

describe('getLetterOptions', () => {
	test('no guesses returns the full alphabet', () => {
		const options = getButtonsForAllLettersExcept(new Set());
		expect(options.length).toBe(26);
	});

	test('filtering on letters reduces the returned options', () => {
		const options = getButtonsForAllLettersExcept(new Set(['a', 'b', 'c']));
		expect(options.length).toBe(23);
	});

	test('filtering on non-letters does not reduce returned options', () => {
		const options = getButtonsForAllLettersExcept(new Set(['not a letter']));
		expect(options.length).toBe(26);
	});
});
