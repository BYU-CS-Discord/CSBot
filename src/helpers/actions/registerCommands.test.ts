import { describe, expect, test, vi } from 'vitest';

import type { Client, Guild, OAuth2Guild } from 'discord.js';
import {
	ApplicationCommandType,
	Collection,
	ContextMenuCommandBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';

import { areCommandsRegistered } from './areCommandsRegistered.ts';
import { registerCommands } from './registerCommands.ts';

const mockAllCommands = vi.hoisted(() => new Map<string, Command>());
vi.mock(import('../../commands/index.ts'), () => ({
	allCommands: mockAllCommands,
}));

vi.mock('../../logger.ts');

vi.mock(import('./areCommandsRegistered.ts'), () => ({
	areCommandsRegistered: vi.fn().mockReturnValue(false),
}));

describe('Command registration', () => {
	const mockCommands: NonEmptyArray<Command> = [
		{
			info: new SlashCommandBuilder().setName('test1').setDescription(' '),
			requiresGuild: false,
			execute: vi.fn(),
		},
		{
			info: new SlashCommandBuilder().setName('test2').setDescription(' ').setNameLocalizations({}),
			requiresGuild: true,
			execute: vi.fn(),
		},
		{
			info: new SlashCommandBuilder()
				.setName('test3')
				.setDescription(' ')
				.setNameLocalizations({})
				.setDescriptionLocalizations({}),
			requiresGuild: true,
			execute: vi.fn(),
		},
		{
			info: new SlashCommandBuilder()
				.setName('test4')
				.setDescription(' ')
				.setNameLocalizations({})
				.setDescriptionLocalizations({})
				.addStringOption(option => option.setName('c').setDescription(' ')),
			requiresGuild: true,
			execute: vi.fn(),
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
			execute: vi.fn(),
		},
		{
			info: new SlashCommandBuilder()
				.setName('test6')
				.setDescription(' ')
				.setNameLocalizations({})
				.setDescriptionLocalizations({})
				.setContexts(InteractionContextType.Guild)
				.addStringOption(option => option.setName('c').setDescription(' ')),
			requiresGuild: true,
			execute: vi.fn(),
		},
		{
			info: new ContextMenuCommandBuilder().setName('test6'),
			type: ApplicationCommandType.Message,
			requiresGuild: false,
			execute: vi.fn(),
		},
	];
	for (const cmd of mockCommands) {
		mockAllCommands.set(cmd.info.name, cmd);
	}

	const mockApplicationCommandsFetch = vi
		.fn<Client<true>['application']['commands']['fetch']>()
		.mockResolvedValue(new Collection());

	const mockApplicationCommandsSet = vi
		.fn<Client<true>['application']['commands']['set']>()
		.mockResolvedValue(new Collection());

	const mockFetchOauthGuilds = vi.fn<Client['guilds']['fetch']>().mockResolvedValue(
		new Collection<string, OAuth2Guild>().set('test-guild1', {
			fetch: (): Promise<Guild> =>
				Promise.resolve({
					id: 'test-guild1',
					commands: {
						fetch: mockGuildCommandsFetch,
						set: mockGuildCommandsSet,
					},
				} as unknown as Guild),
		} as OAuth2Guild)
	);

	const mockGuildCommandsFetch = vi
		.fn<Guild['commands']['fetch']>()
		.mockResolvedValue(new Collection());

	const mockGuildCommandsSet = vi
		.fn<Guild['commands']['set']>()
		.mockResolvedValue(new Collection());

	const mockClient = {
		application: {
			commands: {
				fetch: mockApplicationCommandsFetch,
				set: mockApplicationCommandsSet,
			},
		},
		guilds: {
			fetch: mockFetchOauthGuilds,
		},
	} as unknown as Client<true>;

	test('should not register if commands are already in sync', async () => {
		vi.mocked(areCommandsRegistered).mockReturnValueOnce(true);
		await registerCommands(mockClient);
		expect(mockApplicationCommandsSet).not.toHaveBeenCalled();
		expect(mockGuildCommandsSet).not.toHaveBeenCalled();
	});

	test('continues registration if global commands fail to register', async () => {
		vi.mocked(areCommandsRegistered).mockReturnValueOnce(false).mockReturnValueOnce(true);
		mockApplicationCommandsSet.mockRejectedValueOnce(new Error('This is a test'));
		await registerCommands(mockClient);
		expect(mockApplicationCommandsSet).toHaveBeenCalledOnce();
		expect(mockGuildCommandsSet).toHaveBeenCalledOnce();
	});

	test('continues registration if guild-bound commands fail to register', async () => {
		vi.mocked(areCommandsRegistered).mockReturnValueOnce(false).mockReturnValueOnce(true);
		mockGuildCommandsSet.mockRejectedValueOnce(new Error('This is a test'));
		await registerCommands(mockClient);
		expect(mockApplicationCommandsSet).toHaveBeenCalledOnce();
		expect(mockGuildCommandsSet).toHaveBeenCalledOnce();
	});

	test('should log an error if commands are still not registered after registration', async () => {
		vi.mocked(areCommandsRegistered).mockReturnValueOnce(false).mockReturnValueOnce(false);
		await registerCommands(mockClient);
		expect(mockApplicationCommandsSet).toHaveBeenCalledOnce();
		expect(mockGuildCommandsSet).toHaveBeenCalledOnce();
	});
});
