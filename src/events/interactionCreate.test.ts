// Dependencies
import type { Interaction, CommandInteraction, TextBasedChannel } from 'discord.js';
import { ChannelType, SlashCommandBuilder } from 'discord.js';

// Mock allCommands to isolate our test code
const mockAllCommands = new Map<string, Command>();
jest.mock('../commands', () => ({
	allCommands: mockAllCommands,
}));

// Create two mock commands to track handler behavior
const mockGlobalExecute = jest.fn();
const mockGlobalCommand: Command = {
	commandBuilder: new SlashCommandBuilder().setName('global-test').setDescription('lolcat'),
	requiresGuild: false,
	execute: mockGlobalExecute,
};
mockAllCommands.set(mockGlobalCommand.commandBuilder.name, mockGlobalCommand);
const mockGuildedExecute = jest.fn();
const mockGuildedCommand: Command = {
	commandBuilder: new SlashCommandBuilder().setName('guilded-test').setDescription('lolcat'),
	requiresGuild: true,
	execute: mockGuildedExecute,
};
mockAllCommands.set(mockGuildedCommand.commandBuilder.name, mockGuildedCommand);

// Mock the logger to track error output
jest.mock('../logger');
import { getLogger } from '../logger';
const mockGetLogger = getLogger as jest.Mock;
const mockConsoleError = jest.fn();
mockGetLogger.mockImplementation(() => {
	return {
		info: () => undefined,
		debug: () => undefined,
		warn: () => undefined,
		error: mockConsoleError,
	} as unknown as Console;
});

// Import the code to test
import { interactionCreate } from './interactionCreate';

// Constants for testing
const interactionError = new Error('Failed to handle interaction. This is a test.');
const selfUid = 'self-1234';
const otherUid = 'other-1234';
const channelId = 'the-channel-1234';

// Helper function to create Interactions
// Reduces code duplication
function defaultInteraction(): Interaction {
	return {
		commandName: mockGlobalCommand.commandBuilder.name,
		options: { data: [] },
		client: { user: { id: selfUid } },
		user: {
			bot: false,
			id: otherUid,
		},
		channelId,
		inCachedGuild: () => true,
		inGuild: () => true,
		member: { id: otherUid },
		guild: { id: 'guild-1234' },
		channel: {
			type: ChannelType.GuildText,
			partial: false,
		},
		isCommand: () => true,
	} as unknown as Interaction;
}

describe('on(interactionCreate)', () => {
	test('logs interaction errors', async () => {
		const interaction = defaultInteraction();
		interaction.isCommand = (): boolean => {
			throw interactionError;
		};

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockConsoleError).toHaveBeenCalledWith(
			expect.stringContaining('handle interaction'),
			interactionError
		);
	});

	test("does nothing if the interaction isn't a command", async () => {
		const interaction = defaultInteraction();
		interaction.isCommand = (): boolean => false;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
	});

	test('does nothing if the sender is a bot', async () => {
		const interaction = defaultInteraction();
		interaction.user.bot = true;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
	});

	test('does nothing if the sender is us', async () => {
		const interaction = defaultInteraction();
		interaction.user.id = selfUid;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
	});

	test('does nothing if the command is not found', async () => {
		const interaction = defaultInteraction();
		(interaction as CommandInteraction).commandName = 'nop';

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
	});

	test('calls the `execute` method of a global command from a guild', async () => {
		const interaction = defaultInteraction();

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).toHaveBeenCalledOnce();
	});

	test('calls the `execute` method of a global command from DMs', async () => {
		let interaction = defaultInteraction();
		interaction.inCachedGuild = (): boolean => false;
		interaction.inGuild = (): boolean => false;
		interaction.member = null;

		const channel = {
			type: ChannelType.DM,
		} as unknown as TextBasedChannel;

		const guild = null;

		// Overwrite 'read-only' parameters of Interaction
		interaction = {
			...interaction,
			guild: guild,
			channel: channel,
		} as unknown as Interaction;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).toHaveBeenCalledOnce();
	});

	test('calls the `execute` method of a guilded command from a guild', async () => {
		const interaction = defaultInteraction();
		(interaction as CommandInteraction).commandName = mockGuildedCommand.commandBuilder.name;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGuildedExecute).toHaveBeenCalledOnce();
	});

	test('tells the user off when they try to execute a guilded command from DMs', async () => {
		let interaction = defaultInteraction();
		(interaction as CommandInteraction).commandName = mockGuildedCommand.commandBuilder.name;
		interaction.inCachedGuild = (): boolean => false;
		interaction.inGuild = (): boolean => false;
		interaction.member = null;

		const channel = {
			type: ChannelType.DM,
		} as unknown as TextBasedChannel;

		const guild = null;

		// Overwrite 'read-only' parameters of Interaction
		interaction = {
			...interaction,
			guild: guild,
			channel: channel,
		} as unknown as Interaction;

		const mockInteractionReply = jest.fn();
		(interaction as CommandInteraction).reply = mockInteractionReply;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGuildedExecute).not.toHaveBeenCalled();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: "Can't do that here",
			ephemeral: true,
		});
	});

	// This is for 100% code coverage
	test('fetches the channel when a command comes from a partial DM channel', async () => {
		let interaction = defaultInteraction();
		interaction.inCachedGuild = (): boolean => false;
		interaction.inGuild = (): boolean => false;
		interaction.member = null;

		const mockChannelFetch = jest.fn();
		const channel = {
			type: ChannelType.DM,
			partial: true,
			fetch: mockChannelFetch,
		} as unknown as TextBasedChannel;

		const guild = null;

		// Overwrite 'read-only' parameters of Interaction
		interaction = {
			...interaction,
			guild: guild,
			channel: channel,
		} as unknown as Interaction;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockChannelFetch).toHaveBeenCalledOnce();
	});
});
