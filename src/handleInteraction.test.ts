import type { CommandInteraction } from 'discord.js';
import { ChannelType } from 'discord.js';

const mockAllCommands = new Map<string, Command>();

jest.mock('./commands', () => ({
	allCommands: mockAllCommands,
}));

import { handleInteraction } from './handleInteraction';

describe('Command event handler', () => {
	const selfUid = 'self-1234';
	const otherUid = 'other-1234';
	const channelId = 'the-channel-1234';
	const mockConsole = {
		debug: () => undefined,
		info: () => undefined,
		warn: () => undefined,
		error: () => undefined,
	} as unknown as Console;

	test('does nothing if the sender is a bot', async () => {
		const mockExecute = jest.fn();
		const mockCommand: Command = {
			name: 'global-guild-test',
			description: 'lolcat',
			requiresGuild: false,
			execute: mockExecute,
		};
		mockAllCommands.set(mockCommand.name, mockCommand);

		const interaction = {
			commandName: mockCommand.name,
			options: { data: [] },
			client: {
				user: { id: selfUid },
			},
			user: {
				bot: true,
				id: otherUid,
			},
			channelId,
			inCachedGuild: () => false,
			inGuild: () => false,
			member: null,
			guild: null,
			channel: { type: ChannelType.DM },
		} as unknown as CommandInteraction;

		await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
		expect(mockExecute).not.toHaveBeenCalled();
	});

	test('does nothing if the sender is us', async () => {
		const mockExecute = jest.fn();
		const mockCommand: Command = {
			name: 'global-guild-test',
			description: 'lolcat',
			requiresGuild: false,
			execute: mockExecute,
		};
		mockAllCommands.set(mockCommand.name, mockCommand);

		const interaction = {
			commandName: mockCommand.name,
			options: { data: [] },
			client: {
				user: { id: selfUid },
			},
			user: {
				bot: false,
				id: selfUid,
			},
			channelId,
			inCachedGuild: () => false,
			inGuild: () => false,
			member: null,
			guild: null,
			channel: { type: ChannelType.DM },
		} as unknown as CommandInteraction;

		await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
		expect(mockExecute).not.toHaveBeenCalled();
	});

	test('does nothing if the command is not found', async () => {
		const mockExecute = jest.fn();
		const mockCommand: Command = {
			name: 'global-guild-test',
			description: 'lolcat',
			requiresGuild: false,
			execute: mockExecute,
		};
		mockAllCommands.set(mockCommand.name, mockCommand);

		const interaction = {
			commandName: 'nop',
			options: { data: [] },
			client: {
				user: { id: selfUid },
			},
			user: {
				bot: false,
				id: otherUid,
			},
			channelId,
			inCachedGuild: () => false,
			inGuild: () => false,
			member: null,
			guild: null,
			channel: { type: ChannelType.DM },
		} as unknown as CommandInteraction;

		await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
		expect(mockExecute).not.toHaveBeenCalled();
	});

	test('calls the `execute` method of a global command from a guild', async () => {
		const mockExecute = jest.fn();
		const mockCommand: Command = {
			name: 'global-guild-test',
			description: 'lolcat',
			requiresGuild: false,
			execute: mockExecute,
		};
		mockAllCommands.set(mockCommand.name, mockCommand);

		const interaction = {
			commandName: mockCommand.name,
			options: { data: [] },
			client: {
				user: { id: selfUid },
			},
			user: {
				bot: false,
				id: otherUid,
			},
			channelId,
			inCachedGuild: () => true,
			inGuild: () => true,
			member: { id: otherUid },
			guild: { id: 'guild-1234' },
			channel: { type: ChannelType.GuildText },
		} as unknown as CommandInteraction;

		await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
		expect(mockExecute).toHaveBeenCalledOnce();
	});

	test('calls the `execute` method of a global command from DMs', async () => {
		const mockExecute = jest.fn();
		const mockCommand: Command = {
			name: 'global-test',
			description: 'lolcat',
			requiresGuild: false,
			execute: mockExecute,
		};
		mockAllCommands.set(mockCommand.name, mockCommand);

		const interaction = {
			commandName: mockCommand.name,
			options: { data: [] },
			client: {
				user: { id: selfUid },
			},
			user: {
				bot: false,
				id: otherUid,
			},
			channelId,
			inCachedGuild: () => false,
			inGuild: () => false,
			member: null,
			guild: null,
			channel: { type: ChannelType.DM },
		} as unknown as CommandInteraction;

		await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
		expect(mockExecute).toHaveBeenCalledOnce();
	});

	test('calls the `execute` method of a guilded command from a guild', async () => {
		const mockExecute = jest.fn();
		const mockCommand: Command = {
			name: 'guilded-test',
			description: 'lolcat',
			requiresGuild: true,
			execute: mockExecute,
		};
		mockAllCommands.set(mockCommand.name, mockCommand);

		const interaction = {
			commandName: mockCommand.name,
			options: { data: [] },
			client: {
				user: { id: selfUid },
			},
			user: {
				bot: false,
				id: otherUid,
			},
			channelId,
			inCachedGuild: () => true,
			inGuild: () => true,
			member: { id: otherUid },
			guild: { id: 'guild-1234' },
			channel: { type: ChannelType.GuildText },
		} as unknown as CommandInteraction;

		await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
		expect(mockExecute).toHaveBeenCalledOnce();
	});

	test('tells the user off when they try to execute a guilded command from DMs', async () => {
		const mockExecute = jest.fn();
		const mockInteractionReply = jest.fn();
		const mockCommand: Command = {
			name: 'guilded-dm-test',
			description: 'lolcat',
			requiresGuild: true,
			execute: mockExecute,
		};
		mockAllCommands.set(mockCommand.name, mockCommand);

		const interaction = {
			commandName: mockCommand.name,
			options: {
				data: [],
			},
			client: {
				user: { id: selfUid },
			},
			user: {
				bot: false,
				id: otherUid,
			},
			channelId,
			inCachedGuild: () => false,
			inGuild: () => false,
			guild: null,
			member: null,
			channel: { type: ChannelType.DM },
			reply: mockInteractionReply,
		} as unknown as CommandInteraction;

		await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
		expect(mockExecute).not.toHaveBeenCalled();
		expect(mockInteractionReply).toHaveBeenCalledOnce();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: "Can't do that here",
			ephemeral: true,
		});
	});
});
