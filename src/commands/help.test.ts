import type { EmbedBuilder } from 'discord.js';

jest.mock('../constants/meta', () => ({
	// Version changes frequently, so use a consistent version number to test with:
	appVersion: 'X.X.X',
	repo: jest.requireActual<typeof import('../constants/meta')>('../constants/meta').repo,
}));

import { help } from './help';

describe('help', () => {
	const mockReply = jest.fn();
	let context: CommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
		} as unknown as CommandContext;
	});

	test('presents an ephemeral embed with general info', async () => {
		context = { ...context, source: 'dm' } as unknown as CommandContext;

		await expect(help.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			embeds: [expect.toBeObject()],
			ephemeral: true,
		});
		const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data).toMatchSnapshot();
	});
});
