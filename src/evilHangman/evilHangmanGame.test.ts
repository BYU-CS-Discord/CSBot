import { beforeEach, describe, expect, test } from 'vitest';

import { EvilHangmanGame, EvilHangmanWinState } from './evilHangmanGame.js';

describe('EvilHangmanGame', () => {
	let game: EvilHangmanGame;
	beforeEach(() => {
		game = new EvilHangmanGame('-----', 4, new Set(['a', 'e', 'i', 'o', 'u']));
	});

	test('newGame returns a game with an empty word, be in progess, and have no guessed letters', () => {
		game = EvilHangmanGame.newGame(null, null);
		const displayInfo = game.getDisplayInfo();
		expect(displayInfo.word).toMatch(/-*/u);
		expect(displayInfo.winState).toBe(EvilHangmanWinState.IN_PROGRESS);
		expect(displayInfo.guessesSoFar.size).toBe(0);
	});

	test('newGame with specified length uses that length of word', () => {
		game = EvilHangmanGame.newGame(4, null);
		const displayInfo = game.getDisplayInfo();
		expect(displayInfo.word).toBe('----');
	});

	test('newGame with a specified number of guesses uses that number of guesses', () => {
		const numGuesses = 4;
		game = EvilHangmanGame.newGame(null, numGuesses);
		const displayInfo = game.getDisplayInfo();
		expect(displayInfo.guessesRemaining).toEqual(numGuesses);
	});

	test('newGame with invalid number of letters throws an error', () => {
		expect(() => EvilHangmanGame.newGame(-1, null)).toThrow();
	});

	test('newGame with invalid number of guesses throws an error', () => {
		expect(() => EvilHangmanGame.newGame(null, 0)).toThrow();
		expect(() => EvilHangmanGame.newGame(null, 0)).toThrow();
	});

	test('checkGuess returns null for letters that havent been guessed', () => {
		expect(game.checkGuess('b')).toBeNull();
	});

	test('checkGuess returns an error message for non-letter guesses', () => {
		expect(game.checkGuess('word')).not.toBeNull();
		expect(game.checkGuess('1')).not.toBeNull();
		expect(game.checkGuess('')).not.toBeNull();
	});

	test('checkGuess returns an error message for already guessed letters', () => {
		expect(game.checkGuess('a')).not.toBeNull();
	});

	test('making a guess adds the guess to guessesSoFar', () => {
		const guess = 'b';
		const displayInfo = game.makeGuess(guess);
		expect(Array.from(displayInfo.guessesSoFar)).toContain(guess);
	});

	test('making an incorrect guess decrements guessesRemaining', () => {
		const beforeGuessesRemaining = game.getDisplayInfo().guessesRemaining;
		const afterGuessesRemianing = game.makeGuess('b').guessesRemaining;
		expect(afterGuessesRemianing).toEqual(beforeGuessesRemaining - 1);
	});

	test('making a correct guess updates the word and does not decrement guessesRemaining', () => {
		const beforeInfo = game.getDisplayInfo();
		const afterInfo = game.makeGuess('y');
		expect(afterInfo.word).not.toEqual(beforeInfo.word);
		expect(beforeInfo.guessesRemaining).toEqual(afterInfo.guessesRemaining);
	});

	test('A correct guess reveals the least possible letters', () => {
		const displayInfo = game.makeGuess('y');
		const numYs = displayInfo.word.split('').filter(letter => letter === 'y').length;
		expect(numYs).toBe(1);
	});

	test('a full word means the player has won', () => {
		game = new EvilHangmanGame('aback', 1, new Set());
		const displayInfo = game.getDisplayInfo();
		expect(displayInfo.winState).toBe(EvilHangmanWinState.WON);
	});

	test('No remaining guesses without a full word means the player lost', () => {
		game = new EvilHangmanGame('abac-', 0, new Set());
		const displayInfo = game.getDisplayInfo();
		expect(displayInfo.winState).toBe(EvilHangmanWinState.LOST);
	});

	test('a non-existent word throws an error when a guess is made', () => {
		game = new EvilHangmanGame('qqqqq', 1, new Set());
		expect(() => game.makeGuess('a')).toThrow();
	});
});
