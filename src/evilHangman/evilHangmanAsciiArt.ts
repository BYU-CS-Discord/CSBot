import fs from 'node:fs/promises';

const ART_PATH = './res/hangmen.txt';
const FRAME_SEPARATOR = 'æ';
const framesPromise = (async (): Promise<Array<string>> => {
	const allFrames = (await fs.readFile(ART_PATH)).toString();
	return allFrames.split(FRAME_SEPARATOR);
})();

export async function getHangmanArt(guessesRemaining: number, outOf: number): Promise<string> {
	const frames = await framesPromise;
	const scale = (frames.length - 1) / outOf;
	const frameIndex = Math.floor(frames.length - guessesRemaining * scale - 1);
	return frames[frameIndex] ?? '';
}
