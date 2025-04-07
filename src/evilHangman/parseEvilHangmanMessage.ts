import type { Message } from 'discord.js';

import { EvilHangmanGame } from './evilHangmanGame.js';
import { parser } from './gameInfoParser.js';

const FORMAT_ERROR_MESSAGE = 'Incorrect message format for Evil Hangman';

export function parseEvilHangmanMessage(message: Message): EvilHangmanGame {
	const gameStateString = message.embeds[0]?.data.fields?.[1]?.value;
	if (gameStateString === undefined) {
		throw new Error(FORMAT_ERROR_MESSAGE);
	}
	const parseResult = parser.exec(gameStateString);
	if (parseResult === null) {
		throw new Error(FORMAT_ERROR_MESSAGE);
	}

	const [, guessesRemainingString, word, guessedLettersString] = parseResult;
	if (
		guessesRemainingString === undefined ||
		word === undefined ||
		guessedLettersString === undefined
	) {
		throw new Error(FORMAT_ERROR_MESSAGE);
	}

	const guessesRemaining = Number.parseInt(guessesRemainingString, 10);
	const guessedLetters = new Set(
		guessedLettersString.split(',').filter(letter => letter.length === 1)
	);
	return new EvilHangmanGame(word, guessesRemaining, guessedLetters);
}
