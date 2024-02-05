import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import type { MessageReaction, User } from 'discord.js';
import { buildExecute } from './messageReaction';

const mockHandlerExecute = vi.fn<[], Promise<void>>();
const mockReactionHandler = {
	execute: mockHandlerExecute,
};
const testExecute = buildExecute(new Set([mockReactionHandler]));

describe('Reaction duplication', () => {
	let mockRandom: MockInstance<[], number>;
	let mockReaction: MessageReaction;
	let mockSender: User;

	beforeEach(() => {
		mockRandom = vi.spyOn(global.Math, 'random').mockReturnValue(1);

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
		mockRandom.mockRestore();
	});

	test('ignores emoji with an empty name', async () => {
		mockReaction.emoji.name = '';
		await expect(testExecute(mockReaction, mockSender)).resolves.toBeUndefined();
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});

	test('ignores emoji with a null name', async () => {
		mockReaction.emoji.name = null;
		await expect(testExecute(mockReaction, mockSender)).resolves.toBeUndefined();
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});

	test('ignores bot reacts', async () => {
		mockSender.bot = true;
		await expect(testExecute(mockReaction, mockSender)).resolves.toBeUndefined();
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});

	test("ignores the bot's own reacts", async () => {
		mockReaction.me = true;
		await expect(testExecute(mockReaction, mockSender)).resolves.toBeUndefined();
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});
});
