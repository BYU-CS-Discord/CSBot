import { hangmanLetterButton, Letter } from '../buttons/hangmanLetterButton';

const alphabet: Array<Letter> = new Array(26)
	.fill(null)
	.map((x, i) => String.fromCharCode(i + 97) as Letter);

const buttonMap: Map<Letter, Button> = new Map(
	alphabet.map(letter => [letter, hangmanLetterButton(letter)])
);

export const letterButtons: Array<Button> = [...buttonMap.values()];

/**
 * Filters the given letters from the alphabet and returns all Letter buttons whose
 * letters are not in the input set.
 * @param guessesSoFar a set of letters which should not be included
 * @returns the buttons for every letter not given
 */
export function getButtonsForAllLettersExcept(guessesSoFar: Set<string>): Array<Button> {
	return [...buttonMap.entries()]
		.filter(entry => !guessesSoFar.has(entry[0]))
		.map(entry => entry[1]);
}
