import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { RepliableInteraction } from 'discord.js';

vi.mock('../helpers/actions/messages/replyToMessage.js');
import { replyWithPrivateMessage } from '../helpers/actions/messages/replyToMessage.js';
const mockSendDM = replyWithPrivateMessage as Mock<typeof replyWithPrivateMessage>;

// Mock the logger to track output
vi.mock('../logger.js');
import { info as mockLoggerInfo, error as mockLoggerError } from '../logger.js';

import { replyPrivatelyFactory as factory } from './replyPrivately.js';

describe('ephemeral and DM replies', () => {
	mockSendDM.mockResolvedValue(true);
	const mockInteractionReply = vi.fn<RepliableInteraction['reply']>();
	const mockInteractionEditReply = vi.fn<RepliableInteraction['editReply']>();
	const mockInteractionFollowUp = vi.fn<RepliableInteraction['followUp']>();

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
		await replyPrivately('yo DMs', true);
		expect(mockInteractionReply).toHaveBeenCalledWith({
			content: expect.stringContaining('Check your DMs') as string,
			ephemeral: true,
		});
		expect(mockSendDM).toHaveBeenCalledWith(interaction, 'yo DMs', true);
	});

	test('logs an error if the initial ephemeral reply fails', async () => {
		const testError = new Error('This is a test');
		mockInteractionReply.mockRejectedValueOnce(testError);
		await replyPrivately('yo DMs', true);
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
		await replyPrivately('yo DMs', true);
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

		await replyPrivately('yo DMs', true);
		expect(mockInteractionEditReply).toHaveBeenCalledWith(
			expect.stringContaining('Check your DMs')
		);
		expect(mockSendDM).toHaveBeenCalledWith(interaction, 'yo DMs', true);
	});

	test('edits the previous reply message if deferred, sending a DM with object', async () => {
		interaction = { ...interaction, deferred: true } as unknown as RepliableInteraction;
		replyPrivately = factory(interaction);

		await replyPrivately({ content: 'yo DMs' }, true);
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

		await replyPrivately({ content: 'yo' }, true);
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

		await replyPrivately('yo in secret');
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({
			content: 'yo in secret',
			ephemeral: true,
		});
	});

	test('sends an ephemeral follow-up message from options to the interaction if the interaction is deferred', async () => {
		interaction = { ...interaction, deferred: true } as unknown as RepliableInteraction;
		replyPrivately = factory(interaction);

		await replyPrivately({ content: 'yo object in secret' });
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

		await replyPrivately('yo in secret');
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

		await replyPrivately({ content: 'yo object in secret' });
		expect(mockInteractionFollowUp).toHaveBeenCalledWith({
			content: 'yo object in secret',
			ephemeral: true,
		});
		expect(mockLoggerError).toHaveBeenCalledOnce();
		expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('follow up'), testError);
	});
});
