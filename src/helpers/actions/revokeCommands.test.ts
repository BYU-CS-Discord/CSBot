import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Collection, OAuth2Guild, type Client, type Guild } from 'discord.js';

// Mock the logger so nothing is printed
vi.mock('../../logger.js');

import { revokeCommands } from './revokeCommands.js';

describe('Command revocations', () => {
	const mockApplicationCommandsSet = vi.fn<NonNullable<Client['application']>['commands']['set']>();
	const mockGuildCommandsSet = vi.fn<Guild['commands']['set']>();
	const mockFetchOauthGuilds = vi.fn<Client['guilds']['fetch']>();

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
		mockGuildCommandsSet.mockImplementation(() => Promise.resolve(new Collection()));
		mockFetchOauthGuilds.mockResolvedValue(
			new Collection<string, OAuth2Guild>()
				.set('test-guild1', {
					fetch: () =>
						Promise.resolve({
							id: 'test-guild1',
							commands: {
								set: mockGuildCommandsSet,
							},
						} as unknown as Guild),
				} as OAuth2Guild)
				.set('test-guild2', {
					fetch: () =>
						Promise.resolve({
							id: 'test-guild2',
							commands: {
								set: mockGuildCommandsSet,
							},
						} as unknown as Guild),
				} as OAuth2Guild)
		);
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
