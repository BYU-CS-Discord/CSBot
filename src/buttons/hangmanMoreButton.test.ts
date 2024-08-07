import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { hangmanMoreButton } from './hangmanMoreButton.js';

describe('hangmanMoreButton', () => {
	const mockUpdate = vi.fn<ButtonContext['interaction']['update']>();
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

	test('updates response to have second page of buttons', async () => {
		await hangmanMoreButton.execute(context);

		expect(mockUpdate).toHaveBeenCalledOnce();
		const response = mockUpdate.mock.calls.at(0)?.at(0);
		if (!response || typeof response === 'string' || !('embeds' in response)) {
			assert.fail('Did not update interaction with embeds');
		}
		expect(response.embeds.length).toEqual(1);
		expect(response.embeds.at(0)).toBeTypeOf('object');
		expect(response.components?.length).toEqual(1);
	});
});
