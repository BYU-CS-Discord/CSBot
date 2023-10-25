// Dependencies
import type {
	ApplicationCommandOptionChoiceData,
	AutocompleteInteraction,
	CommandInteraction,
	GuildMember,
	Interaction,
	Message,
	ButtonInteraction,
	MessageContextMenuCommandInteraction,
	TextBasedChannel,
	User,
	UserContextMenuCommandInteraction,
} from 'discord.js';
import {
	ApplicationCommandType,
	ButtonBuilder,
	ChannelType,
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { UserMessageError } from '../helpers/UserMessageError';

// Mock allCommands to isolate our test code
const mockAllCommands = vi.hoisted(() => new Map<string, Command>());
vi.mock('../commands', () => ({
	allCommands: mockAllCommands,
}));

// Create two mock commands to track handler behavior
const mockGlobalExecute = vi.fn();
const mockGlobalCommand: ChatInputCommand = {
	info: new SlashCommandBuilder() //
		.setName('global-test')
		.setDescription('lolcat'),
	requiresGuild: false,
	execute: mockGlobalExecute,
};
mockAllCommands.set(mockGlobalCommand.info.name, mockGlobalCommand);

const mockGlobalAutocomplete = vi.fn();
const mockGlobalAutocompleteCommand: ChatInputCommand = {
	info: new SlashCommandBuilder() //
		.setName('global-autocomplete-test')
		.setDescription('lolcat'),
	requiresGuild: false,
	execute: mockGlobalExecute,
	autocomplete: mockGlobalAutocomplete,
};
mockAllCommands.set(mockGlobalAutocompleteCommand.info.name, mockGlobalAutocompleteCommand);

const mockMessageContextMenuCommand: MessageContextMenuCommand = {
	info: new ContextMenuCommandBuilder()
		.setName('Do The Thing To This Message')
		.setType(ApplicationCommandType.Message),
	type: ApplicationCommandType.Message,
	requiresGuild: false,
	execute: mockGlobalExecute,
};
mockAllCommands.set(mockMessageContextMenuCommand.info.name, mockMessageContextMenuCommand);

const mockErrorMessageContextMenuCommand: MessageContextMenuCommand = {
	info: new ContextMenuCommandBuilder()
		.setName("Don't Do The Thing To This Msg")
		.setType(ApplicationCommandType.Message),
	type: ApplicationCommandType.Message,
	requiresGuild: false,
	execute: () => {
		throw new Error('Command error, this is a test');
	},
};
mockAllCommands.set(
	mockErrorMessageContextMenuCommand.info.name,
	mockErrorMessageContextMenuCommand
);

const mockUserContextMenuCommand: UserContextMenuCommand = {
	info: new ContextMenuCommandBuilder()
		.setName('Do The Thing To This User')
		.setType(ApplicationCommandType.User),
	type: ApplicationCommandType.User,
	requiresGuild: false,
	execute: mockGlobalExecute,
};
mockAllCommands.set(mockUserContextMenuCommand.info.name, mockUserContextMenuCommand);

const mockErrorUserContextMenuCommand: UserContextMenuCommand = {
	info: new ContextMenuCommandBuilder()
		.setName("Don't Do The Thing To This User")
		.setType(ApplicationCommandType.User),
	type: ApplicationCommandType.User,
	requiresGuild: false,
	execute: () => {
		throw new Error('Command error, this is a test');
	},
};
mockAllCommands.set(mockErrorUserContextMenuCommand.info.name, mockErrorUserContextMenuCommand);

const mockGuildedExecute = vi.fn();
const mockGuildedCommand: ChatInputCommand = {
	info: new SlashCommandBuilder() //
		.setName('guilded-test')
		.setDescription('lolcat'),
	requiresGuild: true,
	execute: mockGuildedExecute,
};
mockAllCommands.set(mockGuildedCommand.info.name, mockGuildedCommand);

const mockErrorGlobalCommand: Command = {
	info: new SlashCommandBuilder() //
		.setName('global-error-test')
		.setDescription('whoops'),
	requiresGuild: false,
	execute: () => {
		throw new Error('Command error, this is a test');
	},
};
mockAllCommands.set(mockErrorGlobalCommand.info.name, mockErrorGlobalCommand);

const mockErrorGuildedCommand: Command = {
	info: new SlashCommandBuilder() //
		.setName('guilded-error-test')
		.setDescription('whoops'),
	requiresGuild: true,
	execute: () => {
		throw new Error('Command error, this is a test');
	},
};
mockAllCommands.set(mockErrorGuildedCommand.info.name, mockErrorGuildedCommand);

const userErrorMessage = 'This is a user message error message';
const mockUserMessageErrorGlobalCommand: Command = {
	info: new SlashCommandBuilder() //
		.setName('global-error-test')
		.setDescription('whoops'),
	requiresGuild: false,
	execute: () => {
		throw new UserMessageError(userErrorMessage);
	},
};
mockAllCommands.set(mockUserMessageErrorGlobalCommand.info.name, mockUserMessageErrorGlobalCommand);

// Mock allButtons to isolate our test code
const mockAllButtons = vi.hoisted(() => new Map<string, Button>());
vi.mock('../buttons', () => ({
	allButtons: mockAllButtons,
}));

const mockButton: Button = {
	customId: 'test-button',
	execute: mockGlobalExecute,
	makeBuilder: () => new ButtonBuilder(),
};
mockAllButtons.set(mockButton.customId, mockButton);

const mockErrorButton: Button = {
	customId: 'test-error-button',
	execute: () => {
		throw new Error('Button error, this is a test');
	},
	makeBuilder: () => new ButtonBuilder(),
};
mockAllButtons.set(mockErrorButton.customId, mockErrorButton);

// Mock the logger to track output
vi.mock('../logger');
import { error as mockLoggerError } from '../logger';

// Import the code to test
import { interactionCreate } from './interactionCreate';

// Constants for testing
const interactionError = new Error('Failed to handle interaction. This is a test.');
const selfUid = 'self-1234';
const otherUid = 'other-1234';
const channelId = 'the-channel-1234';

const mockGuildMembersFetch = vi.fn();

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
		isButton: () => false,
		isChatInputCommand: () => true,
		isAutocomplete: () => false,
		replied: false,
	} as unknown as Interaction;
}

