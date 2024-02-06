import { beforeEach, describe, expect, test } from 'vitest';

import type { Message } from 'discord.js';

import { parseEvilHangmanMessage } from './parseEvilHangmanMessage.js';

describe('parseEvilHangmanMessage', () => {
	const field: { value: string | undefined } = {
		value: 'Remaining Guesses: 4\nWord: -----\nLetters Guessed: ',
	};
	const message: Message = {
		embeds: [
			{
				data: {
					fields: [{ value: '' }, field],
				},
			},
		],
	} as unknown as Message;

	beforeEach(() => {
		field.value = 'Remaining Guesses: 4\nWord: -----\nLetters Guessed: ';
	});

	test('message text is converted into a game', () => {
		const game = parseEvilHangmanMessage(message);
		const displayInfo = game.getDisplayInfo();
		expect(displayInfo.guessesRemaining).toEqual(4);
		expect(displayInfo.word).toEqual('-----');
		expect(displayInfo.guessesSoFar.size).toEqual(0);
	});

	test('incorrect message format throws an error', () => {
		field.value = 'Incorrectly formatted test string';
		expect(() => parseEvilHangmanMessage(message)).toThrow();

		field.value = undefined;
		expect(() => parseEvilHangmanMessage(message)).toThrow();
	});
});
