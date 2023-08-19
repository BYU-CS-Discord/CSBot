import { hangmanLessButton } from './hangmanLessButton';

describe('hangmanLessButton', () => {
	const mockUpdate = vi.fn();
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

		expect(mockUpdate).toHaveBeenCalledExactlyOnceWith({
			embeds: [expect.toBeObject()],
			components: expect.toBeArrayOfSize(5),
		});
	});
});