describe('on(interactionCreate)', () => {
	beforeEach(() => {
		mockGlobalAutocomplete.mockReturnValue([{ name: 'Sample', value: 'sample' }]);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('commands', () => {
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

		test("does nothing if the interaction isn't a supported interaction type", async () => {
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

			const mockInteractionReply = vi.fn();
			(interaction as CommandInteraction).reply = mockInteractionReply;

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockGuildedExecute).not.toHaveBeenCalled();
			expect(mockInteractionReply).toHaveBeenCalledWith({
				content: "Can't do that here",
				ephemeral: true,
			});
		});

		test('sends an error embed message when global command throws an error', async () => {
			const interaction = defaultInteraction();
			(interaction as CommandInteraction).commandName = mockErrorGlobalCommand.info.name;

			const mockInteractionReply = vi.fn();
			(interaction as CommandInteraction).reply = mockInteractionReply;

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockInteractionReply).toHaveBeenCalledOnce();
		});

		test('sends an error embed message when guilded command throws an error', async () => {
			const interaction = defaultInteraction();
			(interaction as CommandInteraction).commandName = mockErrorGuildedCommand.info.name;

			const mockInteractionReply = vi.fn();
			(interaction as CommandInteraction).reply = mockInteractionReply;

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockInteractionReply).toHaveBeenCalledOnce();
		});

		test('sends an error embed with a specified message when global command throws an error', async () => {
			const interaction = defaultInteraction();
			(interaction as CommandInteraction).commandName = mockUserMessageErrorGlobalCommand.info.name;

			const mockInteractionReply = vi.fn();
			(interaction as CommandInteraction).reply = mockInteractionReply;

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockInteractionReply).toHaveBeenCalledOnce();

			const lastCall = mockInteractionReply.mock.lastCall as unknown as [
				{ embeds: [{ data: { description: string } }] }
			];
			const description = lastCall[0].embeds[0].data.description;
			expect(description).toBe(userErrorMessage);
		});

		test('sends an error embed message when message context menu command throws an error', async () => {
			const interaction = defaultInteraction();
			(interaction as CommandInteraction).commandName =
				mockErrorMessageContextMenuCommand.info.name;

			const mockInteractionReply = vi.fn();
			(interaction as CommandInteraction).reply = mockInteractionReply;
			(interaction as CommandInteraction).isMessageContextMenuCommand = (): boolean => true;

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockInteractionReply).toHaveBeenCalledOnce();
		});

		test('sends an error embed message when user context menu command throws an error', async () => {
			const interaction = defaultInteraction();
			(interaction as CommandInteraction).commandName = mockErrorUserContextMenuCommand.info.name;

			const mockInteractionReply = vi.fn();
			(interaction as CommandInteraction).reply = mockInteractionReply;
			(interaction as CommandInteraction).isUserContextMenuCommand = (): boolean => true;

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockInteractionReply).toHaveBeenCalledOnce();
		});

		test('edits the reply with an error embed message when a command that has already been replied to throws an error', async () => {
			const interaction = defaultInteraction();
			(interaction as CommandInteraction).commandName = mockErrorGlobalCommand.info.name;

			(interaction as CommandInteraction).replied = true;

			const mockInteractionEditReply = vi.fn();
			(interaction as CommandInteraction).editReply = mockInteractionEditReply;

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockInteractionEditReply).toHaveBeenCalledOnce();
		});

		// This is for 100% code coverage
		test('fetches the channel when a command comes from a partial DM channel', async () => {
			let interaction = defaultInteraction();
			interaction.inCachedGuild = (): boolean => false;
			interaction.inGuild = (): boolean => false;
			interaction.member = null;

			const mockChannelFetch = vi.fn();
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
			interaction.isChatInputCommand = (): boolean => false;
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
			interaction.isChatInputCommand = (): boolean => false;
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
			interaction.isChatInputCommand = (): boolean => false;
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

	describe('autocomplete', () => {
		const mockRespond = vi.fn<
			[options: Array<ApplicationCommandOptionChoiceData>],
			Promise<void>
		>();

		let interaction: AutocompleteInteraction;

		beforeEach(() => {
			interaction = defaultInteraction() as AutocompleteInteraction;
			interaction.isAutocomplete = (): boolean => true;
			interaction.isCommand = (): boolean => false;
			interaction.isButton = (): boolean => false;
			interaction.isChatInputCommand = (): boolean => false;
			interaction.respond = mockRespond;
			interaction.commandName = mockGlobalAutocompleteCommand.info.name;
		});

		test('returns zero results if the command is not found', async () => {
			interaction.commandName = 'nop';

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockGlobalExecute).not.toHaveBeenCalled();
			expect(mockGuildedExecute).not.toHaveBeenCalled();
			expect(mockRespond).toHaveBeenCalledWith([]);
			expect(mockGlobalAutocomplete).not.toHaveBeenCalled();
		});

		test('returns zero results if the command is a message context menu command', async () => {
			interaction.commandName = mockMessageContextMenuCommand.info.name;

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockGlobalExecute).not.toHaveBeenCalled();
			expect(mockGuildedExecute).not.toHaveBeenCalled();
			expect(mockRespond).toHaveBeenCalledWith([]);
			expect(mockGlobalAutocomplete).not.toHaveBeenCalled();
		});

		test('returns zero results if the command is a user context menu command', async () => {
			interaction.commandName = mockUserContextMenuCommand.info.name;

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockGlobalExecute).not.toHaveBeenCalled();
			expect(mockGuildedExecute).not.toHaveBeenCalled();
			expect(mockRespond).toHaveBeenCalledWith([]);
			expect(mockGlobalAutocomplete).not.toHaveBeenCalled();
		});

		test('returns zero results if the command has no autocomplete handler', async () => {
			interaction.commandName = mockGlobalCommand.info.name;

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockGlobalExecute).not.toHaveBeenCalled();
			expect(mockGuildedExecute).not.toHaveBeenCalled();
			expect(mockRespond).toHaveBeenCalledWith([]);
			expect(mockGlobalAutocomplete).not.toHaveBeenCalled();
		});

		test("responds with the command's autocomplete values", async () => {
			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockGlobalExecute).not.toHaveBeenCalled();
			expect(mockGuildedExecute).not.toHaveBeenCalled();
			expect(mockRespond).toHaveBeenCalledOnce();
			expect(mockGlobalAutocomplete).toHaveBeenCalledWith(interaction);
		});

		test('returns zero results if theres an error fetching the autocomplete values', async () => {
			mockGlobalAutocomplete.mockImplementationOnce(() => {
				throw new Error('test error');
			});

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockGlobalExecute).not.toHaveBeenCalled();
			expect(mockGuildedExecute).not.toHaveBeenCalled();
			expect(mockRespond).toHaveBeenCalledWith([]);
			expect(mockGlobalAutocomplete).toHaveBeenCalledWith(interaction);
		});

		test('doesn\t die if the error handler fails to respond with zero results', async () => {
			mockGlobalAutocomplete.mockImplementationOnce(() => {
				throw new Error('test error');
			});
			mockRespond.mockRejectedValueOnce(new Error('test error about the error'));

			await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
			expect(mockGlobalExecute).not.toHaveBeenCalled();
			expect(mockGuildedExecute).not.toHaveBeenCalled();
			expect(mockRespond).toHaveBeenCalledWith([]);
			expect(mockGlobalAutocomplete).toHaveBeenCalledWith(interaction);
		});
	});

	test('does nothing if the button is not found', async () => {
		const interaction = defaultInteraction() as ButtonInteraction;
		interaction.customId = 'nop';
		interaction.isCommand = (): boolean => false;
		interaction.isButton = (): boolean => true;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).not.toHaveBeenCalled();
	});

	test('executes the button', async () => {
		const interaction = defaultInteraction() as ButtonInteraction;
		interaction.isCommand = (): boolean => false;
		interaction.isButton = (): boolean => true;
		interaction.customId = mockButton.customId;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockGlobalExecute).toHaveBeenCalledOnce();
	});

	test('sends an error embed message when button throws an error', async () => {
		const interaction = defaultInteraction() as ButtonInteraction;
		interaction.isCommand = (): boolean => false;
		interaction.isButton = (): boolean => true;
		interaction.customId = mockErrorButton.customId;

		const mockInteractionReply = vi.fn();
		interaction.reply = mockInteractionReply;

		await expect(interactionCreate.execute(interaction)).resolves.toBeUndefined();
		expect(mockInteractionReply).toHaveBeenCalledOnce();
	});
});
