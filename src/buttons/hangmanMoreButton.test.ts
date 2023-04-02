import { hangmanMoreButton } from './hangmanMoreButton';

describe('hangmanMoreButton', () => {
	const mockUpdate = jest.fn();
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
		await expect(hangmanMoreButton.execute(context)).resolves.toBeUndefined();

		expect(mockUpdate).toHaveBeenCalledOnce();
		expect(mockUpdate).toHaveBeenCalledWith({
			embeds: [expect.toBeObject()],
			components: expect.toBeArrayOfSize(1),
		});
	});
});
