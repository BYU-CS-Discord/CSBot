import fs from 'node:fs/promises';

const ART_PATH = './res/hangmen.txt';
const FRAME_SEPARATOR = 'æ';

async function getFrames(): Promise<ReadonlyArray<string>> {
	const file = await fs.readFile(ART_PATH);
	const allFrames = file.toString();
	return allFrames.split(FRAME_SEPARATOR);
}

export async function getHangmanArt(guessesRemaining: number, outOf: number): Promise<string> {
	const frames = await getFrames();
	const scale = (frames.length - 1) / outOf;
	const frameIndex = Math.floor(frames.length - guessesRemaining * scale - 1);
	return frames[frameIndex] ?? '';
}
