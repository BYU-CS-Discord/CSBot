import type { EmbedBuilder, MessageReplyOptions } from 'discord.js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { toTheGallows } from './toTheGallows.js';

vi.mock('../constants/meta', async () => {
	const { repo } =
		await vi.importActual<typeof import('../constants/meta.js')>('../constants/meta.js');
	return {
		// Version changes frequently, so use a consistent version number to test with:
		appVersion: 'X.X.X',
		repo,
	};
});

describe('toTheGallows', () => {
	const mockReply = vi.fn<[MessageReplyOptions]>();
	const mockGetInteger = vi.fn<[name: string], number | null>();
	let context: TextInputCommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
			options: {
				getInteger: mockGetInteger,
			},
		} as unknown as TextInputCommandContext;

		mockGetInteger.mockReturnValue(null);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('begins a game of evil hangman', async () => {
		await expect(toTheGallows.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledOnce();
		const response = mockReply.mock.calls.at(0)?.[0];
		expect(response?.embeds?.length).toEqual(1);
		expect(response?.embeds?.at(0)).toBeTypeOf('object');
		expect(response?.components?.length).toEqual(5);
	});

	test('specifying length and number of guesses always puts the game into the same state', async () => {
		mockGetInteger.mockReturnValue(4);
		await expect(toTheGallows.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledOnce();

		const response = mockReply.mock.calls.at(0)?.at(0);
		expect(response?.embeds?.length).toEqual(1);
		const embed = response?.embeds?.at(0) as EmbedBuilder | undefined;
		expect(embed?.data).toMatchSnapshot();
		expect(response?.components?.length).toEqual(5);
	});
});
