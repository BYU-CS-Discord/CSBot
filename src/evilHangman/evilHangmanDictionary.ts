import fs from 'node:fs';

const DICTIONARY_PATH = './res/dictionary.txt';
export const allWords: ReadonlyArray<string> = fs
	.readFileSync(DICTIONARY_PATH)
	.toString()
	.split('\n')
	.map(word => word.trim());
