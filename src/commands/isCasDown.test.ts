import { afterEach, describe, expect, test, vi } from 'vitest';

import type { URL } from 'node:url';
import { Colors } from 'discord.js';
import type { EmbedBuilder } from '@discordjs/builders';

const fetchMock = vi.fn<[URL], Promise<Response>>();
vi.stubGlobal('fetch', fetchMock);

// Import the code to test
import { isCasDown } from './isCasDown';

describe('isCasDown', () => {
	const mockReply = vi.fn<[{ embeds: Array<EmbedBuilder>; ephemeral: boolean }], Promise<void>>();

	const goodResponse = {
		status: 200,
	} as Response;
	const badResponse = {
		status: 404,
	} as Response;

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('Returns the success embed when CAS returns a good response', async () => {
		fetchMock.mockResolvedValueOnce(goodResponse);
		await expect(isCasDown.execute({ reply: mockReply })).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply.mock.calls[0][0].embeds[0].data.color).toBe(Colors.Green);
	});

	test('Returns the failure embed when CAS returns a bad response', async () => {
		fetchMock.mockResolvedValueOnce(badResponse);
		await expect(isCasDown.execute({ reply: mockReply })).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply.mock.calls[0][0].embeds[0].data.color).toBe(Colors.Red);
	});
});
