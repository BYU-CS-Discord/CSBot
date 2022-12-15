import fs from 'fs';
import { isNonEmptyArray } from '../helpers/guards/isNonEmptyArray';

const DICTIONARY_PATH = './res/dictionary.txt';
export class EvilHangmanGame {
	private possibleWords: Array<string>;
	private word: string;
	private guessesRemaining: number;

	constructor(length: number, guesses: number) {
		this.word = new Array(length).fill('_').join();
		this.guessesRemaining = guesses;

		const possibleWords = fs
			.readFileSync(DICTIONARY_PATH)
			.toString()
			.split('\n')
			.filter(word => word.length === length);
		if (!isNonEmptyArray(possibleWords)) {
			throw new Error(`No words in dictionary with length ${length}`);
		}
		this.possibleWords = possibleWords;
	}

	checkGuess(guess: string): string | null {
		if (!isAlpha(guess)) {
			return 'That guess is not a letter';
		}

		const guessesSoFar = this.guessesSoFar();
		if (guessesSoFar.has(guess)) {
			return "You've already guessed that letter";
		}

		return null;
	}

	makeGuess(guess: string): EvilHangmanDisplayInfo {
		this.guessesRemaining -= 1;
		const bestForm = this.getBestForm(guess);
		this.removePossibleWords(bestForm);
		this.updateWord(bestForm);
		return this.getDisplayInfo();
	}

	getDisplayInfo(): EvilHangmanDisplayInfo {
		return {
			word: this.word,
			guessesRemaining: this.guessesRemaining,
		};
	}

	private guessesSoFar(): Set<string> {
		return new Set(this.word.split('').filter(isAlpha));
	}

	private updateWord(form: RegExp): void {
		this.word = form.toString().replace('\\w', '_');
	}

	private removePossibleWords(form: RegExp): void {
		this.possibleWords = this.possibleWords.filter(word => form.test(word));
	}

	private getBestForm(guess: string): RegExp {
		const possibilities = this.getFormScores(guess).sort((a, b) => a.score - b.score);
		if (isNonEmptyArray(possibilities)) {
			return possibilities[0].form;
		}
		throw new Error('No possibilities');
	}

	private getFormScores(guess: string): Array<FormScore> {
		const forms = this.getForms(guess);
		return forms.map(form => {
			const formRegex = new RegExp(form, 'u');
			const score = this.possibleWords.filter(possibleWord => formRegex.test(possibleWord)).length;
			return {
				form: formRegex,
				score,
			};
		});
	}

	private getForms(guess: string): Array<string> {
		const guessesSoFar = this.guessesSoFar();
		const forms = this.possibleWords.map(possibleWord =>
			this.getForm(guess, possibleWord, guessesSoFar)
		);
		return [...new Set(forms)];
	}

	private getForm(guess: string, dictionaryWord: string, guessesSoFar: Set<string>): string {
		const letterArray = dictionaryWord.split('');
		const formArray = letterArray.map((letter: string) => {
			if (guessesSoFar.has(letter) || guess === letter) {
				return letter;
			}
			return '\\w';
		});
		return formArray.join();
	}
}

function isAlpha(letter: string): boolean {
	return /^[a-z]$/iu.test(letter);
}

export interface EvilHangmanDisplayInfo {
	word: string;
	guessesRemaining: number;
}

interface FormScore {
	form: RegExp;
	score: number;
}
