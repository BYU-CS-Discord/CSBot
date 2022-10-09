import type { Client } from 'discord.js';
import { Collection, SlashCommandBuilder } from 'discord.js';

const mockAllCommands = new Map<string, Command>();
jest.mock('../../commands', () => ({ allCommands: mockAllCommands }));

// Mock the logger to track output
jest.mock('../../logger');
import { warn as mockLoggerWarn } from '../../logger';

import { verifyCommandDeployments } from './verifyCommandDeployments';

describe('Verify command deployments', () => {
	const commands: Array<Command> = [
		// Global Commands
		{
			info: new SlashCommandBuilder().setName('zaphod').setDescription(' '),
			requiresGuild: false,
			execute: () => undefined,
		},
		{
			info: new SlashCommandBuilder().setName('beeblebrox').setDescription(' '),
			requiresGuild: false,
			execute: () => undefined,
		},

		// Guild-bound Commands
		{
			info: new SlashCommandBuilder().setName('arthur').setDescription(' '),
			requiresGuild: true,
			execute: () => undefined,
		},
		{
			info: new SlashCommandBuilder().setName('dent').setDescription(' '),
			requiresGuild: true,
			execute: () => undefined,
		},
	];

	const mockFetchApplicationCommands = jest.fn();
	const mockFetchGuildCommands = jest.fn();

	const mockClient = {
		application: {
			commands: {
				fetch: mockFetchApplicationCommands,
			},
		},
		guilds: {
			fetch: () =>
				Promise.resolve(
					new Collection([
						[
							'guild1',
							{
								fetch: (): unknown =>
									Promise.resolve({
										id: 'guild1',
										commands: {
											fetch: mockFetchGuildCommands,
										},
									}),
							},
						],
					])
				),
		},
	} as unknown as Client<true>;

	beforeEach(() => {
		mockAllCommands.clear();
		const deployedGlobal = new Collection<string, Command>();
		const deployedGuild = new Collection<string, Command>();
		mockFetchApplicationCommands.mockImplementation(() =>
			Promise.resolve(deployedGlobal.map(c => c.info.toJSON()))
		);
		mockFetchGuildCommands.mockImplementation(() =>
			Promise.resolve(deployedGuild.map(c => c.info.toJSON()))
		);

		for (const cmd of commands) {
			mockAllCommands.set(cmd.info.name, cmd);
			if (cmd.requiresGuild) {
				deployedGuild.set(cmd.info.name, cmd);
			} else {
				deployedGlobal.set(cmd.info.name, cmd);
			}
		}
	});

	describe('Guild commands', () => {
		test('does nothing if the actual commands match expectations', async () => {
			await expect(verifyCommandDeployments(mockClient)).resolves.toBeUndefined();
			expect(mockFetchGuildCommands).toHaveBeenCalledOnce();
			expect(mockLoggerWarn).not.toHaveBeenCalled();
		});

		test('logs a warning if the number of commands differs', async () => {
			mockAllCommands.delete('arthur');

			await expect(verifyCommandDeployments(mockClient)).resolves.toBeUndefined();
			expect(mockFetchGuildCommands).toHaveBeenCalledOnce();
			expect(mockLoggerWarn).toHaveBeenCalledWith(
				expect.stringContaining("commands in guild 'guild1' differ")
			);
			expect(mockLoggerWarn).toHaveBeenCalledWith(expect.stringContaining('Expected 1'));
		});

		test('logs a warning if the command lists differ', async () => {
			mockAllCommands.delete('arthur');
			mockAllCommands.set('ford', {
				info: new SlashCommandBuilder().setName('ford').setDescription(' '),
				requiresGuild: true,
				execute: () => undefined,
			});

			await expect(verifyCommandDeployments(mockClient)).resolves.toBeUndefined();
			expect(mockFetchGuildCommands).toHaveBeenCalledOnce();
			expect(mockLoggerWarn).toHaveBeenCalledWith(
				expect.stringContaining("commands in guild 'guild1' differ")
			);
			expect(mockLoggerWarn).toHaveBeenCalledWith(
				expect.stringContaining("Expected a command named 'dent'")
			);
		});
	});

	describe('Global commands', () => {
		test('does nothing if the actual commands match expectations', async () => {
			await expect(verifyCommandDeployments(mockClient)).resolves.toBeUndefined();
			expect(mockFetchApplicationCommands).toHaveBeenCalledOnce();
			expect(mockLoggerWarn).not.toHaveBeenCalled();
		});

		test('logs a warning if the number of commands differs', async () => {
			mockAllCommands.delete('zaphod');

			await expect(verifyCommandDeployments(mockClient)).resolves.toBeUndefined();
			expect(mockFetchApplicationCommands).toHaveBeenCalledOnce();
			expect(mockLoggerWarn).toHaveBeenCalledWith(expect.stringContaining('commands differ'));
			expect(mockLoggerWarn).toHaveBeenCalledWith(expect.stringContaining('Expected 1'));
		});

		test('logs a warning if the command lists differ', async () => {
			mockAllCommands.delete('zaphod');
			mockAllCommands.set('marvin', {
				info: new SlashCommandBuilder().setName('marvin').setDescription(' '),
				requiresGuild: false,
				execute: () => undefined,
			});

			await expect(verifyCommandDeployments(mockClient)).resolves.toBeUndefined();
			expect(mockFetchApplicationCommands).toHaveBeenCalledOnce();
			expect(mockLoggerWarn).toHaveBeenCalledWith(expect.stringContaining('commands differ'));
			expect(mockLoggerWarn).toHaveBeenCalledWith(
				expect.stringContaining("Expected a command named 'marvin'")
			);
		});
	});
});
