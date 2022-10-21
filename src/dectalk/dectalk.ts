// External dependencies
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import * as tmp from 'tmp';
import { toString } from 'lodash';

// Internal dependencies
import * as logger from '../logger';

// eslint-disable-next-line no-shadow
export enum WaveEncoding {
	PCM_16bits_MONO_11KHz = 1,
	PCM_8bits_MONO_11KHz = 2,
	MULAW_8bits_MONO_8KHz = 3,
}

/**
 * Different settings for voices.
 */
// eslint-disable-next-line no-shadow
export enum Speaker {
	/** Default male voice */
	PAUL = 0,
	/** Default female voice */
	BETTY = 1,
	/** Low-pitched male voice */
	HARRY = 2,
	/** High-pitched hoarse male voice */
	FRANK = 3,
	/** Nasally male voice */
	DENNIS = 4,
	/** High-pitched child voice */
	KID = 5,
	/** High-pitched female voice */
	URSULA = 6,
	/** Nasally female voice */
	RITA = 7,
	/** Low-pitched hoarse female voice */
	WENDY = 8,
}

export interface DecOptions {
	/**
	 * The encoding the wav file is
	 *
	 * PCM_16bits_MONO_11KHz = 1,
	 *
	 * PCM_8bits_MONO_11KHz = 2,
	 *
	 * MULAW_8bits_MONO_8KHz = 3
	 */
	WaveEncoding?: WaveEncoding;

	/**
	 * The speed that he talks in words-per-minute
	 * Limit is 75 to 600
	 */
	SpeakRate?: number;

	/**
	 * The voice of who talks. Default is PAUL (0)
	 */
	Speaker?: Speaker;

	/**
	 * Enable phoname commands
	 *
	 * example: "[bah<235,3>]"
	 *
	 * ### NOTE:
	 * - phonames can be enabled just by putting "[:PHONE ON]" at the start of the content
	 */
	EnableCommands?: boolean;
}

export async function say(content: string, options?: DecOptions): Promise<Buffer> {
	return await new Promise((resolve, reject) => {
		const file = tmp.fileSync({ prefix: 'dectalk', postfix: '.wav' });

		// Linux Only!
		const args: Array<string> = [];
		if (options) {
			if (options.WaveEncoding) args.push('-e', options.WaveEncoding.toString());
			if (options.SpeakRate ?? 0) args.push('-r', options.SpeakRate?.toString() ?? '');
			if (options.Speaker ?? 0) args.push('-s', options.Speaker?.toString() ?? '');
			if (options.EnableCommands === true) content = `[:PHONE ON]${content}`;
		} else {
			// Defaults
			// EnableCommands
			content = `[:PHONE ON]${content}`;
		}
		args.push('-a', content);
		args.push('-fo', file.name);

		const dec = spawn(`${__dirname}/../../dectalk/say_demo_us`, args, {
			cwd: `${__dirname}/../../dectalk`,
		});

		dec.on('error', error => {
			reject(new Error(`Failed to run dectalk exectuable:\n\n${toString(error)}`));
		});

		dec.stdout.on('data', data => logger.info(spawnOutput('Dectalk', 'stdout', data)));
		dec.stderr.on('data', data => logger.error(spawnOutput('Dectalk', 'stderr', data)));

		dec.on('close', code => {
			if (code !== 0) {
				reject(new Error(`Dectalk exited with code ${code ?? '{none}'}\n\nPlease check stderr`));
			}
			resolve(readFileSync(file.name));
		});
	});
}

function spawnOutput(childName: string, outputStream: string, data: unknown): string {
	let str = '';
	const messages: Array<string> = toString(data).split('\n');
	messages.forEach((value, index) => {
		// Splitting the data often creates an empty 'message' at the end, so ignore it
		if (index === messages.length - 1 && value === '') return;

		if (index !== 0) str = str.concat('\n');
		str = str.concat(`[${childName} ${outputStream.toUpperCase()}] ${value}`);
	});
	return str;
}
