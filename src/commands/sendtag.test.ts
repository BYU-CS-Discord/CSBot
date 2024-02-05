import type { AutocompleteInteraction } from 'discord.js';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { sendtag } from './sendtag';

describe('sendtag', () => {
	const mockReply = vi.fn<[content: string], Promise<void>>();
	const mockGetString = vi.fn<[name: string, required: true], string>();

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
