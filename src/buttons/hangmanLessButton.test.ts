import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { MessageReplyOptions } from 'discord.js';

import { hangmanLessButton } from './hangmanLessButton.js';

describe('hangmanLessButton', () => {
	const mockUpdate = vi.fn<[MessageReplyOptions]>();
	const message = {
		embeds: [
			{
				data: {
					fields: ['ascii art', { value: 'Remaining Guesses: 3\nWord: ---\nLetters Guessed: ' }],
				},
			},
		],
	};
	let context: ButtonContext;

	beforeEach(() => {
		context = {
			interaction: {
				update: mockUpdate,
			},
			message,
		} as unknown as ButtonContext;
	});

	test('updates response to have first (full) page of buttons', async () => {
		await expect(hangmanLessButton.execute(context)).resolves.toBeUndefined();

		expect(mockUpdate).toHaveBeenCalledOnce();
		const response = mockUpdate.mock.calls.at(0)?.at(0);
		expect(response?.embeds?.length).toEqual(1);
		expect(response?.embeds?.at(0)).toBeTypeOf('object');
		expect(response?.components?.length).toEqual(5);
	});
});
