import type { EmbedBuilder } from 'discord.js';
import { toTheGallows } from './toTheGallows';

jest.mock('../constants/meta', () => ({
	// Version changes frequently, so use a consistent version number to test with:
	appVersion: 'X.X.X',
	repo: jest.requireActual<typeof import('../constants/meta')>('../constants/meta').repo,
}));

describe('toTheGallows', () => {
	const mockReply = jest.fn();
	const mockGetInteger = jest.fn<number | null, [name: string]>();
	let context: TextInputCommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
			interaction: {
				options: {
					getInteger: mockGetInteger,
				},
			},
		} as unknown as TextInputCommandContext;

		mockGetInteger.mockReturnValue(null);
	});

	test('begins a game of evil hangman', async () => {
		await expect(toTheGallows.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			embeds: [expect.toBeObject()],
			components: expect.toBeArrayOfSize(5),
		});
	});

	test('specifying length and number of guesses always puts the game into the same state', async () => {
		mockGetInteger.mockReturnValue(4);
		await expect(toTheGallows.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			embeds: [expect.toBeObject()],
			components: expect.toBeArrayOfSize(5),
		});

		const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data).toMatchSnapshot();
	});
});
