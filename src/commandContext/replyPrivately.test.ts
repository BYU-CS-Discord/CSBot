import type { RepliableInteraction } from 'discord.js';

jest.mock('../helpers/actions/messages/replyToMessage');
import { replyWithPrivateMessage } from '../helpers/actions/messages/replyToMessage';
const mockSendDM = replyWithPrivateMessage as jest.Mock;

// Mock the logger to track output
jest.mock('../logger');
import { info as mockLoggerInfo, error as mockLoggerError } from '../logger';

import { replyPrivatelyFactory as factory } from './replyPrivately';

describe('ephemeral and DM replies', () => {
	mockSendDM.mockResolvedValue(true);
	const mockInteractionReply = jest.fn();
	const mockInteractionEditReply = jest.fn();
	const mockInteractionFollowUp = jest.fn();

	let interaction: RepliableInteraction;
	let replyPrivately: CommandContext['replyPrivately'];

	beforeEach(() => {
		interaction = {
			deferred: false,
			user: { id: 'user-id-1234' },
			reply: mockInteractionReply,
			editReply: mockInteractionEditReply,
			followUp: mockInteractionFollowUp,
		} as unknown as RepliableInteraction;

		replyPrivately = factory(interaction);
	});

	test('sends an ephemeral reply to check DMs', async () => {
		await expect(replyPrivately('yo DMs', true)).resolves.toBeUndefined();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: expect.stringContaining('Check your DMs') as string,
			ephemeral: true,
		});
		expect(mockSendDM).toHaveBeenCalledWith(interaction, 'yo DMs', true);
	});

	test('logs an error if the initial ephemeral reply fails', async () => {
		const testError = new Error('This is a test');
		mockInteractionReply.mockRejectedValueOnce(testError);
		await expect(replyPrivately('yo DMs', true)).resolves.toBeUndefined();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: expect.stringContaining('Check your DMs') as string,
			ephemeral: true,
		});
		expect(mockLoggerError).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('to reply'), testError);
		expect(mockSendDM).toHaveBeenCalledWith(interaction, 'yo DMs', true);
	});

	test('logs a notice if the user has DMs turned off', async () => {
		mockSendDM.mockResolvedValueOnce(false);
		await expect(replyPrivately('yo DMs', true)).resolves.toBeUndefined();
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: expect.stringContaining('Check your DMs') as string,
			ephemeral: true,
		});
		expect(mockSendDM).toHaveBeenCalledWith(interaction, 'yo DMs', true);
		expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('DMs turned off'));
		// TODO: Check also the other flows
	});

	test('edits the previous reply message if deferred, sending a DM with text', async () => {
		interaction = { ...interaction, deferred: true } as unknown as RepliableInteraction;
		replyPrivately = factory(interaction);

		await expect(replyPrivately('yo DMs', true)).resolves.toBeUndefined();
		expect(mockInteractionEditReply).toHaveBeenCalledWith(
			expect.stringContaining('Check your DMs')
		);
		expect(mockSendDM).toHaveBeenCalledWith(interaction, 'yo DMs', true);
	});

	test('edits the previous reply message if deferred, sending a DM with object', async () => {
		interaction = { ...interaction, deferred: true } as unknown as RepliableInteraction;
		replyPrivately = factory(interaction);

		await expect(replyPrivately({ content: 'yo DMs' }, true)).resolves.toBeUndefined();
		expect(mockInteractionEditReply).toHaveBeenCalledWith(
			expect.stringContaining('Check your DMs')
		);
		expect(mockSendDM).toHaveBeenCalledWith(interaction, { content: 'yo DMs' }, true);
	});

	test('logs an error if the initial reply edit failed', async () => {
		const testError = new Error('This is a test');
		mockInteractionEditReply.mockRejectedValueOnce(testError);
		interaction = { ...interaction, deferred: true } as unknown as RepliableInteraction;
		replyPrivately = factory(interaction);

		await expect(replyPrivately({ content: 'yo' }, true)).resolves.toBeUndefined();
		expect(mockInteractionEditReply).toHaveBeenCalledWith(
			expect.stringContaining('Check your DMs')
		);
		expect(mockLoggerError).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('edit reply'), testError);
		expect(mockSendDM).toHaveBeenCalledWith(interaction, { content: 'yo' }, true);
	});

	test('sends an ephemeral follow-up message to the interaction if the interaction is deferred', async () => {
		interaction = { ...interaction, deferred: true } as unknown as RepliableInteraction;
		replyPrivately = factory(interaction);

		await expect(replyPrivately('yo in secret')).resolves.toBeUndefined();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({
			content: 'yo in secret',
			ephemeral: true,
		});
	});

	test('sends an ephemeral follow-up message from options to the interaction if the interaction is deferred', async () => {
		interaction = { ...interaction, deferred: true } as unknown as RepliableInteraction;
		replyPrivately = factory(interaction);

		await expect(replyPrivately({ content: 'yo object in secret' })).resolves.toBeUndefined();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({
			content: 'yo object in secret',
			ephemeral: true,
		});
	});

	test('logs an error if the ephemeral follow-up message from text failed', async () => {
		const testError = new Error('This is a test');
		mockInteractionFollowUp.mockRejectedValueOnce(testError);
		interaction = { ...interaction, deferred: true } as unknown as RepliableInteraction;
		replyPrivately = factory(interaction);

		await expect(replyPrivately('yo in secret')).resolves.toBeUndefined();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({
			content: 'yo in secret',
			ephemeral: true,
		});
		expect(mockLoggerError).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('follow up'), testError);
	});

	test('logs an error if the ephemeral follow-up message from options failed', async () => {
		const testError = new Error('This is a test');
		mockInteractionFollowUp.mockRejectedValueOnce(testError);
		interaction = { ...interaction, deferred: true } as unknown as RepliableInteraction;
		replyPrivately = factory(interaction);

		await expect(replyPrivately({ content: 'yo object in secret' })).resolves.toBeUndefined();
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({
			content: 'yo object in secret',
			ephemeral: true,
		});
		expect(mockLoggerError).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('follow up'), testError);
	});
});
