// Dependencies
import type { Interaction, CommandInteraction } from 'discord.js';
import { ChannelType } from 'discord.js';

// Mock allCommands to isolate our test code
const mockAllCommands = new Map<string, Command>();
jest.mock('../commands', () => ({
	allCommands: mockAllCommands,
}));

// Create two mock commands to track handler behavior
const mockGlobalExecute = jest.fn();
const mockGlobalCommand: Command = {
	name: 'global-test',
	description: 'lolcat',
	requiresGuild: false,
	execute: mockGlobalExecute,
};
mockAllCommands.set(mockGlobalCommand.name, mockGlobalCommand);
const mockGuildedExecute = jest.fn();
const mockGuildedCommand: Command = {
	name: 'guilded-test',
	description: 'lolcat',
	requiresGuild: true,
	execute: mockGuildedExecute,
};
mockAllCommands.set(mockGuildedCommand.name, mockGuildedCommand);

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

// This method helps reduce code duplication
// It takes an arbitrarily-long list of strings that specify settings
// Defaults are global, nonBot, fromOther, inGuild, nonPartial, and isCommand
// Options are guilded, bot, fromSelf, DM, partial, and notCommand
function interactionGenerator(...args: Array<any>): Interaction {
	const guilded = args.includes('guilded');
	const bot = args.includes('bot');
	const fromSelf = args.includes('fromSelf');
	const DM = args.includes('DM');
	const partial = args.includes('partial');
	const isCommand = !args.includes('notCommand');
	return {
		commandName: guilded ? mockGuildedCommand.name : mockGlobalCommand.name,
		options: { data: [] },
		client: {
			user: { id: selfUid },
		},
		user: {
			bot: bot,
			id: fromSelf ? selfUid : otherUid,
		},
		channelId,
		inCachedGuild: () => !DM,
		inGuild: () => !DM,
		member: DM ? null : { id: otherUid },
		guild: DM ? null : { id: 'guild-1234' },
		channel: {
			type: DM ? ChannelType.DM : ChannelType.GuildText,
			partial: partial,
		},
		isCommand: () => isCommand,
	} as unknown as Interaction;
}

describe('on(interactionCreate)', () => {
	beforeEach(() => {
		// nothing for now
	});

	afterEach(() => {
		// jest.restoreAllMocks();
	});

	test('reports interaction errors', async () => {
		const interaction = interactionGenerator();
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
		const interaction = interactionGenerator('notCommand');

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
	});

	test('does nothing if the sender is a bot', async () => {
		const interaction = interactionGenerator('bot');

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
	});

	test('does nothing if the sender is us', async () => {
		const interaction = interactionGenerator('fromSelf');

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
	});

	test('does nothing if the command is not found', async () => {
		const interaction = interactionGenerator();
		(interaction as CommandInteraction).commandName = 'nop';

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
	});

	test('calls the `execute` method of a global command from a guild', async () => {
		const interaction = interactionGenerator();

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).toHaveBeenCalledOnce();
	});

	test('calls the `execute` method of a global command from DMs', async () => {
		const interaction = interactionGenerator('DM');

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).toHaveBeenCalledOnce();
	});

	test('calls the `execute` method of a guilded command from a guild', async () => {
		const interaction = interactionGenerator('guilded');

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGuildedExecute).toHaveBeenCalledOnce();
	});

	test('tells the user off when they try to execute a guilded command from DMs', async () => {
		const interaction = interactionGenerator('guilded', 'DM');
		const mockInteractionReply = jest.fn();
		(interaction as CommandInteraction).reply = mockInteractionReply;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGuildedExecute).not.toHaveBeenCalled();
		expect(mockInteractionReply).toHaveBeenCalledOnce();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: "Can't do that here",
			ephemeral: true,
		});
	});

	test('fetches the channel when a command comes from a partial DM channel', async () => {
		// This is for 100% code coverage
		const interaction = interactionGenerator('DM', 'partial');
		const mockChannelFetch = jest.fn();
		if (interaction.channel) {
			interaction.channel.fetch = mockChannelFetch;
		}

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockChannelFetch).toHaveBeenCalledOnce();
	});
});
