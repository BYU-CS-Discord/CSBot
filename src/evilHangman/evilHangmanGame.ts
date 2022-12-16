import fs from 'fs';
import { isNonEmptyArray } from '../helpers/guards/isNonEmptyArray';

const DICTIONARY_PATH = './res/dictionary.txt';
export class EvilHangmanGame {
	private possibleWords: Array<string>;
	private word: string;
	private guessesRemaining: number;
	private readonly guessesSoFar: Set<string> = new Set();

	constructor(length: number, guesses: number) {
		this.word = new Array(length).fill('-').join('');
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

		if (this.guessesSoFar.has(guess)) {
			return "You've already guessed that letter";
		}

		return null;
	}

	makeGuess(guess: string): EvilHangmanDisplayInfo {
		this.guessesSoFar.add(guess);
		const bestForm = this.getBestForm(guess);
		this.updateWord(bestForm);
		this.removePossibleWords(guess);
		return this.getDisplayInfo();
	}

	getDisplayInfo(): EvilHangmanDisplayInfo {
		return {
			word: this.word,
			guessesRemaining: this.guessesRemaining,
			guessesSoFar: this.guessesSoFar,
			winState: this.getWinState(),
		};
	}

	private getWinState(): EvilHangmanWinState {
		if (this.guessesRemaining < 1) {
			return EvilHangmanWinState.LOST;
		}
		if (!this.word.includes('-')) {
			return EvilHangmanWinState.WON;
		}
		return EvilHangmanWinState.IN_PROGRESS;
	}

	private updateWord(form: RegExp): void {
		const newWord = form.source.replaceAll('\\w', '-');
		if (newWord === this.word) {
			this.guessesRemaining -= 1;
		}
		this.word = newWord;
	}

	private removePossibleWords(guess: string): void {
		const allExceptGuessed = `(?![${guess}])\\w`;
		const filterRegex = new RegExp(this.word.replaceAll('-', allExceptGuessed), 'u');
		this.possibleWords = this.possibleWords.filter(word => filterRegex.test(word));
	}

	private getBestForm(guess: string): RegExp {
		const possibilities = this.getFormScores(guess).sort((a, b) => b.score - a.score);
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
		const forms = this.possibleWords.map(possibleWord =>
			this.getForm(guess, possibleWord, this.guessesSoFar)
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
		return formArray.join('');
	}
}

function isAlpha(letter: string): boolean {
	return /^[a-z]$/iu.test(letter);
}

export interface EvilHangmanDisplayInfo {
	word: string;
	guessesRemaining: number;
	guessesSoFar: Set<string>;
	winState: EvilHangmanWinState;
}

export enum EvilHangmanWinState {
	WON = 'won',
	IN_PROGRESS = 'in progress',
	LOST = 'lost',
}

interface FormScore {
	form: RegExp;
	score: number;
}
