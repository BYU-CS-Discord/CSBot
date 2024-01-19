import type { EmbedBuilder } from 'discord.js';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../constants/meta', async () => {
	const { repo } = await vi.importActual<typeof import('../constants/meta')>('../constants/meta');
	return {
		// Version changes frequently, so use a consistent version number to test with:
		appVersion: 'X.X.X',
		repo,
	};
});

import { help } from './help';

describe('help', () => {
	const mockReply = vi.fn();
	let context: TextInputCommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
		} as unknown as TextInputCommandContext;
	});

	test('presents an ephemeral embed with general info', async () => {
		context = { ...context, source: 'dm' } as unknown as TextInputCommandContext;

		await expect(help.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			embeds: [expect.objectContaining({})],
			ephemeral: true,
		});
		const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data).toMatchSnapshot();
	});
});
