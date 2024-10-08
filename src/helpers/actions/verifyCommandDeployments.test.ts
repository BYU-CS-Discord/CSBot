import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Client, Guild } from 'discord.js';
import { Collection, SlashCommandBuilder } from 'discord.js';

const mockAllCommands = vi.hoisted(() => new Map<string, Command>());
vi.mock('../../commands', () => ({ allCommands: mockAllCommands }));

// Mock the logger to track output
vi.mock('../../logger.js');
import { warn as mockLoggerWarn } from '../../logger.js';

import { deployableCommand } from './deployCommands.js';
import { verifyCommandDeployments } from './verifyCommandDeployments.js';

describe('Verify command deployments', () => {
	const commands: Array<Command> = [
		// Global Commands
		{
			info: new SlashCommandBuilder().setName('zaphod').setDescription(' '),
			requiresGuild: false,
			execute: vi.fn(),
		},
		{
			info: new SlashCommandBuilder().setName('beeblebrox').setDescription(' '),
			requiresGuild: false,
			execute: vi.fn(),
		},

		// Guild-bound Commands
		{
			info: new SlashCommandBuilder().setName('arthur').setDescription(' '),
			requiresGuild: true,
			execute: vi.fn(),
		},
		{
			info: new SlashCommandBuilder().setName('dent').setDescription(' '),
			requiresGuild: true,
			execute: vi.fn(),
		},
	];

	const mockFetchApplicationCommands =
		vi.fn<NonNullable<Client['application']>['commands']['fetch']>();
	const mockFetchGuildCommands = vi.fn<Guild['commands']['set']>();

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
			// @ts-expect-error Really complicated errors with discord.js types that I don't want to deal with
			Promise.resolve(deployedGlobal.map(deployableCommand))
		);
		mockFetchGuildCommands.mockImplementation(() =>
			// @ts-expect-error Really complicated errors with discord.js types that I don't want to deal with
			Promise.resolve(deployedGuild.map(deployableCommand))
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

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('Guild commands', () => {
		test('does nothing if the actual commands match expectations', async () => {
			await verifyCommandDeployments(mockClient);
			expect(mockFetchGuildCommands).toHaveBeenCalledOnce();
			expect(mockLoggerWarn).not.toHaveBeenCalled();
		});

		test('logs a warning if the number of commands differs', async () => {
			mockAllCommands.delete('arthur');

			await verifyCommandDeployments(mockClient);
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
				execute: vi.fn(),
			});

			await verifyCommandDeployments(mockClient);
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
			await verifyCommandDeployments(mockClient);
			expect(mockFetchApplicationCommands).toHaveBeenCalledOnce();
			expect(mockLoggerWarn).not.toHaveBeenCalled();
		});

		test('logs a warning if the number of commands differs', async () => {
			mockAllCommands.delete('zaphod');

			await verifyCommandDeployments(mockClient);
			expect(mockFetchApplicationCommands).toHaveBeenCalledOnce();
			expect(mockLoggerWarn).toHaveBeenCalledWith(expect.stringContaining('commands differ'));
			expect(mockLoggerWarn).toHaveBeenCalledWith(expect.stringContaining('Expected 1'));
		});

		test('logs a warning if the command lists differ', async () => {
			mockAllCommands.delete('zaphod');
			mockAllCommands.set('marvin', {
				info: new SlashCommandBuilder().setName('marvin').setDescription(' '),
				requiresGuild: false,
				execute: vi.fn(),
			});

			await verifyCommandDeployments(mockClient);
			expect(mockFetchApplicationCommands).toHaveBeenCalledOnce();
			expect(mockLoggerWarn).toHaveBeenCalledWith(expect.stringContaining('commands differ'));
			expect(mockLoggerWarn).toHaveBeenCalledWith(
				expect.stringContaining("Expected a command named 'marvin'")
			);
		});
	});
});
