import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ChannelType } from 'discord.js';
// eslint-disable-next-line import/default, import/no-named-as-default, import/no-named-as-default-member
import type dectalk from 'dectalk-tts';

// Overwrite dectalk say method
const dectalkMock = vi.hoisted(() => vi.fn<typeof dectalk>());
vi.mock('dectalk-tts', () => ({ default: dectalkMock }));

// Mock the logger so nothing is printed
vi.mock('../logger');

// Import the code to test
import { Speaker, talk } from './talk.js';

describe('Talk Slash Command', () => {
	const speakerMock = vi.fn<() => Speaker | null>();
	const message = 'test';
	let context: TextInputCommandContext;
	const emptyBuffer: Buffer = Buffer.from([]);
	const prepareForLongRunningTasksMock =
		vi.fn<TextInputCommandContext['prepareForLongRunningTasks']>();
	const replyMock = vi.fn<TextInputCommandContext['reply']>();
	const getStringMock = vi.fn<TextInputCommandContext['options']['getString']>();

	beforeEach(() => {
		context = {
			options: {
				getString: getStringMock,
			},
			channel: {
				type: ChannelType.GuildText,
			},
			prepareForLongRunningTasks: prepareForLongRunningTasksMock,
			reply: replyMock,
		} as unknown as TextInputCommandContext;
		dectalkMock.mockResolvedValue(emptyBuffer);
		speakerMock.mockReturnValue(null);
		getStringMock.mockImplementation(name => {
			if (name === 'message') return message;
			if (name === 'speaker') return speakerMock();
			return null;
		});
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('Fails if channel is undefined', async () => {
		context = { ...context, channel: null };
		await expect(talk.execute(context)).rejects.toThrow();
	});

	test('Prepares for long-running tasks and resolves interaction', async () => {
		await talk.execute(context);
		expect(prepareForLongRunningTasksMock).toHaveBeenCalledOnce();
		expect(replyMock).toHaveBeenCalledOnce();
	});

	test('Calls dectalk-tts module to generate wav buffer', async () => {
		await talk.execute(context);
		expect(dectalkMock).toHaveBeenCalledOnce();
		expect(dectalkMock).toHaveBeenCalledWith(message);
	});

	test('Prepends the speaker name to the message if provided', async () => {
		const name = Speaker.Paul;
		speakerMock.mockReturnValueOnce(name);

		await talk.execute(context);
		expect(dectalkMock).toHaveBeenCalledWith(`[:name ${name}] ${message}`);
	});

	test('Replies with content of the message and the wav buffer in text channels', async () => {
		context = {
			...context,
			channel: { type: ChannelType.GuildText },
		} as unknown as TextInputCommandContext;
		await talk.execute(context);
		expect(replyMock).toHaveBeenCalledWith({
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

	// eslint-disable-next-line vitest/no-commented-out-tests
	// test('Replies with content of the message in voice channels', async () => {
	// 	context = {
	// 		...context,
	// 		channel: { type: ChannelType.GuildVoice },
	// 	} as unknown as TextInputCommandContext;
	// 	await talk.execute(context);
	// 	expect(mockReply).toHaveBeenCalledWith({
	// 		content: message,
	// 	});
	// });
});
