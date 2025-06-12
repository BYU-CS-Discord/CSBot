import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { MessageReaction, User } from 'discord.js';

import { buildExecute } from './messageReaction.js';

const mockHandlerExecute = vi.fn<ReactionHandler['execute']>();
const mockReactionHandler = {
	execute: mockHandlerExecute,
};
const testExecute = buildExecute(new Set([mockReactionHandler]));

describe('Reaction duplication', () => {
	let mockReaction: MessageReaction;
	let mockSender: User;

	beforeEach(() => {
		mockReaction = {
			me: false,
			client: {
				user: {
					id: 'itz-meeee',
				},
			},
			message: {
				author: {
					id: 'other-user',
				},
			},
			emoji: {
				name: 'blue_square',
			},
			count: 1,
		} as unknown as MessageReaction;

		mockSender = {
			bot: false,
		} as unknown as User;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('ignores emoji with an empty name', async () => {
		mockReaction.emoji.name = '';
		await testExecute(mockReaction, mockSender);
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});

	test('ignores emoji with a null name', async () => {
		mockReaction.emoji.name = null;
		await testExecute(mockReaction, mockSender);
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});

	test('ignores bot reacts', async () => {
		mockSender.bot = true;
		await testExecute(mockReaction, mockSender);
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});

	test("ignores the bot's own reacts", async () => {
		mockReaction.me = true;
		await testExecute(mockReaction, mockSender);
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});
});
