import type { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the logger so nothing is printed
vi.mock('../../logger.js');

import { revokeCommands } from './revokeCommands.js';

describe('Command revocations', () => {
	const mockApplicationCommandsSet = vi.fn();
	const mockGuildCommandsSet = vi.fn();
	const mockFetchOauthGuilds = vi.fn();

	const mockClient = {
		application: {
			commands: {
				set: mockApplicationCommandsSet,
			},
		},
		guilds: {
			fetch: mockFetchOauthGuilds,
		},
	} as unknown as Client;

	beforeEach(() => {
		mockApplicationCommandsSet.mockResolvedValue(undefined);
		mockGuildCommandsSet.mockImplementation(vals => Promise.resolve(vals));
		mockFetchOauthGuilds.mockResolvedValue([
			{
				fetch: (): Promise<unknown> =>
					Promise.resolve({
						id: 'test-guild1',
						commands: {
							set: mockGuildCommandsSet,
						},
					}),
			},
			{
				fetch: (): Promise<unknown> =>
					Promise.resolve({
						id: 'test-guild2',
						commands: {
							set: mockGuildCommandsSet,
						},
					}),
			},
		]);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('clears global commands', async () => {
		await expect(revokeCommands(mockClient)).resolves.toBeUndefined();
		expect(mockApplicationCommandsSet).toHaveBeenCalledOnce();
	});

	test('clears commands for each guild', async () => {
		await expect(revokeCommands(mockClient)).resolves.toBeUndefined();
		expect(mockGuildCommandsSet).toHaveBeenCalledTimes(2);
	});
});
