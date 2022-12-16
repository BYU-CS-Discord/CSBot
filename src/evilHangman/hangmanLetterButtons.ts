import { hangmanLetterButton, Letter } from '../buttons/hangmanLetterButton';

const alphabet: Array<Letter> = new Array(26)
	.fill(null)
	.map((x, i) => String.fromCharCode(i + 97) as Letter);

const buttonMap: Map<Letter, Button> = new Map(
	alphabet.map(letter => [letter, hangmanLetterButton(letter)])
);

export const letterButtons: Array<Button> = [...buttonMap.values()];

export function getLetterOptions(word: string): Array<Button> {
	const characters = new Set(word.split(''));
	return [...buttonMap.entries()].filter(entry => !characters.has(entry[0])).map(entry => entry[1]);
}
