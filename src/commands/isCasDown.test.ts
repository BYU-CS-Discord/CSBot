import { afterEach, assert, describe, expect, test, vi } from 'vitest';

import { Colors } from 'discord.js';

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', fetchMock);

// Import the code to test
import { isCasDown } from './isCasDown.js';

describe('isCasDown', () => {
	const mockReply = vi.fn<TextInputCommandContext['reply']>();

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
		await isCasDown.execute({ reply: mockReply });
		expect(mockReply).toHaveBeenCalledOnce();
		const response = mockReply.mock.calls.at(0)?.at(0);
		if (!response || typeof response === 'string' || !response.embeds) {
			assert.fail('Did not reply to interaction with embeds');
		}
		expect(response.embeds.length).toEqual(1);
		const embed = response.embeds.at(0);
		const embedData = 'toJSON' in embed ? embed.toJSON() : embed;
		expect(embedData.color).toBe(Colors.Green);
	});

	test('Returns the failure embed when CAS returns a bad response', async () => {
		fetchMock.mockResolvedValueOnce(badResponse);
		await isCasDown.execute({ reply: mockReply });
		expect(mockReply).toHaveBeenCalledOnce();
		const response = mockReply.mock.calls.at(0)?.at(0);
		if (!response || typeof response === 'string' || !response.embeds) {
			assert.fail('Did not reply to interaction with embeds');
		}
		expect(response.embeds.length).toEqual(1);
		const embed = response.embeds.at(0);
		const embedData = 'toJSON' in embed ? embed.toJSON() : embed;
		expect(embedData.color).toBe(Colors.Red);
	});
});
