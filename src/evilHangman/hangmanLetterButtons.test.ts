import { getLetterOptions } from './hangmanLetterButtons';

describe('getLetterOptions', () => {
	test('no guesses returns the full alphabet', () => {
		const options = getLetterOptions(new Set());
		expect(options).toBeArrayOfSize(26);
	});

	test('filtering on letters reduces the returned options', () => {
		const options = getLetterOptions(new Set(['a', 'b', 'c']));
		expect(options).toBeArrayOfSize(23);
	});

	test('filtering on non-letters does not reduce returned options', () => {
		const options = getLetterOptions(new Set(['not a letter']));
		expect(options).toBeArrayOfSize(26);
	});
});
