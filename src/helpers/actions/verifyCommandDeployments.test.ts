import type { Client } from 'discord.js';
import { Collection } from 'discord.js';

const mockAllCommands = new Map<string, Command>();
jest.mock('../../commands', () => ({ allCommands: mockAllCommands }));

// Mock the logger to track output
import { warn as mockLoggerWarn } from '../testing/mockLogger';

import { verifyCommandDeployments } from './verifyCommandDeployments';

describe('Verify command deployments', () => {
	const commands: Array<Command> = [
		// Global Commands
		{
			name: 'zaphod',
			description: '',
			requiresGuild: false,
			execute: () => undefined,
		},
		{
			name: 'beeblebrox',
			description: '',
			requiresGuild: false,
			execute: () => undefined,
		},

		// Guild-bound Commands
		{
			name: 'arthur',
			description: '',
			requiresGuild: true,
			execute: () => undefined,
		},
		{
			name: 'dent',
			description: '',
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
		mockFetchApplicationCommands.mockResolvedValue(deployedGlobal);
		mockFetchGuildCommands.mockResolvedValue(deployedGuild);

		for (const cmd of commands) {
			mockAllCommands.set(cmd.name, cmd);
			if (cmd.requiresGuild) {
				deployedGuild.set(cmd.name, cmd);
			} else {
				deployedGlobal.set(cmd.name, cmd);
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
				name: 'ford',
				description: '',
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
				name: 'marvin',
				description: '',
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
