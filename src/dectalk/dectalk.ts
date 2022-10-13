// External dependencies
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import * as tmp from 'tmp';
import * as os from 'os';
import { toString } from 'lodash';

// Internal dependencies
import * as logger from '../logger';

// eslint-disable-next-line no-shadow
export enum WaveEncoding {
	PCM_16bits_MONO_11KHz = 1,
	PCM_8bits_MONO_11KHz = 2,
	MULAW_8bits_MONO_8KHz = 3,
}

interface DecOptions {
	/**
	 * (_Linux only_)
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
	 * (_Linux only_)
	 * The speed that he talks
	 */
	SpeakRate?: number;

	/**
	 * (_Linux only_)
	 * The voice of who talks
	 *
	 * Here is what i think they are
	 *
	 * -> 0. Default voice
	 * 1. Female voice
	 * 2. Low pitch guy
	 * 3. Another Female voice?
	 * 4. Almost Default voice (a little lower pitch)
	 * 5. Female very high pitch
	 * 6. Female high pitch (like the previouse but lower)
	 * 7. Another male voice
	 * 8. Another female voice
	 *
	 * Any other numbers defaults to the 0 voice
	 */
	SpeakerNumber?: number;

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

		let dec;
		// Windows
		if (os.platform() === 'win32') {
			const args: Array<string> = [];
			if (options) {
				if (options.EnableCommands === true) content = `[:PHONE ON]${content}`;
			} else {
				// Defaults
				// EnableCommands
				content = `[:PHONE ON]${content}`;
			}
			args.push('-w', file.name);
			// args.push('-d', __dirname + "/../../dectalk/dtalk_us.dic");
			args.push(content);

			dec = spawn(`${__dirname}\\..\\..\\dectalk\\windows\\say.exe`, args, {
				cwd: `${__dirname}\\..\\..\\dectalk`,
			});
		} else {
			// Linux / Others
			const args: Array<string> = [];
			if (options) {
				if (options.WaveEncoding) args.push('-e', options.WaveEncoding.toString());
				if (options.SpeakRate ?? 0) args.push('-r', options.SpeakRate?.toString() ?? '');
				if (options.SpeakerNumber ?? 0) args.push('-s', options.SpeakerNumber?.toString() ?? '');
				if (options.EnableCommands === true) content = `[:PHONE ON]${content}`;
			} else {
				// Defaults
				// EnableCommands
				content = `[:PHONE ON]${content}`;
			}
			args.push('-a', content);
			args.push('-fo', file.name);

			dec = spawn(`${__dirname}/../../dectalk/linux/say_demo_us`, args, {
				cwd: `${__dirname}/../../dectalk`,
			});
		}

		dec.on('error', error => {
			reject(new Error(`failed to run dectalk exectuable:\n\n${toString(error)}`));
		});

		dec.stdout.on('data', data => logger.info(spawnOutput('Dectalk', 'stdout', data)));
		dec.stderr.on('data', data => logger.error(spawnOutput('Dectalk', 'stderr', data)));

		dec.on('close', code => {
			if (code !== 0) {
				reject(new Error(`dectalk exited with code ${code ?? '{none}'}\n\nPlease check stderr`));
			}
			resolve(readFileSync(file.name));
		});
	});
}

function spawnOutput(childName: string, outputStream: string, data: unknown): string {
	const str = '';
	const messages: Array<string> = toString(data).split('\n');
	messages.forEach(message => {
		str.concat(`[${childName} ${outputStream.toUpperCase()}] ${message}\n`);
	});
	return str;
}
