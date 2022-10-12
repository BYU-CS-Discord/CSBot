// <reference types="node" />
// eslint-disable-next-line no-shadow
export declare enum WaveEncoding {
	PCM_16bits_MONO_11KHz = 1,
	PCM_8bits_MONO_11KHz = 2,
	MULAW_8bits_MONO_8KHz = 3,
}
declare interface DecOptions {
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
export declare function say(content: string, options?: DecOptions): Promise<Buffer>;
export {};
