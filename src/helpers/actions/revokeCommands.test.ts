import type { Client } from 'discord.js';

// Mock the logger so nothing is printed
jest.mock('../../logger');

import { revokeCommands } from './revokeCommands';

describe('Command revocations', () => {
	const mockApplicationCommandsSet = jest.fn();
	const mockGuildCommandsSet = jest.fn();
	const mockFetchOauthGuilds = jest.fn();

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

	test('clears global commands', async () => {
		await expect(revokeCommands(mockClient)).resolves.toBeUndefined();
		expect(mockApplicationCommandsSet).toHaveBeenCalledOnce();
	});

	test('clears commands for each guild', async () => {
		await expect(revokeCommands(mockClient)).resolves.toBeUndefined();
		expect(mockGuildCommandsSet).toHaveBeenCalledTimes(2);
	});
});
