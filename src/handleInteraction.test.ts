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
	const mockConsole = {
		debug: () => undefined,
		info: () => undefined,
		warn: () => undefined,
		error: () => undefined,
	} as unknown as Console;

	describe('Context', () => {
		const mockInteractionSendTyping = jest.fn();
		const mockInteractionReply = jest.fn();
		const mockInteractionDeferReply = jest.fn();
		const mockInteractionEditReply = jest.fn();
		const mockInteractionFollowUp = jest.fn();
		const mockUserSend = jest.fn();
		const mockCommand: Command = {
			name: 'context-test',
			description: 'lolcat',
			requiresGuild: false,
			async execute(context) {
				context.sendTyping();
				await context.prepareForLongRunningTasks();
				await context.reply('yo');
				await context.followUp('yo again');
				await context.replyPrivately('yo in secret');
				await context.replyPrivately({ content: 'yo object in secret' });
				await context.replyPrivately('yo DMs', true);
				await context.replyPrivately({ content: 'yo DMs object' }, true);
			},
		};
		mockAllCommands.set(mockCommand.name, mockCommand);

		let interaction: CommandInteraction;

		beforeEach(() => {
			interaction = {
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
					send: mockUserSend,
				},
				inCachedGuild: () => false,
				member: null,
				guild: null,
				channel: {
					type: ChannelType.DM,
					sendTyping: mockInteractionSendTyping,
				},
				deferred: false,
				reply: mockInteractionReply,
				deferReply: mockInteractionDeferReply,
				editReply: mockInteractionEditReply,
				followUp: mockInteractionFollowUp,
			} as unknown as CommandInteraction;
		});

		test('sends typing indicator when requested', async () => {
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionSendTyping).toHaveBeenCalledOnce();
		});

		test('sends deferrment when requested', async () => {
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionDeferReply).toHaveBeenCalledOnce();
		});

		test('edits interaction reply if deferred', async () => {
			interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionEditReply).toHaveBeenCalledWith('yo');
		});

		test('falls back to a followup if interaction edit failed', async () => {
			mockInteractionEditReply.mockRejectedValueOnce(new Error('This is a test.'));

			interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionEditReply).toHaveBeenCalledWith('yo');
			expect(mockInteractionFollowUp).toHaveBeenCalledWith('yo');
		});

		test('sends public reply to interaction with text', async () => {
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionReply).toHaveBeenCalledWith('yo');
		});

		test('sends a followup message to the interaction', async () => {
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionFollowUp).toHaveBeenCalledWith('yo again');
		});

		test('sends an ephemeral reply to the interaction', async () => {
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionReply).toHaveBeenCalledWith({
				content: 'yo in secret',
				ephemeral: true,
			});
		});

		test('sends an ephemeral follow-up message to the interaction if the interaction is deferred', async () => {
			interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionFollowUp).toHaveBeenCalledWith({
				content: 'yo in secret',
				ephemeral: true,
			});
		});

		test('sends an ephemeral follow-up message from options to the interaction if the interaction is deferred', async () => {
			interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionFollowUp).toHaveBeenCalledWith({
				content: 'yo object in secret',
				ephemeral: true,
			});
		});

		test('sends an ephemeral reply to check DMs', async () => {
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionReply).toHaveBeenCalledWith({
				content: expect.stringContaining('Check your DMs') as string,
				ephemeral: true,
			});
			expect(mockUserSend).toHaveBeenCalledWith('yo DMs');
		});

		test('edits the reply message to check DMs if the interaction was deferred', async () => {
			interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
			await expect(handleInteraction(interaction, mockConsole)).resolves.toBeUndefined();
			expect(mockInteractionEditReply).toHaveBeenCalledWith(
				expect.stringContaining('Check your DMs') as string
			);
			expect(mockUserSend).toHaveBeenCalledWith({ content: 'yo DMs object' });
		});
	});

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
			inCachedGuild: () => false,
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
			inCachedGuild: () => false,
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
			inCachedGuild: () => false,
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
			inCachedGuild: () => true,
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
			inCachedGuild: () => false,
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
			inCachedGuild: () => true,
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
			inCachedGuild: () => false,
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
