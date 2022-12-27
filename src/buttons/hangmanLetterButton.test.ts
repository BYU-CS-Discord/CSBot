import { letterButtons } from '../evilHangman/hangmanLetterButtons';
import { UserMessageError } from '../helpers/UserMessageException';

describe('hangmanMoreButton', () => {
	const mockUpdate = jest.fn();
	const beforeInfo = 'Remaining Guesses: 3\nWord: ---\nLetters Guessed: a';
	const message = {
		embeds: [
			{
				data: {
					fields: ['ascii art', { value: 'Remaining Guesses: 3\nWord: ---\nLetters Guessed: a' }],
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

	test('different letter buttons have unique ids', () => {
		const aButton = letterButtons[0];
		const bButton = letterButtons[1];

		expect(aButton?.customId).not.toEqual(bButton?.customId);
	});

	test('guessing a letter updates the game info panel', async () => {
		const bButton = letterButtons[1];
		await expect(bButton?.execute(context)).resolves.toBeUndefined();

		expect(mockUpdate).toHaveBeenCalledOnce();
		const lastCall = mockUpdate.mock.lastCall as unknown as [
			{ embeds: [{ data: { fields: [unknown, { value: string }] } }] }
		];
		const afterInfo = lastCall[0].embeds[0].data.fields[1].value;
		expect(afterInfo).toBeString();
		expect(afterInfo).not.toEqual(beforeInfo);
	}, 15000);

	test('guessing an already guessed letter shows an error message', async () => {
		const aButton = letterButtons[0];
		await expect(aButton?.execute(context)).rejects.toBeInstanceOf(UserMessageError);
		expect(mockUpdate).not.toHaveBeenCalled();
	});
});
