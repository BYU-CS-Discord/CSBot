import type { Client } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';

const mockAllCommands = new Map<string, Command>();

jest.mock('../../commands', () => ({
	allCommands: mockAllCommands,
}));

jest.mock('./revokeCommands');
import { revokeCommands } from './revokeCommands';
const mockRevokeCommands = revokeCommands as jest.Mock;

import { deployCommands } from './deployCommands';

describe('Command deployments', () => {
	const mockApplicationCommandsSet = jest.fn();
	const mockGuildCommandsSet = jest.fn();
	const mockFetchOauthGuilds = jest.fn();
	const mockConsole = {
		debug: () => undefined,
		info: () => undefined,
		warn: () => undefined,
		error: () => undefined,
	} as unknown as Console;
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
		mockRevokeCommands.mockResolvedValue(undefined);
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
		]);
		const mockCommands: NonEmptyArray<Command> = [
			{
				name: 'test1',
				description: '',
				requiresGuild: false,
				execute: () => undefined,
			},
			{
				name: 'test2',
				nameLocalizations: {},
				description: '',
				requiresGuild: true,
				execute: () => undefined,
			},
			{
				name: 'test3',
				nameLocalizations: {},
				description: '',
				descriptionLocalizations: {},
				requiresGuild: true,
				execute: () => undefined,
			},
			{
				name: 'test4',
				nameLocalizations: {},
				description: '',
				descriptionLocalizations: {},
				requiresGuild: true,
				options: [{ name: '', description: '', type: ApplicationCommandOptionType.String }],
				execute: () => undefined,
			},
			{
				name: 'test5',
				nameLocalizations: {},
				description: '',
				descriptionLocalizations: {},
				requiresGuild: true,
				options: [{ name: '', description: '', type: ApplicationCommandOptionType.String }],
				defaultMemberPermissions: [],
				execute: () => undefined,
			},
			{
				name: 'test6',
				nameLocalizations: {},
				description: '',
				descriptionLocalizations: {},
				requiresGuild: true,
				options: [{ name: '', description: '', type: ApplicationCommandOptionType.String }],
				dmPermission: false,
				execute: () => undefined,
			},
		];
		for (const cmd of mockCommands) {
			mockAllCommands.set(cmd.name, cmd);
		}
	});

	test('does no deployments if there are no commands to deploy', async () => {
		mockAllCommands.clear();
		await expect(deployCommands(mockClient, mockConsole)).resolves.toBeUndefined();
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
		expect(mockApplicationCommandsSet).not.toHaveBeenCalled();
		expect(mockGuildCommandsSet).not.toHaveBeenCalled();
		expect(mockFetchOauthGuilds).not.toHaveBeenCalled();
	});

	test('calls mockRevokeCommands before any deployments', async () => {
		await expect(deployCommands(mockClient, mockConsole)).resolves.toBeUndefined();
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockApplicationCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockGuildCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockFetchOauthGuilds);
	});

	test('continues deployments if global commands fail to deploy', async () => {
		mockApplicationCommandsSet.mockRejectedValueOnce(new Error('This is a test'));
		await expect(deployCommands(mockClient, mockConsole)).resolves.toBeUndefined();
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockApplicationCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockGuildCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockFetchOauthGuilds);
	});

	test('continues deployments if guild-bound commands fail to deploy', async () => {
		mockGuildCommandsSet.mockRejectedValueOnce(new Error('This is a test'));
		await expect(deployCommands(mockClient, mockConsole)).resolves.toBeUndefined();
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockApplicationCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockGuildCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockFetchOauthGuilds);
	});
});
