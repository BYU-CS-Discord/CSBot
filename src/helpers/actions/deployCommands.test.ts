import type { Client } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

jest.mock('../../logger');
import { getLogger } from '../../logger';
const mockGetLogger = getLogger as jest.Mock;
mockGetLogger.mockImplementation(() => {
	return {
		debug: () => undefined,
		info: () => undefined,
		warn: () => undefined,
		error: () => undefined,
	} as unknown as Console;
});

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
		mockGuildCommandsSet.mockImplementation(values => Promise.resolve(values));
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
				commandBuilder: new SlashCommandBuilder().setName('test1').setDescription(' '),
				requiresGuild: false,
				execute: () => undefined,
			},
			{
				commandBuilder: new SlashCommandBuilder()
					.setName('test2')
					.setDescription(' ')
					.setNameLocalizations({}),
				requiresGuild: true,
				execute: () => undefined,
			},
			{
				commandBuilder: new SlashCommandBuilder()
					.setName('test3')
					.setDescription(' ')
					.setNameLocalizations({})
					.setDescriptionLocalizations({}),
				requiresGuild: true,
				execute: () => undefined,
			},
			{
				commandBuilder: new SlashCommandBuilder()
					.setName('test4')
					.setDescription(' ')
					.setNameLocalizations({})
					.setDescriptionLocalizations({})
					.addStringOption(option => option.setName('c').setDescription(' ')),
				requiresGuild: true,
				execute: () => undefined,
			},
			{
				commandBuilder: new SlashCommandBuilder()
					.setName('test5')
					.setDescription(' ')
					.setNameLocalizations({})
					.setDescriptionLocalizations({})
					.setDefaultMemberPermissions(null)
					.addStringOption(option => option.setName('c').setDescription(' ')),
				requiresGuild: true,
				execute: () => undefined,
			},
			{
				commandBuilder: new SlashCommandBuilder()
					.setName('test6')
					.setDescription(' ')
					.setNameLocalizations({})
					.setDescriptionLocalizations({})
					.setDMPermission(false)
					.addStringOption(option => option.setName('c').setDescription(' ')),
				requiresGuild: true,
				execute: () => undefined,
			},
		];
		for (const cmd of mockCommands) {
			mockAllCommands.set(cmd.commandBuilder.name, cmd);
		}
	});

	test('does no deployments if there are no commands to deploy', async () => {
		mockAllCommands.clear();
		await expect(deployCommands(mockClient)).resolves.toBeUndefined();
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
		expect(mockApplicationCommandsSet).not.toHaveBeenCalled();
		expect(mockGuildCommandsSet).not.toHaveBeenCalled();
		expect(mockFetchOauthGuilds).not.toHaveBeenCalled();
	});

	test('calls mockRevokeCommands before any deployments', async () => {
		await expect(deployCommands(mockClient)).resolves.toBeUndefined();
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockApplicationCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockGuildCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockFetchOauthGuilds);
	});

	test('continues deployments if global commands fail to deploy', async () => {
		mockApplicationCommandsSet.mockRejectedValueOnce(new Error('This is a test'));
		await expect(deployCommands(mockClient)).resolves.toBeUndefined();
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockApplicationCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockGuildCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockFetchOauthGuilds);
	});

	test('continues deployments if guild-bound commands fail to deploy', async () => {
		mockGuildCommandsSet.mockRejectedValueOnce(new Error('This is a test'));
		await expect(deployCommands(mockClient)).resolves.toBeUndefined();
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockApplicationCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockGuildCommandsSet);
		expect(mockRevokeCommands).toHaveBeenCalledBefore(mockFetchOauthGuilds);
	});
});
