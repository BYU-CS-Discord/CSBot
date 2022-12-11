// External dependencies
import { ChannelType } from 'discord.js';

// Overwrite dectalk say method
const mockSay = jest.fn();
const dectalk = jest.requireActual<typeof import('dectalk')>('dectalk');
jest.mock('dectalk', () => ({
	...dectalk,
	say: mockSay,
}));

// Mock the logger so nothing is printed
jest.mock('../logger');

// Import the code to test
import { talk } from './talk';

describe('Talk Slash Command', () => {
	const message = 'test';
	let context: TextInputCommandContext;
	const emptyBuffer: Buffer = Buffer.from([]);
	const mockPrepare = jest.fn();
	const mockReply = jest.fn();

	beforeEach(() => {
		context = {
			interaction: {
				options: {
					data: {
						length: 1,
					},
					getString: () => message,
					getInteger: () => undefined,
				},
			},
			channel: {
				type: ChannelType.GuildText,
			},
			prepareForLongRunningTasks: mockPrepare,
			reply: mockReply,
		} as unknown as TextInputCommandContext;
		mockSay.mockReturnValue(emptyBuffer);
	});

	test('Fails if no options are provided', async () => {
		context = {
			...context,
			interaction: { options: { data: { length: 0 } } },
		} as unknown as TextInputCommandContext;
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

	// eslint-disable-next-line jest/no-commented-out-tests
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
