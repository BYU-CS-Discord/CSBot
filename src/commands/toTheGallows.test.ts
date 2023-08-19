import type { EmbedBuilder } from 'discord.js';
import { toTheGallows } from './toTheGallows';

vi.mock('../constants/meta', async () => {
	const { repo } = await vi.importActual<typeof import('../constants/meta')>('../constants/meta');
	return {
		// Version changes frequently, so use a consistent version number to test with:
		appVersion: 'X.X.X',
		repo,
	};
});

describe('toTheGallows', () => {
	const mockReply = vi.fn();
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

	test('begins a game of evil hangman', async () => {
		await expect(toTheGallows.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledExactlyOnceWith({
			embeds: [expect.toBeObject()],
			components: expect.toBeArrayOfSize(5),
		});
	});

	test('specifying length and number of guesses always puts the game into the same state', async () => {
		mockGetInteger.mockReturnValue(4);
		await expect(toTheGallows.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledExactlyOnceWith({
			embeds: [expect.toBeObject()],
			components: expect.toBeArrayOfSize(5),
		});

		const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data).toMatchSnapshot();
	});
});
