import { isNonEmptyArray } from '../helpers/guards/isNonEmptyArray';
import { allWords } from './evilHangmanDictionary';

export class EvilHangmanGame {
	private possibleWords: Array<string>;
	private word: string;
	private guessesRemaining: number;
	private readonly guessesSoFar: Set<string>;

	constructor(word: string, guessesRemaining: number, guessesSoFar: Set<string>) {
		this.word = word;
		this.guessesRemaining = guessesRemaining;
		this.guessesSoFar = guessesSoFar;

		this.possibleWords = allWords.filter(possibleWord => this.word.length === possibleWord.length);
		this.removePossibleWords([...guessesSoFar]);
	}

	static newGame(length: number | null, guesses: number | null): EvilHangmanGame {
		if (length === null) {
			length = this.getRandomWordFromDictionary()?.length ?? 1;
		}
		if (guesses === null) {
			guesses = 13 - Math.round(length / 3); // Numbers arbitrary, for game balance
		}

		const word = new Array(length).fill('-').join('');
		const guessesRemaining = guesses;

		return new this(word, guessesRemaining, new Set());
	}

	private static getRandomWordFromDictionary(): string | undefined {
		return allWords[Math.floor(Math.random() * allWords.length)];
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
		this.removePossibleWords([guess]);
		return this.getDisplayInfo();
	}

	getDisplayInfo(): EvilHangmanDisplayInfo {
		const winState = this.getWinState();
		return {
			word: this.word,
			guessesRemaining: this.guessesRemaining,
			guessesSoFar: this.guessesSoFar,
			...winState,
		};
	}

	private getWinState(): DisplayInfoWinStateExtension {
		if (this.guessesRemaining < 1) {
			return {
				winState: EvilHangmanWinState.LOST,
				correctWord: this.possibleWords[0] ?? '',
			};
		}
		if (!this.word.includes('-')) {
			return { winState: EvilHangmanWinState.WON };
		}
		return { winState: EvilHangmanWinState.IN_PROGRESS };
	}

	private updateWord(form: RegExp): void {
		const newWord = form.source.replaceAll('\\w', '-');
		if (newWord === this.word) {
			this.guessesRemaining -= 1;
		}
		this.word = newWord;
	}

	private removePossibleWords(guesses: Array<string>): void {
		const allExceptGuessed = `(?![${[...guesses].join('')}])\\w`;
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

export type EvilHangmanDisplayInfo = {
	word: string;
	guessesRemaining: number;
	guessesSoFar: Set<string>;
} & DisplayInfoWinStateExtension;

type DisplayInfoWinStateExtension =
	| {
			winState: EvilHangmanWinState.LOST;
			correctWord: string;
	  }
	| {
			winState: EvilHangmanWinState.WON | EvilHangmanWinState.IN_PROGRESS;
	  };

export enum EvilHangmanWinState {
	WON = 'won',
	IN_PROGRESS = 'in progress',
	LOST = 'lost',
}

interface FormScore {
	form: RegExp;
	score: number;
}
