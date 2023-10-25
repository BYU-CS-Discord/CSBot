import { ChannelType } from 'discord.js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Overwrite dectalk say method
const mockSay = vi.hoisted(() => vi.fn());
vi.mock('dectalk', async () => {
	const dectalk = await vi.importActual<typeof import('dectalk')>('dectalk');
	return {
		...dectalk,
		say: mockSay,
	};
});

// Mock the logger so nothing is printed
vi.mock('../logger');

// Import the code to test
import { talk } from './talk';

describe('Talk Slash Command', () => {
	const message = 'test';
	let context: TextInputCommandContext;
	const emptyBuffer: Buffer = Buffer.from([]);
	const mockPrepare = vi.fn();
	const mockReply = vi.fn();
	const mockGetString = vi.fn();
	const mockGetInteger = vi.fn();

	beforeEach(() => {
		context = {
			options: {
				getString: mockGetString,
				getInteger: mockGetInteger,
			},
			channel: {
				type: ChannelType.GuildText,
			},
			prepareForLongRunningTasks: mockPrepare,
			reply: mockReply,
		} as unknown as TextInputCommandContext;
		mockSay.mockReturnValue(emptyBuffer);
		mockGetString.mockReturnValue(message);
		mockGetInteger.mockReturnValue(null);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('Fails if no options are provided', async () => {
		mockGetInteger.mockReturnValueOnce(null);
		mockGetString.mockReturnValueOnce(null);
		await expect(talk.execute(context)).rejects.toThrow();
	});

	test('Fails if channel is undefined', async () => {
		context = { ...context, channel: null };
		await expect(talk.execute(context)).rejects.toThrow();
	});

	test('Prepares for long-running tasks and resolves interaction', async () => {
		await expect(talk.execute(context)).resolves.toBeUndefined();
		expect(mockPrepare).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledOnce();
	});

	test('Calls dectalk module to generate wav buffer', async () => {
		await expect(talk.execute(context)).resolves.toBeUndefined();
		expect(mockSay).toHaveBeenCalledOnce();
	});

	test('Replies with content of the message and the wav buffer in text channels', async () => {
		context = {
			...context,
			channel: { type: ChannelType.GuildText },
		} as unknown as TextInputCommandContext;
		await expect(talk.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledWith({
			files: [
				{
					name: `${message}.wav`,
					attachment: emptyBuffer,
				},
			],
			content: message,
		});
	});

	// TODO add tests for speaking in voice channels... eventually
	// It's hard and I'm lazy, so I'm skipping that for now
	// Would need to mock out lots of @discordjs/voice methods and event handlers with proper mock implementations

	// 'Throws errors for permissions issues'

	// 'Throws error if already talking in channel'

	// 'Writes the wav buffer to a temp file'

	// Idk what else - how to handle interconnected event handlers?

	// test('Replies with content of the message in voice channels', async () => {
	// 	context = {
	// 		...context,
	// 		channel: { type: ChannelType.GuildVoice },
	// 	} as unknown as TextInputCommandContext;
	// 	await expect(talk.execute(context)).resolves.toBeUndefined();
	// 	expect(mockReply).toHaveBeenCalledWith({
	// 		content: message,
	// 	});
	// });
});
