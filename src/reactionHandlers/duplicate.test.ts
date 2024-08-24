import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { MessageReaction, User } from 'discord.js';

import { duplicate } from './duplicate.js';

// Mock the logger so nothing is printed
vi.mock('../logger.js');

describe('Reaction duplication', () => {
	const mockResendReact = vi.fn<MessageReaction['react']>();

	let mockRandom: MockInstance<typeof Math.random>;
	let mockReaction: MessageReaction;
	let mockSender: User;
	let mockContext: ReactionHandlerContext;

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
			react: mockResendReact,
		} as unknown as MessageReaction;

		mockSender = {
			bot: false,
		} as unknown as User;

		mockContext = {
			reaction: mockReaction,
			user: mockSender,
		};
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("sometimes duplicates a user's react", async () => {
		await duplicate.execute(mockContext);
		expect(mockResendReact).toHaveBeenCalledOnce();
	});

	test("sometimes ignores a user's react", async () => {
		mockRandom.mockReturnValue(0.5);
		await duplicate.execute(mockContext);
		expect(mockResendReact).not.toHaveBeenCalled();
	});

	test('ignores :star:', async () => {
		mockReaction.emoji.name = '⭐';
		await duplicate.execute(mockContext);
		expect(mockResendReact).not.toHaveBeenCalled();
	});
});
