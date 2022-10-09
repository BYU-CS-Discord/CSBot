// Dependencies
import type {
	Interaction,
	CommandInteraction,
	TextBasedChannel,
	UserContextMenuCommandInteraction,
	User,
	GuildMember,
	MessageContextMenuCommandInteraction,
	Message,
} from 'discord.js';
import {
	ApplicationCommandType,
	ChannelType,
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
} from 'discord.js';

// Mock allCommands to isolate our test code
const mockAllCommands = new Map<string, Command>();
jest.mock('../commands', () => ({
	allCommands: mockAllCommands,
}));

// Create two mock commands to track handler behavior
const mockGlobalExecute = jest.fn();
const mockGlobalCommand: ChatInputCommand = {
	info: new SlashCommandBuilder() //
		.setName('global-test')
		.setDescription('lolcat'),
	requiresGuild: false,
	execute: mockGlobalExecute,
};
mockAllCommands.set(mockGlobalCommand.info.name, mockGlobalCommand);

const mockMessageContextMenuCommand: MessageContextMenuCommand = {
	info: new ContextMenuCommandBuilder()
		.setName('Do The Thing To This Message')
		.setType(ApplicationCommandType.Message),
	type: ApplicationCommandType.Message,
	requiresGuild: false,
	execute: mockGlobalExecute,
};
mockAllCommands.set(mockMessageContextMenuCommand.info.name, mockMessageContextMenuCommand);

const mockUserContextMenuCommand: UserContextMenuCommand = {
	info: new ContextMenuCommandBuilder()
		.setName('Do The Thing To This User')
		.setType(ApplicationCommandType.User),
	type: ApplicationCommandType.User,
	requiresGuild: false,
	execute: mockGlobalExecute,
};
mockAllCommands.set(mockUserContextMenuCommand.info.name, mockUserContextMenuCommand);

const mockGuildedExecute = jest.fn();
const mockGuildedCommand: ChatInputCommand = {
	info: new SlashCommandBuilder() //
		.setName('guilded-test')
		.setDescription('lolcat'),
	requiresGuild: true,
	execute: mockGuildedExecute,
};
mockAllCommands.set(mockGuildedCommand.info.name, mockGuildedCommand);

// Mock the logger to track output
jest.mock('../logger');
import { error as mockLoggerError } from '../logger';

// Import the code to test
import { interactionCreate } from './interactionCreate';

// Constants for testing
const interactionError = new Error('Failed to handle interaction. This is a test.');
const selfUid = 'self-1234';
const otherUid = 'other-1234';
const channelId = 'the-channel-1234';

const mockGuildMembersFetch = jest.fn();

// Helper function to create Interactions
// Reduces code duplication
function defaultInteraction(): Interaction {
	return {
		targetId: null,
		targetMessage: null,
		targetUser: null,
		targetMember: null,
		commandName: mockGlobalCommand.info.name,
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
		guild: {
			id: 'guild-1234',
			members: {
				fetch: mockGuildMembersFetch,
			},
		},
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
		expect(mockLoggerError).toHaveBeenCalledWith(
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
		(interaction as CommandInteraction).commandName = mockGuildedCommand.info.name;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGuildedExecute).toHaveBeenCalledOnce();
	});

	test('tells the user off when they try to execute a guilded command from DMs', async () => {
		let interaction = defaultInteraction();
		(interaction as CommandInteraction).commandName = mockGuildedCommand.info.name;
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

	test('throws an error if the command is a context menu user command and the interaction is not', async () => {
		const interaction = defaultInteraction() as UserContextMenuCommandInteraction;
		interaction.isUserContextMenuCommand = (): boolean => false;
		interaction.isMessageContextMenuCommand = (): boolean => false;
		interaction.commandName = mockUserContextMenuCommand.info.name;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
		expect(mockLoggerError).toHaveBeenCalledWith(
			expect.stringContaining('handle interaction'),
			new TypeError('Expected a User Context Menu Command interaction')
		);
	});

	test('throws an error if the command is a context menu message command and the interaction is not', async () => {
		const interaction = defaultInteraction() as UserContextMenuCommandInteraction;
		interaction.isUserContextMenuCommand = (): boolean => false;
		interaction.isMessageContextMenuCommand = (): boolean => false;
		interaction.commandName = mockMessageContextMenuCommand.info.name;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
		expect(mockLoggerError).toHaveBeenCalledWith(
			expect.stringContaining('handle interaction'),
			new TypeError('Expected a Message Context Menu Command interaction')
		);
	});

	test('fetches the member target from a partial guild member', async () => {
		const interaction = defaultInteraction() as UserContextMenuCommandInteraction;
		interaction.isUserContextMenuCommand = (): boolean => true;
		interaction.inCachedGuild = (): boolean => false;
		interaction.targetId = 'target-user-1234';
		(interaction as { targetUser: Pick<User, 'id'> }).targetUser = { id: 'target-user-1234' };
		interaction.commandName = mockUserContextMenuCommand.info.name;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGuildMembersFetch).toHaveBeenCalledWith(interaction.targetId);
		expect(mockGlobalExecute).toHaveBeenCalledOnce();
	});

	test('executes the user context menu command', async () => {
		const interaction = defaultInteraction() as UserContextMenuCommandInteraction;
		interaction.isUserContextMenuCommand = (): boolean => true;
		interaction.isMessageContextMenuCommand = (): boolean => false;
		interaction.targetId = 'target-user-1234';
		(interaction as { targetUser: Pick<User, 'id'> }).targetUser = { id: 'target-user-1234' };
		(interaction as { targetMember: Pick<GuildMember, 'id'> }).targetMember = {
			id: 'target-member-1234',
		};
		interaction.commandName = mockUserContextMenuCommand.info.name;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGuildMembersFetch).not.toHaveBeenCalled();
		expect(mockGlobalExecute).toHaveBeenCalledOnce();
	});

	test('executes the message context menu command', async () => {
		const interaction = defaultInteraction() as MessageContextMenuCommandInteraction;
		interaction.isUserContextMenuCommand = (): boolean => false;
		interaction.isMessageContextMenuCommand = (): boolean => true;
		interaction.targetId = 'target-msg-1234';
		(interaction as { targetMessage: Pick<Message, 'id'> }).targetMessage = {
			id: interaction.targetId,
		};
		interaction.commandName = mockMessageContextMenuCommand.info.name;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).toHaveBeenCalledOnce();
	});
});
