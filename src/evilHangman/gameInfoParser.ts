import { format } from '../helpers/format.js';

export const GAME_INFO_FORMAT = 'Remaining Guesses: {0}\nWord: {1}\nLetters Guessed: {2}';
export const parser = new RegExp(
	format(GAME_INFO_FORMAT, String.raw`(\d*)`, String.raw`([\w-]*)`, '([a-z,]*)'),
	'u'
);
