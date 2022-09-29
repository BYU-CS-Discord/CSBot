import type { CommandInteraction } from 'discord.js';

jest.mock('../helpers/actions/messages/replyToMessage');
import { replyWithPrivateMessage } from '../helpers/actions/messages/replyToMessage';
const mockSendDm = replyWithPrivateMessage as jest.Mock;

import { replyPrivatelyFactory as factory } from './replyPrivately';

describe('ephemeral and DM replies', () => {
	mockSendDm.mockResolvedValue(true);
	const mockInteractionReply = jest.fn();
	const mockInteractionEditReply = jest.fn();
	const mockInteractionFollowUp = jest.fn();
	const mockConsoleInfo = jest.fn();
	const mockConsoleError = jest.fn();

	const mockConsole = {
		info: mockConsoleInfo,
		error: mockConsoleError,
	} as unknown as Console;

	let interaction: CommandInteraction;
	let replyPrivately: CommandContext['replyPrivately'];

	beforeEach(() => {
		interaction = {
			deferred: false,
			user: { id: 'user-id-1234' },
			reply: mockInteractionReply,
			editReply: mockInteractionEditReply,
			followUp: mockInteractionFollowUp,
		} as unknown as CommandInteraction;

		replyPrivately = factory(interaction, mockConsole);
	});

	test('sends an ephemeral reply to check DMs', async () => {
		await expect(replyPrivately('yo DMs', true)).resolves.toBeUndefined();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: expect.stringContaining('Check your DMs') as string,
			ephemeral: true,
		});
		expect(mockSendDm).toHaveBeenCalledWith(interaction, 'yo DMs', true);
	});

	test('logs an error if the initial ephemeral reply fails', async () => {
		const testError = new Error('This is a test');
		mockInteractionReply.mockRejectedValueOnce(testError);
		await expect(replyPrivately('yo DMs', true)).resolves.toBeUndefined();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: expect.stringContaining('Check your DMs') as string,
			ephemeral: true,
		});
		expect(mockConsoleError).toHaveBeenCalledOnce();
		expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('to reply'), testError);
		expect(mockSendDm).toHaveBeenCalledWith(interaction, 'yo DMs', true);
	});

	test('logs a notice if the user has DMs turned off', async () => {
		mockSendDm.mockResolvedValueOnce(false);
		await expect(replyPrivately('yo DMs', true)).resolves.toBeUndefined();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: expect.stringContaining('Check your DMs') as string,
			ephemeral: true,
		});
		expect(mockSendDm).toHaveBeenCalledWith(interaction, 'yo DMs', true);
		expect(mockConsoleInfo).toHaveBeenCalledWith(expect.stringContaining('DMs turned off'));
		// TODO: Check also the other flows
	});

	test('edits the previous reply message if deferred, sending a DM with text', async () => {
		interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
		replyPrivately = factory(interaction, mockConsole);

		await expect(replyPrivately('yo DMs', true)).resolves.toBeUndefined();
		expect(mockInteractionEditReply).toHaveBeenCalledWith(
			expect.stringContaining('Check your DMs')
		);
		expect(mockSendDm).toHaveBeenCalledWith(interaction, 'yo DMs', true);
	});

	test('edits the previous reply message if deferred, sending a DM with object', async () => {
		interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
		replyPrivately = factory(interaction, mockConsole);

		await expect(replyPrivately({ content: 'yo DMs' }, true)).resolves.toBeUndefined();
		expect(mockInteractionEditReply).toHaveBeenCalledWith(
			expect.stringContaining('Check your DMs')
		);
		expect(mockSendDm).toHaveBeenCalledWith(interaction, { content: 'yo DMs' }, true);
	});

	test('logs an error if the initial reply edit failed', async () => {
		const testError = new Error('This is a test');
		mockInteractionEditReply.mockRejectedValueOnce(testError);
		interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
		replyPrivately = factory(interaction, mockConsole);

		await expect(replyPrivately({ content: 'yo' }, true)).resolves.toBeUndefined();
		expect(mockInteractionEditReply).toHaveBeenCalledWith(
			expect.stringContaining('Check your DMs')
		);
		expect(mockConsoleError).toHaveBeenCalledOnce();
		expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('edit reply'), testError);
		expect(mockSendDm).toHaveBeenCalledWith(interaction, { content: 'yo' }, true);
	});

	test('sends an ephemeral follow-up message to the interaction if the interaction is deferred', async () => {
		interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
		replyPrivately = factory(interaction, mockConsole);

		await expect(replyPrivately('yo in secret')).resolves.toBeUndefined();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({
			content: 'yo in secret',
			ephemeral: true,
		});
	});

	test('sends an ephemeral follow-up message from options to the interaction if the interaction is deferred', async () => {
		interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
		replyPrivately = factory(interaction, mockConsole);

		await expect(replyPrivately({ content: 'yo object in secret' })).resolves.toBeUndefined();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({
			content: 'yo object in secret',
			ephemeral: true,
		});
	});

	test('logs an error if the ephemeral follow-up message from text failed', async () => {
		const testError = new Error('This is a test');
		mockInteractionFollowUp.mockRejectedValueOnce(testError);
		interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
		replyPrivately = factory(interaction, mockConsole);

		await expect(replyPrivately('yo in secret')).resolves.toBeUndefined();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({
			content: 'yo in secret',
			ephemeral: true,
		});
		expect(mockConsoleError).toHaveBeenCalledOnce();
		expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('follow up'), testError);
	});

	test('logs an error if the ephemeral follow-up message from options failed', async () => {
		const testError = new Error('This is a test');
		mockInteractionFollowUp.mockRejectedValueOnce(testError);
		interaction = { ...interaction, deferred: true } as unknown as CommandInteraction;
		replyPrivately = factory(interaction, mockConsole);

		await expect(replyPrivately({ content: 'yo object in secret' })).resolves.toBeUndefined();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({
			content: 'yo object in secret',
			ephemeral: true,
		});
		expect(mockConsoleError).toHaveBeenCalledOnce();
		expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('follow up'), testError);
	});
});
