import type { CommandInteraction } from 'discord.js';
import type { Command } from './Command';
import { ChannelType } from 'discord.js';

const mockExecute = jest.fn();

const mockCommand: Command = {
	name: 'test',
	description: 'lolcat',
	requiresGuild: false,
	execute: mockExecute,
};

const mockAllCommands = new Map<string, Command>([[mockCommand.name, mockCommand]]);

jest.mock('./commands', () => ({
	allCommands: mockAllCommands,
}));

import { handleInteraction } from './handleInteraction';

describe('Command event handler', () => {
	const selfUid = 'self-1234';
	const otherUid = 'other-1234';
	const mockConsole = {
		debug: () => undefined,
		info: () => undefined,
		warn: () => undefined,
		error: () => undefined,
	} as unknown as Console;

	test('calls the `execute` method of a global command from DMs', async () => {
		const interaction = {
			commandName: mockCommand.name,
			options: {
				data: [],
			},
			client: {
				user: {
					id: selfUid,
				},
			},
			user: {
				bot: false,
				id: otherUid,
			},
			member: null,
			channel: {
				type: ChannelType.DM,
			},
			inCachedGuild: () => false,
		} as unknown as CommandInteraction;

		await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
		expect(mockExecute).toHaveBeenCalledOnce();
	});
});
