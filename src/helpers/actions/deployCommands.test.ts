import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Client, Guild, OAuth2Guild } from 'discord.js';
import { Collection, SlashCommandBuilder } from 'discord.js';

// Mock the logger so nothing is printed
vi.mock('../../logger.js');

const mockAllCommands = vi.hoisted(() => new Map<string, Command>());
vi.mock('../../commands/index.js', () => ({
	allCommands: mockAllCommands,
}));

vi.mock('./revokeCommands.js');
import { revokeCommands } from './revokeCommands.js';
const mockRevokeCommands = revokeCommands as Mock<typeof revokeCommands>;

import { deployCommands } from './deployCommands.js';

describe('Command deployments', () => {
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
			new Collection<string, OAuth2Guild>().set('test-guild1', {
				fetch: (): Promise<Guild> =>
					Promise.resolve({
						id: 'test-guild1',
						commands: {
							set: mockGuildCommandsSet,
						},
					} as unknown as Guild),
			} as OAuth2Guild)
		);
		const mockCommands: NonEmptyArray<Command> = [
			{
				info: new SlashCommandBuilder().setName('test1').setDescription(' '),
				requiresGuild: false,
				execute: () => undefined,
			},
			{
				info: new SlashCommandBuilder()
					.setName('test2')
					.setDescription(' ')
					.setNameLocalizations({}),
				requiresGuild: true,
				execute: () => undefined,
			},
			{
				info: new SlashCommandBuilder()
					.setName('test3')
					.setDescription(' ')
					.setNameLocalizations({})
					.setDescriptionLocalizations({}),
				requiresGuild: true,
				execute: () => undefined,
			},
			{
				info: new SlashCommandBuilder()
					.setName('test4')
					.setDescription(' ')
					.setNameLocalizations({})
					.setDescriptionLocalizations({})
					.addStringOption(option => option.setName('c').setDescription(' ')),
				requiresGuild: true,
				execute: () => undefined,
			},
			{
				info: new SlashCommandBuilder()
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
				info: new SlashCommandBuilder()
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
			mockAllCommands.set(cmd.info.name, cmd);
		}
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('does no deployments if there are no commands to deploy', async () => {
		mockAllCommands.clear();
		await deployCommands(mockClient);
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
		expect(mockApplicationCommandsSet).not.toHaveBeenCalled();
		expect(mockGuildCommandsSet).not.toHaveBeenCalled();
		expect(mockFetchOauthGuilds).not.toHaveBeenCalled();
	});

	test('revokes commands before deploying', async () => {
		mockRevokeCommands.mockRejectedValue(new Error('This is a test'));
		await expect(deployCommands(mockClient)).rejects.toThrowError();
		expect(mockRevokeCommands).toHaveBeenCalledOnce();
		expect(mockApplicationCommandsSet).not.toHaveBeenCalled();
		expect(mockGuildCommandsSet).not.toHaveBeenCalled();
		expect(mockFetchOauthGuilds).not.toHaveBeenCalled();
	});

	test('continues deployments if global commands fail to deploy', async () => {
		mockApplicationCommandsSet.mockRejectedValueOnce(new Error('This is a test'));
		await deployCommands(mockClient);
		expect(mockApplicationCommandsSet).toHaveBeenCalledOnce();
		expect(mockGuildCommandsSet).toHaveBeenCalledOnce();
	});

	test('continues deployments if guild-bound commands fail to deploy', async () => {
		mockGuildCommandsSet.mockRejectedValueOnce(new Error('This is a test'));
		await deployCommands(mockClient);
		expect(mockApplicationCommandsSet).toHaveBeenCalledOnce();
		expect(mockGuildCommandsSet).toHaveBeenCalledOnce();
	});
});
