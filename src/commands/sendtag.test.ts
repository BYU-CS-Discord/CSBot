import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { AutocompleteInteraction } from 'discord.js';

import { sendtag } from './sendtag.js';

describe('sendtag', () => {
	const mockReply = vi.fn<GuildedCommandContext['reply']>();
	const mockGetString = vi.fn<GuildedCommandContext['options']['getString']>();

	let context: GuildedCommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
			options: {
				getString: mockGetString,
				getFocused: () => '',
			},
			interaction: {
				options: {
					getString: mockGetString,
					getFocused: () => '',
				},
			},
		} as unknown as GuildedCommandContext;

		mockReply.mockResolvedValue(undefined);
		mockGetString.mockReturnValue('');
	});

	test('presents an response with the given option string', async () => {
		const value = 'lorem ipsum';
		mockGetString.mockReturnValue(value);
		await expect(sendtag.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith(`You requested the '${value}' tag!`);
	});

	test('returns an array for autocomplete', () => {
		expect(
			sendtag.autocomplete?.(context.interaction as unknown as AutocompleteInteraction)
		).toBeDefined();
	});
});
