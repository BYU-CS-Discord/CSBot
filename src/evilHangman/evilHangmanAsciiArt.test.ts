import { getHangmanArt } from './evilHangmanAsciiArt';

describe('evilHangmanAsciiArt.ts', () => {
	const tests: Array<[number, number]> = [
		[0, 1],
		[0, 7],
		[3, 7],
		[4, 7],
		[7, 7],
		[50, 1000],
	];
	test.each(tests)('frame %i of %i has not changed', async (frame, ofFrame) => {
		await expect(getHangmanArt(frame, ofFrame)).resolves.toMatchSnapshot();
		await expect(getHangmanArt(frame, ofFrame)).resolves.not.toEqual('');
	});

	test('out of bounds resolves to empty string', async () => {
		await expect(getHangmanArt(11, 10)).resolves.toEqual('');
	});
});
