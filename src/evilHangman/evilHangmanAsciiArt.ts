import fs from 'fs';

const ART_PATH = './res/hangmen.txt';
const FRAME_SEPARATOR = 'æ';
const framesPromise = new Promise<Array<string>>((resolve, reject) => {
	fs.readFile(ART_PATH, (err, data) => {
		if (err) {
			reject(err);
			return;
		}
		const allFrames = data.toString();
		resolve(allFrames.split(FRAME_SEPARATOR));
	});
});

export async function getHangmanArt(guessesRemaining: number, outOf: number): Promise<string> {
	const frames = await framesPromise;
	const scale = (frames.length - 1) / outOf;
	const frameIndex = Math.floor(frames.length - guessesRemaining * scale - 1);
	return frames[frameIndex] ?? '';
}
