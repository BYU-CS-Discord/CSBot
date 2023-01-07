import fs from 'fs';

const DICTIONARY_PATH = './res/dictionary.txt';
export const allWords = fs
	.readFileSync(DICTIONARY_PATH)
	.toString()
	.split('\n')
	.map(word => word.trim());
